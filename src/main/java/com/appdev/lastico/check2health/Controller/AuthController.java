package com.appdev.lastico.check2health.Controller;

import com.appdev.lastico.check2health.DTO.LoginRequest;
import com.appdev.lastico.check2health.Entity.Patient;
import com.appdev.lastico.check2health.Service.AuthService;
import com.appdev.lastico.check2health.Service.PatientService;
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
    public Map<String, Object> login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }
}
