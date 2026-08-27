package com.lecture.payment.service;

import com.lecture.payment.dto.PaymentDto;
import com.lecture.payment.entity.Payment;
import com.lecture.payment.kafka.PaymentKafkaProducer;
import com.lecture.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentKafkaProducer kafkaProducer;

    /** 투자 성공 시 지급액 */
    private static final BigDecimal REWARD_SUCCESS = BigDecimal.valueOf(10000);
    /** 투자 실패 시 지급액 */
    private static final BigDecimal REWARD_FAILURE = BigDecimal.valueOf(5000);

    /**
     * 내부 결제 요청 (Enrollment Service → Payment Service REST 호출)
     * 실습 환경에서는 PG 연동 없이 항상 성공으로 처리
     *
     * 처리 흐름:
     * 1. Payment 생성 (PENDING)
     * 2. PG 결제 처리 (실습: UUID 트랜잭션 ID 발급으로 대체)
     * 3. Payment 상태 → COMPLETED
     * 4. payment.completed 이벤트 발행 → Kafka
     */
    @Transactional
    public PaymentDto.InternalPaymentResult processInternalPayment(
            PaymentDto.InternalPaymentRequest request) {

        log.info("[PaymentService] 결제 요청 - userId: {}, courseId: {}, amount: {}",
                request.getUserId(), request.getCourseId(), request.getAmount());

        Payment payment = paymentRepository.save(
                Payment.builder()
                        .userId(request.getUserId())
                        .courseId(request.getCourseId())
                        .amount(request.getAmount())
                        .build()
        );

        try {
            String transactionId = UUID.randomUUID().toString();

            payment.complete(transactionId);
            log.info("[PaymentService] 결제 완료 처리 - paymentId: {}, transactionId: {}",
                    payment.getId(), transactionId);

            kafkaProducer.publishPaymentCompleted(
                    PaymentKafkaProducer.PaymentCompletedEvent.builder()
                            .paymentId(payment.getId())
                            .userId(request.getUserId())
                            .courseId(request.getCourseId())
                            .status("COMPLETED")
                            .build()
            );

            log.info("[PaymentService] 결제 최종 성공 - paymentId: {}", payment.getId());

            return PaymentDto.InternalPaymentResult.builder()
                    .paymentId(payment.getId())
                    .status("COMPLETED")
                    .build();

        } catch (Exception e) {
            payment.fail();

            log.error("[PaymentService] 결제 실패 - paymentId: {}, userId: {}, courseId: {}, error: {}",
                    payment.getId(),
                    request.getUserId(),
                    request.getCourseId(),
                    e.getMessage(),
                    e);

            return PaymentDto.InternalPaymentResult.builder()
                    .paymentId(payment.getId())
                    .status("FAILED")
                    .build();
        }
    }

    /**
     * 투자 결과 수신 → 보상금 지급 (Course Service → Payment Service REST 호출)
     *
     * 처리 흐름:
     * 1. result 값 검증 (SUCCESS / FAILURE 만 허용)
     * 2. 지급 금액 결정 — SUCCESS: 10,000원 / FAILURE: 5,000원
     * 3. payments 테이블에 지급 기록 생성 (COMPLETED)
     * 4. reward.granted 이벤트 발행 → User Service가 users.money 갱신
     *
     * 금액 결정은 Payment Service의 책임이다.
     * User Service는 규칙을 모른 채 전달받은 amount를 더하기만 한다.
     */
    @Transactional
    public PaymentDto.InvestmentResultResponse grantReward(
            PaymentDto.InvestmentResultRequest request) {

        log.info("[PaymentService] 투자 결과 수신 - userId: {}, courseId: {}, result: {}",
                request.getUserId(), request.getCourseId(), request.getResult());

        // 1) 허용된 값인지 검증
        BigDecimal amount = decideRewardAmount(request.getResult());

        // 2) 지급 기록 생성
        Payment payment = paymentRepository.save(
                Payment.builder()
                        .userId(request.getUserId())
                        .courseId(request.getCourseId())
                        .amount(amount)
                        .build()
        );
        payment.complete(UUID.randomUUID().toString());

        log.info("[PaymentService] 보상금 지급 기록 생성 - paymentId: {}, amount: {}",
                payment.getId(), amount);

        // 3) User Service에 전달 (비동기)
        kafkaProducer.publishRewardGranted(
                PaymentKafkaProducer.RewardGrantedEvent.builder()
                        .paymentId(payment.getId())
                        .userId(request.getUserId())
                        .result(request.getResult())
                        .amount(amount)
                        .build()
        );

        return PaymentDto.InvestmentResultResponse.builder()
                .paymentId(payment.getId())
                .userId(request.getUserId())
                .courseId(request.getCourseId())
                .result(request.getResult())
                .amount(amount)
                .status("GRANTED")
                .build();
    }

    /**
     * 투자 결과에 따른 지급 금액 결정
     * 신규 유입 이벤트이므로 손해(FAILURE)도 위로금 성격으로 지급한다.
     */
    private BigDecimal decideRewardAmount(String result) {
        if ("SUCCESS".equals(result)) {
            return REWARD_SUCCESS;
        }
        if ("FAILURE".equals(result)) {
            return REWARD_FAILURE;
        }
        throw new IllegalArgumentException(
                "투자 결과는 SUCCESS 또는 FAILURE 여야 합니다: " + result);
    }

    /**
     * 결제 단건 조회
     */
    public PaymentDto.PaymentResponse getPayment(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("결제 정보를 찾을 수 없습니다: " + id));
        return PaymentDto.PaymentResponse.from(payment);
    }

    /**
     * 사용자 결제 내역 조회
     */
    public List<PaymentDto.PaymentResponse> getPaymentsByUser(Long userId) {
        return paymentRepository.findByUserId(userId).stream()
                .map(PaymentDto.PaymentResponse::from)
                .collect(Collectors.toList());
    }
}