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
    private final EnrollmentKafkaProducer kafkaProducer;
    private final EnrollmentWriteService enrollmentWriteService;

    /**
     * 여러 주식을 한 번에 구매
     */
    @Transactional
    public List<EnrollmentDto.EnrollmentResponse> enrollAll(
            Long userId,
            List<EnrollmentDto.EnrollItem> items
    ) {
        if (items == null || items.isEmpty()) {
            throw new IllegalArgumentException(
                    "구매할 주식을 하나 이상 선택해야 합니다"
            );
        }

        return items.stream()
                .map(item -> enroll(
                        userId,
                        item.getCourseId(),
                        item.getQuantity()
                ))
                .collect(Collectors.toList());
    }

    /**
     * 주식 한 종목 구매
     */
    @Transactional
    public EnrollmentDto.EnrollmentResponse enroll(
            Long userId,
            Long courseId,
            Long quantity
    ) {
        if (userId == null) {
            throw new IllegalArgumentException(
                    "사용자 ID는 필수입니다"
            );
        }

        if (courseId == null) {
            throw new IllegalArgumentException(
                    "주식 ID는 필수입니다"
            );
        }

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

        /*
         * 동일한 사용자가 같은 주식을 다시 구매하지 못하게 하는 검증입니다.
         * 추가 매수를 허용하려면 이 부분과 저장 로직을 변경해야 합니다.
         */
        if (enrollmentRepository.existsByUserIdAndCourseId(
                userId,
                courseId
        )) {
            throw new IllegalArgumentException(
                    "이미 구매한 주식입니다: " + courseId
            );
        }

        Map<String, Object> courseInfo =
                courseServiceClient.getCourse(courseId);

        if (courseInfo == null || courseInfo.isEmpty()) {
            throw new IllegalArgumentException(
                    "주식 정보를 조회할 수 없습니다: " + courseId
            );
        }

        Long purchasePrice = toLong(
                firstNonNullObject(
                        courseInfo.get("purchasePrice"),
                        courseInfo.get("price"),
                        courseInfo.get("temp_price")
                )
        );

        if (purchasePrice == null || purchasePrice <= 0) {
            throw new IllegalArgumentException(
                    "유효하지 않은 주식 가격입니다: " + courseId
            );
        }

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
                    "종목별 투자 금액은 1,000만 원을 초과할 수 없습니다"
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
                "[EnrollmentService] 주식 구매 완료 - " +
                        "enrollmentId: {}, userId: {}, " +
                        "courseId: {}, quantity: {}, amount: {}",
                enrollment.getId(),
                userId,
                courseId,
                quantity,
                investedAmount
        );

        return EnrollmentDto.EnrollmentResponse.from(enrollment);
    }

    /**
     * 수강 상태 활성화
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
                "[EnrollmentService] 수강 활성화 완료 - " +
                        "enrollmentId: {}",
                enrollment.getId()
        );
    }

    /**
     * 사용자의 전체 구매 목록 조회
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
                            createCourseSummary(courseInfo);

                    return EnrollmentDto.EnrollmentResponse.from(
                            enrollment,
                            courseSummary
                    );
                })
                .collect(Collectors.toList());
    }

    /**
     * Course Service 응답을 CourseSummary DTO로 변환
     */
    private EnrollmentDto.CourseSummary createCourseSummary(
            Map<String, Object> courseInfo
    ) {
        if (courseInfo == null || courseInfo.isEmpty()) {
            return null;
        }

        return EnrollmentDto.CourseSummary.builder()
                .id(toLong(courseInfo.get("id")))
                .title(toStringValue(
                        courseInfo.get("title")
                ))
                .description(toStringValue(
                        courseInfo.get("description")
                ))
                .category(normalizeCategory(
                        toStringValue(courseInfo.get("category"))
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
                                        courseInfo.get("instructorName")
                                ),
                                toStringValue(
                                        courseInfo.get("teacherName")
                                ),
                                toStringValue(
                                        courseInfo.get("instructor_name")
                                )
                        )
                )
                .enrollmentCount(toInteger(
                        firstNonNullObject(
                                courseInfo.get("enrollmentCount"),
                                courseInfo.get("enrollment_count")
                        )
                ))
                .build();
    }

    /**
     * 추천 서비스용 투자 이력 조회
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