package com.appdev.lastico.check2health.Controller;

import com.appdev.lastico.check2health.DTO.LoginRequest;
import com.appdev.lastico.check2health.DTO.ResetPasswordRequest;
import com.appdev.lastico.check2health.Entity.Patient;
import com.appdev.lastico.check2health.Service.AuthService;
import com.appdev.lastico.check2health.Service.PatientService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final PatientService patientService;
    private final AuthService authService;

    public AuthController(PatientService patientService, AuthService authService) {
        this.patientService = patientService;
        this.authService = authService;
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
    public Map<String, Object> login(@RequestBody LoginRequest request, HttpServletRequest httpServletRequest) {
        return authService.login(request, httpServletRequest);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> body) {
        authService.forgotPassword(body.get("email"));
        return ResponseEntity.ok(Map.of("message", "If an account with this email exists, a password reset link has been sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Password has been reset successfully."));
    }
}