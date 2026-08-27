package com.lecture.user.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserKafkaConsumer {

    /**
     * reward.granted 이벤트 수신
     * → Payment Service가 보상금 지급을 확정한 뒤 발행한다.
     * → 여기서 users.money 를 갱신한다. (현재는 수신 확인 단계라 로그만 남긴다)
     *
     * payment-service가 JsonSerializer + type header 미포함으로 발행하므로
     * 특정 DTO 타입으로 바로 받지 못하고 Map<String, Object> 로 받아 처리한다.
     */
    @KafkaListener(
            topics = "${kafka.topic.reward-granted}",
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleRewardGranted(Map<String, Object> event) {
        log.info("[Kafka Consumer] reward.granted raw event 수신: {}", event);

        try {
            Object userIdValue = event.get("userId");
            Object amountValue = event.get("amount");

            if (userIdValue == null || amountValue == null) {
                throw new IllegalArgumentException("Kafka 이벤트에 userId 또는 amount가 없습니다.");
            }

            Long userId = ((Number) userIdValue).longValue();
            BigDecimal amount = new BigDecimal(amountValue.toString());
            String result = (String) event.get("result");
            Object paymentId = event.get("paymentId");

            log.info("[Kafka Consumer] 파싱 완료 - paymentId: {}, userId: {}, result: {}, amount: {}",
                    paymentId, userId, result, amount);

            // TODO: users.money 갱신 (다음 단계에서 UserService 호출)

        } catch (Exception e) {
            log.error("[Kafka Consumer] 보상금 처리 실패 - event: {}, error: {}",
                    event, e.getMessage(), e);
        }
    }
}
