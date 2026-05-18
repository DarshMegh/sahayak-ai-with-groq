package com.sahayak.backend.model;

public class ChatRequest {
    private String message;
    private String systemPrompt;  // NEW — emotion-aware prompt from frontend
    private String emotion;        // NEW — detected emotion (happy/sad/angry etc.)
    private String location;       // NEW — user's city name

    // ── Getters & Setters ──────────────────────────────────
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getSystemPrompt() { return systemPrompt; }
    public void setSystemPrompt(String systemPrompt) { this.systemPrompt = systemPrompt; }

    public String getEmotion() { return emotion; }
    public void setEmotion(String emotion) { this.emotion = emotion; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
}
