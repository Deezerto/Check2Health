package com.appdev.lastico.check2health.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GroqRecommendationService {

    @Value("${groq.api.url}")
    private String apiUrl;

    @Value("${groq.api.key}")
    private String apiKey;

    @Value("${groq.api.model}")
    private String model;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public GroqRecommendationService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public String getRecommendation(String symptoms) {
        try {
            // Prepare Headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            // Prepare Request Body
            Map<String, Object> body = new HashMap<>();
            body.put("model", model);
            body.put("temperature", 0.0);

            Map<String, String> systemMessage = new HashMap<>();
            systemMessage.put("role", "system");
            systemMessage.put("content",
                    "You are a medical receptionist. Match the user's symptoms to ONE of these exact roles: [General Practitioner, Dermatologist, Cardiologist, Pediatrician, Neurologist, Orthopedist]. If the input is gibberish, nonsense, or not a symptom, return 'UNKNOWN'. Return ONLY the role name or 'UNKNOWN' as a raw string. Do not add punctuation.");

            Map<String, String> userMessage = new HashMap<>();
            userMessage.put("role", "user");
            userMessage.put("content", symptoms);

            body.put("messages", List.of(systemMessage, userMessage));

            // Execute Request
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            System.out.println("Sending request to Groq API: " + apiUrl);
            ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, request, String.class);

            System.out.println("Groq API Response Status: " + response.getStatusCode());
            System.out.println("Groq API Raw Body: " + response.getBody());

            // Parse Response
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                String content = root.path("choices").get(0).path("message").path("content").asText();
                System.out.println("Extracted Content: " + content);
                return content.trim();
            }

        } catch (Exception e) {
            System.err.println("Groq API Error: " + e.getMessage());
            if (e instanceof org.springframework.web.client.HttpClientErrorException) {
                System.err.println("Response Body: "
                        + ((org.springframework.web.client.HttpClientErrorException) e).getResponseBodyAsString());
            }
            e.printStackTrace();
            // Fallback
        }
        System.out.println("Fallback to General Practitioner triggered.");
        return "General Practitioner";
    }
}
