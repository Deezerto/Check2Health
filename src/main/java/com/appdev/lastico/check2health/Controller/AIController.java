package com.appdev.lastico.check2health.Controller;

import com.appdev.lastico.check2health.DTO.AiRecommendationRequest;
import com.appdev.lastico.check2health.DTO.AiRecommendationResponse;
import com.appdev.lastico.check2health.Service.GroqRecommendationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AIController {

    private final GroqRecommendationService recommendationService;

    public AIController(GroqRecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @PostMapping("/recommend")
    public ResponseEntity<AiRecommendationResponse> getRecommendation(@RequestBody AiRecommendationRequest request) {
        String role = recommendationService.getRecommendation(request.getSymptoms());
        return ResponseEntity.ok(new AiRecommendationResponse(role));
    }
}
