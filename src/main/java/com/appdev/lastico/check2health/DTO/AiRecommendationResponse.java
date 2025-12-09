package com.appdev.lastico.check2health.DTO;

public class AiRecommendationResponse {
    private String recommendedRole;

    public AiRecommendationResponse() {
    }

    public AiRecommendationResponse(String recommendedRole) {
        this.recommendedRole = recommendedRole;
    }

    public String getRecommendedRole() {
        return recommendedRole;
    }

    public void setRecommendedRole(String recommendedRole) {
        this.recommendedRole = recommendedRole;
    }
}
