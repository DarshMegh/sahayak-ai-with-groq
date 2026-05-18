package com.sahayak.backend.controller;

import com.sahayak.backend.model.ChatRequest;
import com.sahayak.backend.model.ChatResponse;
import com.sahayak.backend.service.GroqService;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*")
public class ChatController {

    private final GroqService groqService;

    public ChatController(GroqService groqService) {
        this.groqService = groqService;
    }

    @PostMapping("/chat")
    public ChatResponse chat(@RequestBody ChatRequest request) {
        // Pass all new fields to GroqService
        String reply = groqService.chatWithAI(
                request.getMessage(),
                request.getSystemPrompt(),  // emotion-aware prompt from frontend
                request.getEmotion(),       // detected emotion
                request.getLocation()       // user's city
        );
        return new ChatResponse(reply);
    }
}