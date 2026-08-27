package com.lecture.enrollment.dto;

import com.lecture.enrollment.entity.Enrollment;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

public class EnrollmentDto {

    // 주식 투자 요청
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EnrollRequest {

        @NotNull(message = "주식 ID는 필수입니다")
        private Long courseId;

        @NotNull(message = "구매 주수는 필수입니다")
        @Positive(message = "구매 주수는 1주 이상이어야 합니다")
        private Long quantity;

        @NotNull(message = "투자 금액은 필수입니다")
        @Positive(message = "투자 금액은 0보다 커야 합니다")
        private Long investedAmount;
    }

    // 주식 요약 정보
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CourseSummary {
        private Long id;
        private String title;
        private String description;
        private String category;
        private Integer price;
        private String thumbnail;
        private String instructorName;
        private Integer enrollmentCount;
    }

    // 주식 투자 응답
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EnrollmentResponse {
        private Long id;
        private Long userId;
        private Long courseId;
        private Enrollment.Status status;
        private LocalDateTime createdAt;

        private Long quantity;
        private Long investedAmount;

        private CourseSummary course;

        public static EnrollmentResponse from(Enrollment enrollment) {
            return EnrollmentResponse.builder()
                    .id(enrollment.getId())
                    .userId(enrollment.getUserId())
                    .courseId(enrollment.getCourseId())
                    .status(enrollment.getStatus())
                    .createdAt(enrollment.getCreatedAt())
                    .quantity(enrollment.getQuantity())
                    .investedAmount(enrollment.getInvestedAmount())
                    .build();
        }

        public static EnrollmentResponse from(
                Enrollment enrollment,
                CourseSummary course
        ) {
            return EnrollmentResponse.builder()
                    .id(enrollment.getId())
                    .userId(enrollment.getUserId())
                    .courseId(enrollment.getCourseId())
                    .status(enrollment.getStatus())
                    .createdAt(enrollment.getCreatedAt())
                    .quantity(enrollment.getQuantity())
                    .investedAmount(enrollment.getInvestedAmount())
                    .course(course)
                    .build();
        }
    }

    // 추천 서비스용: 수강 이력 조회 응답
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EnrollmentHistoryResponse {
        private Long userId;
        private List<Long> activeCourseIds;
    }

    // 공통 API 응답 래퍼
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ApiResponse<T> {
        private boolean success;
        private String message;
        private T data;

        public static <T> ApiResponse<T> success(T data) {
            return ApiResponse.<T>builder()
                    .success(true)
                    .message("성공")
                    .data(data)
                    .build();
        }

        public static <T> ApiResponse<T> error(String message) {
            return ApiResponse.<T>builder()
                    .success(false)
                    .message(message)
                    .build();
        }
    }
}