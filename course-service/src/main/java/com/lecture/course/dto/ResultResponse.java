package com.lecture.course.dto;

import java.math.BigDecimal;

public record ResultResponse(
        Result result,
        BigDecimal returnRate,
        BigDecimal profitAmount,
        BigDecimal investedTotal,
        BigDecimal evaluatedTotal
) {
}
