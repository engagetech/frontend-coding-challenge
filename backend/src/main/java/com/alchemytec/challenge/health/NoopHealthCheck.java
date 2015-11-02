package com.alchemytec.challenge.health;

import com.codahale.metrics.health.HealthCheck;

public class NoopHealthCheck extends HealthCheck {
    public NoopHealthCheck() {
    }

    @Override
    protected Result check() throws Exception {
        return Result.healthy();
    }
}