package com.sahayak.backend.controller;

import com.sahayak.backend.model.ChatRequest;
import com.sahayak.backend.model.ChatResponse;
import com.sahayak.backend.service.GroqService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/chat")
public class ChatController {

    @Autowired
    private GroqService groqService;

    @PostMapping
    public ChatResponse chat(@RequestBody ChatRequest request) {
        String userMessage = request.getMessage();
        String aiResponse = groqService.chatWithAI(userMessage);
        return new ChatResponse(aiResponse);
    }
}