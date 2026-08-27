package com.lecture.course.client.dto;

import com.lecture.course.dto.Result;

public record PaymentRewardRequest(
        Long userId,
        Result result
) {
}
