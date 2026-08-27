// payment.completed 발행
package com.lecture.payment.kafka;

import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentKafkaProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${kafka.topic.payment-completed}")
    private String paymentCompletedTopic;

    @Value("${kafka.topic.reward-granted}")
    private String rewardGrantedTopic;

    /**
     * payment.completed 이벤트 발행
     * → Enrollment Service가 수신하여 수강 활성화
     *
     * 개발/검증 단계에서는 전송 성공 여부를 즉시 확인하기 위해 동기적으로 기다린다.
     */
    public void publishPaymentCompleted(PaymentCompletedEvent event) {
        log.info("[Kafka Producer] payment.completed 발행 시도 - topic: {}, paymentId: {}, userId: {}, courseId: {}",
                paymentCompletedTopic, event.getPaymentId(), event.getUserId(), event.getCourseId());

        try {
            SendResult<String, Object> result = kafkaTemplate
                    .send(paymentCompletedTopic, String.valueOf(event.getUserId()), event)
                    .get(10, TimeUnit.SECONDS);

            log.info("[Kafka Producer] payment.completed 발행 성공 - topic: {}, partition: {}, offset: {}",
                    paymentCompletedTopic,
                    result.getRecordMetadata().partition(),
                    result.getRecordMetadata().offset());

        } catch (Exception e) {
            log.error("[Kafka Producer] payment.completed 발행 실패 - topic: {}, paymentId: {}, userId: {}, courseId: {}, error: {}",
                    paymentCompletedTopic,
                    event.getPaymentId(),
                    event.getUserId(),
                    event.getCourseId(),
                    e.getMessage(),
                    e);

            throw new RuntimeException("payment.completed Kafka 발행 실패", e);
        }
    }

    /**
     * reward.granted 이벤트 발행
     * → User Service가 수신하여 users.money 갱신
     *
     * 금액(amount)은 Payment Service가 이미 결정해서 담아 보낸다.
     * User Service는 규칙을 몰라도 되고, 받은 금액을 더하기만 하면 된다.
     */
    public void publishRewardGranted(RewardGrantedEvent event) {
        log.info("[Kafka Producer] reward.granted 발행 시도 - topic: {}, userId: {}, result: {}, amount: {}",
                rewardGrantedTopic, event.getUserId(), event.getResult(), event.getAmount());

        try {
            SendResult<String, Object> result = kafkaTemplate
                    .send(rewardGrantedTopic, String.valueOf(event.getUserId()), event)
                    .get(10, TimeUnit.SECONDS);

            log.info("[Kafka Producer] reward.granted 발행 성공 - topic: {}, partition: {}, offset: {}",
                    rewardGrantedTopic,
                    result.getRecordMetadata().partition(),
                    result.getRecordMetadata().offset());

        } catch (Exception e) {
            log.error("[Kafka Producer] reward.granted 발행 실패 - topic: {}, userId: {}, result: {}, error: {}",
                    rewardGrantedTopic,
                    event.getUserId(),
                    event.getResult(),
                    e.getMessage(),
                    e);

            throw new RuntimeException("reward.granted Kafka 발행 실패", e);
        }
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PaymentCompletedEvent {
        private Long paymentId;
        private Long userId;
        private Long courseId;
        private String status;
    }

    /**
     * Payment Service → User Service
     * 보상금 지급 이벤트
     */
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RewardGrantedEvent {
        private Long paymentId;      // 중복 지급 방지용 키
        private Long userId;         // 누구에게
        private String result;       // SUCCESS | FAILURE (표시·로그용)
        private BigDecimal amount;   // 실제로 더할 금액
    }
}