package com.lecture.enrollment.service;

import com.lecture.enrollment.dto.EnrollmentDto;
import com.lecture.enrollment.entity.Enrollment;
import com.lecture.enrollment.kafka.EnrollmentKafkaProducer;
import com.lecture.enrollment.kafka.KafkaEvent;
import com.lecture.enrollment.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseServiceClient courseServiceClient;
    private final PaymentServiceClient paymentServiceClient;
    private final EnrollmentKafkaProducer kafkaProducer;
    private final EnrollmentWriteService enrollmentWriteService;

    /**
     * 주식 투자 전체 흐름
     * 1. 주식 존재 확인
     * 2. 중복 투자 확인
     * 3. 주식 가격 조회
     * 4. 투자 금액 계산
     * 5. Enrollment 생성 및 즉시 커밋(PENDING)
     */
    public EnrollmentDto.EnrollmentResponse enroll(
            Long userId,
            Long courseId,
            Long quantity
    ) {
        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException(
                    "구매 주수는 1주 이상이어야 합니다"
            );
        }

        if (!courseServiceClient.existsCourse(courseId)) {
            throw new IllegalArgumentException(
                    "존재하지 않는 주식입니다: " + courseId
            );
        }

        if (enrollmentRepository.existsByUserIdAndCourseId(
                userId,
                courseId
        )) {
            throw new IllegalArgumentException(
                    "이미 구매한 주식입니다"
            );
        }

        // Course Service에서 주식 상세 정보 조회
        Map<String, Object> courseInfo =
                courseServiceClient.getCourse(courseId);

        // API 응답에서 주당 가격 추출
        Long purchasePrice = toLong(
                firstNonNullObject(
                        courseInfo.get("purchasePrice"),
                        courseInfo.get("price"),
                        courseInfo.get("temp_price")
                )
        );

        if (purchasePrice == null || purchasePrice <= 0) {
            throw new IllegalArgumentException(
                    "유효하지 않은 주식 가격입니다"
            );
        }

        // 총 투자금액 = 주당 가격 × 구매 주수
        Long investedAmount;

        try {
            investedAmount = Math.multiplyExact(
                    purchasePrice,
                    quantity
            );
        } catch (ArithmeticException exception) {
            throw new IllegalArgumentException(
                    "투자 금액이 허용 범위를 초과했습니다",
                    exception
            );
        }

        if (investedAmount > 10_000_000L) {
            throw new IllegalArgumentException(
                    "투자 금액은 1,000만 원을 초과할 수 없습니다"
            );
        }

        Enrollment enrollment =
                enrollmentWriteService.createPendingEnrollment(
                        userId,
                        courseId,
                        purchasePrice,
                        quantity,
                        investedAmount
                );

        log.info(
                "[EnrollmentService] 주식 구매 완료 (결제 대기) " +
                        "- enrollmentId: {}",
                enrollment.getId()
        );

        return EnrollmentDto.EnrollmentResponse.from(enrollment);
    }

    /**
     * 수강 활성화
     */
    @Transactional
    public void activateEnrollment(Long userId, Long courseId) {
        Enrollment enrollment = enrollmentRepository
                .findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "수강 정보를 찾을 수 없습니다" +
                                " - userId: " + userId +
                                ", courseId: " + courseId
                ));

        enrollment.activate();

        courseServiceClient.increaseEnrollmentCount(courseId);

        kafkaProducer.publishEnrollmentCompleted(
                KafkaEvent.EnrollmentCompletedEvent.builder()
                        .enrollmentId(enrollment.getId())
                        .userId(userId)
                        .courseId(courseId)
                        .build()
        );

        log.info(
                "[EnrollmentService] 수강 활성화 완료 " +
                        "- enrollmentId: {}",
                enrollment.getId()
        );
    }

    /**
     * 사용자 수강 목록 조회
     * course-service에서 강의 상세 정보를 붙여서 반환
     */
    public List<EnrollmentDto.EnrollmentResponse> getEnrollmentsByUser(
            Long userId
    ) {
        List<Enrollment> enrollments =
                enrollmentRepository.findByUserId(userId);

        return enrollments.stream()
                .map(enrollment -> {
                    Map<String, Object> courseInfo =
                            courseServiceClient.getCourse(
                                    enrollment.getCourseId()
                            );

                    EnrollmentDto.CourseSummary courseSummary =
                            EnrollmentDto.CourseSummary.builder()
                                    .id(toLong(
                                            courseInfo.get("id")
                                    ))
                                    .title(toStringValue(
                                            courseInfo.get("title")
                                    ))
                                    .description(toStringValue(
                                            courseInfo.get("description")
                                    ))
                                    .category(normalizeCategory(
                                            toStringValue(
                                                    courseInfo.get("category")
                                            )
                                    ))
                                    .price(toInteger(
                                            firstNonNullObject(
                                                    courseInfo.get("price"),
                                                    courseInfo.get("purchasePrice"),
                                                    courseInfo.get("temp_price")
                                            )
                                    ))
                                    .thumbnail(toStringValue(
                                            courseInfo.get("thumbnail")
                                    ))
                                    .instructorName(
                                            firstNonNull(
                                                    toStringValue(
                                                            courseInfo.get(
                                                                    "instructorName"
                                                            )
                                                    ),
                                                    toStringValue(
                                                            courseInfo.get(
                                                                    "teacherName"
                                                            )
                                                    ),
                                                    toStringValue(
                                                            courseInfo.get(
                                                                    "instructor_name"
                                                            )
                                                    )
                                            )
                                    )
                                    .enrollmentCount(toInteger(
                                            firstNonNullObject(
                                                    courseInfo.get(
                                                            "enrollmentCount"
                                                    ),
                                                    courseInfo.get(
                                                            "enrollment_count"
                                                    )
                                            )
                                    ))
                                    .build();

                    return EnrollmentDto.EnrollmentResponse.from(
                            enrollment,
                            courseSummary
                    );
                })
                .collect(Collectors.toList());
    }

    /**
     * 수강 이력 조회 - 추천 서비스용
     */
    public EnrollmentDto.EnrollmentHistoryResponse getEnrollmentHistory(
            Long userId
    ) {
        List<Long> activeCourseIds = enrollmentRepository
                .findByUserIdAndStatus(
                        userId,
                        Enrollment.Status.ACTIVE
                )
                .stream()
                .map(Enrollment::getCourseId)
                .collect(Collectors.toList());

        return EnrollmentDto.EnrollmentHistoryResponse.builder()
                .userId(userId)
                .activeCourseIds(activeCourseIds)
                .build();
    }

    private String normalizeCategory(String category) {
        if (category == null) {
            return null;
        }

        return switch (category) {
            case "BACKEND" -> "백엔드";
            case "FRONTEND" -> "프론트엔드";
            case "DEVOPS" -> "DevOps";
            case "DATA" -> "데이터";
            case "AI" -> "AI";
            default -> category;
        };
    }

    private Long toLong(Object value) {
        if (value == null) {
            return null;
        }

        if (value instanceof Number number) {
            return number.longValue();
        }

        return Long.parseLong(value.toString());
    }

    private Integer toInteger(Object value) {
        if (value == null) {
            return null;
        }

        if (value instanceof Number number) {
            return number.intValue();
        }

        return Integer.parseInt(value.toString());
    }

    private String toStringValue(Object value) {
        return value == null ? null : value.toString();
    }

    private String firstNonNull(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }

        return null;
    }

    private Object firstNonNullObject(Object... values) {
        for (Object value : values) {
            if (value != null) {
                return value;
            }
        }

        return null;
    }
}