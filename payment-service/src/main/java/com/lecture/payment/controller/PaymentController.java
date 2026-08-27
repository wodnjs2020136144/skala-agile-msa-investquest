package com.lecture.payment.controller;

import com.lecture.payment.dto.PaymentDto;
import com.lecture.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * POST /payments/internal/request - 내부 결제 요청 (Enrollment Service 호출)
     */
    @PostMapping("/internal/request")
    public ResponseEntity<PaymentDto.InternalPaymentResult> processInternalPayment(
            @RequestBody PaymentDto.InternalPaymentRequest request) {

        PaymentDto.InternalPaymentResult result = paymentService.processInternalPayment(request);
        return ResponseEntity.ok(result);
    }

    /** 게임 결과에 따라 5,000P 또는 10,000P 리워드 재투자를 시작한다. */
    @PostMapping("/internal/rewards")
    public ResponseEntity<PaymentDto.RewardResponse> createReward(
            @Valid @RequestBody PaymentDto.InternalRewardRequest request) {
        return ResponseEntity.ok(paymentService.createReward(request));
    }

    /** 기존 Payment의 생성 시각을 기준으로 3일 재투자와 출금 가능 여부를 확인한다. */
    @GetMapping("/internal/rewards/{paymentId}")
    public ResponseEntity<PaymentDto.RewardResponse> getReward(
            @PathVariable Long paymentId) {
        return ResponseEntity.ok(paymentService.getReward(paymentId));
    }

    /**
     * GET /payments/{id} - 결제 단건 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<PaymentDto.ApiResponse<PaymentDto.PaymentResponse>> getPayment(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                PaymentDto.ApiResponse.success(paymentService.getPayment(id)));
    }

    /**
     * GET /payments/user/{userId} - 사용자 결제 내역 조회
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<PaymentDto.ApiResponse<List<PaymentDto.PaymentResponse>>> getPaymentsByUser(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                PaymentDto.ApiResponse.success(paymentService.getPaymentsByUser(userId)));
    }
}
