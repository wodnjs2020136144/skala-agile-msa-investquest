package com.lecture.enrollment.controller;

import com.lecture.enrollment.dto.EnrollmentDto;
import com.lecture.enrollment.service.EnrollmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    /**
     * 여러 주식 구매
     */
    @PostMapping
    public ResponseEntity<
            EnrollmentDto.ApiResponse<
                    List<EnrollmentDto.EnrollmentResponse>
            >
    > enroll(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody EnrollmentDto.EnrollRequest request
    ) {
        List<EnrollmentDto.EnrollmentResponse> responses =
                enrollmentService.enrollAll(
                        userId,
                        request.getItems()
                );

        return ResponseEntity.ok(
                EnrollmentDto.ApiResponse.success(responses)
        );
    }

    /**
     * 사용자 구매 목록 조회
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<
            EnrollmentDto.ApiResponse<
                    List<EnrollmentDto.EnrollmentResponse>
            >
    > getEnrollmentsByUser(
            @PathVariable Long userId
    ) {
        List<EnrollmentDto.EnrollmentResponse> responses =
                enrollmentService.getEnrollmentsByUser(userId);

        return ResponseEntity.ok(
                EnrollmentDto.ApiResponse.success(responses)
        );
    }

    /**
     * 추천 서비스용 투자 이력 조회
     */
    @GetMapping("/user/{userId}/history")
    public ResponseEntity<
            EnrollmentDto.ApiResponse<
                    EnrollmentDto.EnrollmentHistoryResponse
            >
    > getEnrollmentHistory(
            @PathVariable Long userId
    ) {
        EnrollmentDto.EnrollmentHistoryResponse response =
                enrollmentService.getEnrollmentHistory(userId);

        return ResponseEntity.ok(
                EnrollmentDto.ApiResponse.success(response)
        );
    }
}