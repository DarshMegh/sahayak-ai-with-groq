package com.sahayak.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.*;

@Service
public class GroqService {

    @Value("${groq.api.key}")
    private String apiKey;

    private final String GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String chatWithAI(String userMessage) {
        try {
            RestTemplate restTemplate = new RestTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", userMessage);

            Map<String, Object> body = new HashMap<>();
            body.put("model", "llama-3.3-70b-versatile");
            body.put("messages", List.of(message));
            body.put("max_tokens", 500);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(GROQ_URL, entity, String.class);

            JsonNode root = objectMapper.readTree(response.getBody());
            return root.path("choices").get(0).path("message").path("content").asText();

        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }
}