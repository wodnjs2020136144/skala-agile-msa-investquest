package com.lecture.payment.service;

import java.math.BigDecimal;

/**
 * 모의 투자 결과에 따른 리워드 정책.
 * 양의 수익률은 10,000P, 손실 또는 0%는 5,000P를 지급한다.
 */
public final class RewardPolicy {

    public static final BigDecimal PROFIT_REWARD_POINTS = BigDecimal.valueOf(10_000);
    public static final BigDecimal BASE_REWARD_POINTS = BigDecimal.valueOf(5_000);
    public static final int REINVESTMENT_DAYS = 3;

    private RewardPolicy() {
    }

    public static BigDecimal pointsFor(BigDecimal returnRate) {
        if (returnRate == null) {
            throw new IllegalArgumentException("수익률은 필수입니다");
        }
        return returnRate.compareTo(BigDecimal.ZERO) > 0
                ? PROFIT_REWARD_POINTS
                : BASE_REWARD_POINTS;
    }
}
