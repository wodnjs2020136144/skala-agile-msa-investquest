package com.lecture.payment.service;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class RewardPolicyTests {

    @Test
    void positiveReturnGetsTenThousandPoints() {
        assertEquals(BigDecimal.valueOf(10_000), RewardPolicy.pointsFor(BigDecimal.valueOf(0.01)));
    }

    @Test
    void lossGetsFiveThousandPoints() {
        assertEquals(BigDecimal.valueOf(5_000), RewardPolicy.pointsFor(BigDecimal.valueOf(-0.01)));
    }

    @Test
    void zeroReturnUsesBaseReward() {
        assertEquals(BigDecimal.valueOf(5_000), RewardPolicy.pointsFor(BigDecimal.ZERO));
    }

    @Test
    void missingReturnRateIsRejected() {
        assertThrows(IllegalArgumentException.class, () -> RewardPolicy.pointsFor(null));
    }
}
