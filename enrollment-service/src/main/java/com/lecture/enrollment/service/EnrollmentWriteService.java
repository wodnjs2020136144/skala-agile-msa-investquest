package com.lecture.enrollment.service;

import com.lecture.enrollment.entity.Enrollment;
import com.lecture.enrollment.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class EnrollmentWriteService {

    private final EnrollmentRepository enrollmentRepository;

    /**
     * 호출한 서비스의 트랜잭션에 참여해 다중 종목 등록을 원자적으로 처리한다.
     */
    @Transactional
    public Enrollment createPendingEnrollment(Long userId, Long courseId, Long purchasePrice, Long quantity, Long investedAmount) {

        Enrollment enrollment = enrollmentRepository.save(
                Enrollment.builder()
                        .userId(userId)
                        .courseId(courseId)
                        .purchasePrice(purchasePrice)
                        .quantity(quantity)
                        .investedAmount(investedAmount)
                        .build()
        );

        log.info("[EnrollmentWriteService] PENDING enrollment 생성 완료 - enrollmentId: {}, userId: {}, courseId: {}",
                enrollment.getId(), userId, courseId);

        return enrollment;
    }
}
