package com.appdev.lastico.check2health.Controller;

import com.appdev.lastico.check2health.DTO.LoginRequest;
import com.appdev.lastico.check2health.DTO.ResetPasswordRequest;
import com.appdev.lastico.check2health.Entity.Patient;
import com.appdev.lastico.check2health.Security.JwtUtil;
import com.appdev.lastico.check2health.Service.AuthService;
import com.appdev.lastico.check2health.Service.PatientService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Secure Backend is Running!");
    }

    private final PatientService patientService;
    private final AuthService authService;
    private final JwtUtil jwtUtil;

    public AuthController(PatientService patientService, AuthService authService, JwtUtil jwtUtil) {
        this.patientService = patientService;
        this.authService = authService;
        this.jwtUtil = jwtUtil;
    }

    // Simple patient registration – stores plaintext password (for demo).
    // For production, hash and salt passwords and issue JWT/session.
    @PostMapping("/register-patient")
    public ResponseEntity<Patient> registerPatient(@Valid @RequestBody Patient patient) {
        Patient saved = patientService.create(patient);
        URI location = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/patients/{id}")
                .buildAndExpand(saved.getPatientID())
                .toUri();
        return ResponseEntity.created(location).body(saved);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest request, HttpServletResponse response) {
        System.out.println("DEBUG: Login attempt for " + request.identifier());
        Map<String, Object> userData = authService.login(request);
        String role = (String) userData.get("role");

        // Determine subject (prefer email, fallback to username)
        String subject = (String) userData.get("email");
        if (subject == null || subject.isEmpty()) {
            subject = (String) userData.get("username");
        }

        // Fallback if both are empty (should not happen for valid user)
        if (subject == null || subject.isEmpty()) {
            // Use role + ID as fallback? Or throw error.
            // Ideally we shouldn't reach here if login succeeded.
            // Just use role for now or empty string to match old logic?
            // Let's assume validation happened in AuthService.
        }

        String token = jwtUtil.generateToken(subject, role);

        ResponseCookie cookie = ResponseCookie.from("jwt", token)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(24 * 60 * 60)
                .sameSite("None")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(userData);
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(authService.getUserDetails(authentication.getName()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("jwt", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .sameSite("None")
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .build();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> body) {
        authService.forgotPassword(body.get("email"));
        return ResponseEntity
                .ok(Map.of("message", "If an account with this email exists, a password reset link has been sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Password has been reset successfully."));
    }
}