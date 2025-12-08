package com.appdev.lastico.check2health.Service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendPasswordResetEmail(String to, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Password Reset Request");
        
        // In a real application, you would use a properties file or a database setting for the URL
        String resetUrl = "http://localhost:5173/reset-password?token=" + token;

        message.setText("To reset your password, please click the link below:\n\n" + resetUrl);

        // --- Temporary logging for development ---
        System.out.println("--- PASSWORD RESET ---");
        System.out.println("Sending password reset link to: " + to);
        System.out.println("Reset URL: " + resetUrl);
        System.out.println("----------------------");
        // --- End of temporary logging ---

        mailSender.send(message);
    }
}
