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

    /**
     * POST /payments/internal/result - 투자 결과 수신 (Course Service 호출)
     *
     * 3일 후 확정된 수익/손해 결과를 받아 보상금을 지급한다.
     * SUCCESS → 10,000원 / FAILURE → 5,000원
     * users.money 반영은 reward.granted 이벤트로 User Service가 처리한다.
     */
    @PostMapping("/internal/result")
    public ResponseEntity<PaymentDto.InvestmentResultResponse> grantReward(
            @Valid @RequestBody PaymentDto.InvestmentResultRequest request) {

        PaymentDto.InvestmentResultResponse response = paymentService.grantReward(request);
        return ResponseEntity.ok(response);
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
