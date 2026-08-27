package com.lecture.course.client.dto;

public record PaymentRewardRequest(
        Long userId,
        Long courseId,
        String result
) {
}
