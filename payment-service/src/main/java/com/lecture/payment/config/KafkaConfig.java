package com.lecture.payment.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    @Value("${kafka.topic.reward-granted}")
    private String rewardGrantedTopic;

    /**
     * reward.granted 토픽 생성
     * - Payment Service가 발행 → User Service가 수신하여 money 갱신
     * - 브로커가 1대이므로 replicas는 1
     */
    @Bean
    public NewTopic rewardGrantedTopic() {
        return TopicBuilder.name(rewardGrantedTopic)
                .partitions(3)
                .replicas(1)
                .build();
    }
}
