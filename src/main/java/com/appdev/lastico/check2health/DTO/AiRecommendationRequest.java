package com.appdev.lastico.check2health.DTO;

public class AiRecommendationRequest {
    private String symptoms;

    public AiRecommendationRequest() {
    }

    public AiRecommendationRequest(String symptoms) {
        this.symptoms = symptoms;
    }

    public String getSymptoms() {
        return symptoms;
    }

    public void setSymptoms(String symptoms) {
        this.symptoms = symptoms;
    }
}
