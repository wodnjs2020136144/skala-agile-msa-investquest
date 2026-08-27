package com.lecture.course.client;

import com.lecture.course.client.dto.PaymentRewardRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(
        name = "payment-service-client",
        url = "${service.payment-service.url}"
)
public interface PaymentClient {

    @PostMapping("/api/payments/internal/result")
    void sendResult(@RequestBody PaymentRewardRequest request);
}
