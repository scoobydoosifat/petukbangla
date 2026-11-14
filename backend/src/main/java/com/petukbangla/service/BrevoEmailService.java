package com.petukbangla.service;

import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class BrevoEmailService {
    private final RestClient client;
    private final String apiKey;
    private final String senderEmail;
    private final String senderName;
    private final String frontendUrl;

    public BrevoEmailService(
        @Value("${app.brevo.api-key:}") String apiKey,
        @Value("${app.brevo.sender-email:}") String senderEmail,
        @Value("${app.brevo.sender-name:petukbangla}") String senderName,
        @Value("${app.frontend-url}") String frontendUrl
    ) {
        this.client = RestClient.builder().baseUrl("https://api.brevo.com/v3").build();
        this.apiKey = apiKey;
        this.senderEmail = senderEmail;
        this.senderName = senderName;
        this.frontendUrl = frontendUrl;
    }

    public void sendVerification(String recipient, String name, String token) {
        String link = frontendUrl + "/verify-email?token=" + token;
        send(recipient, "Confirm your Petuk Bangla account", "Hello " + safe(name) + ",<br><br>Confirm your account by clicking <a href=\"" + link + "\">this link</a>. This link expires in 24 hours.");
    }

    public void sendPasswordReset(String recipient, String name, String token) {
        String link = frontendUrl + "/reset-password?token=" + token;
        send(recipient, "Change your Petuk Bangla password", "Hello " + safe(name) + ",<br><br>Change your password by clicking <a href=\"" + link + "\">this link</a>. This link expires in 30 minutes.");
    }

    private void send(String recipient, String subject, String html) {
        if (apiKey.isBlank() || senderEmail.isBlank()) throw new IllegalStateException("Brevo email configuration is missing.");
        client.post().uri("/smtp/email").contentType(MediaType.APPLICATION_JSON)
            .header("api-key", apiKey)
            .body(Map.of("sender", Map.of("name", senderName, "email", senderEmail),
                "to", new Object[] { Map.of("email", recipient) }, "subject", subject, "htmlContent", html))
            .retrieve().toBodilessEntity();
    }

    private String safe(String value) { return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;"); }
}
