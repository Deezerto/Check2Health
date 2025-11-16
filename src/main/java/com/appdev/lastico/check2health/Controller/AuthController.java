package com.appdev.lastico.check2health.Controller;

import com.appdev.lastico.check2health.Entity.Patient;
import com.appdev.lastico.check2health.Repository.PatientRepository;
import com.appdev.lastico.check2health.Service.PatientService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.util.Map;
import java.util.Optional;

import static org.springframework.http.HttpStatus.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final PatientService patientService;
    private final PatientRepository patientRepository;

    public AuthController(PatientService patientService, PatientRepository patientRepository) {
        this.patientService = patientService;
        this.patientRepository = patientRepository;
    }

    // Simple patient registration – stores plaintext password (for demo).
    // For production, hash and salt passwords and issue JWT/session.
    @PostMapping("/register-patient")
    public ResponseEntity<Patient> registerPatient(@Valid @RequestBody Patient patient) {
        Patient saved = patientService.create(patient);
        return ResponseEntity.created(URI.create("/api/patients/" + saved.getPatientID())).body(saved);
    }

    public record LoginRequest(String identifier, String password) {}

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody LoginRequest request) {
        if (request == null || request.identifier() == null || request.password() == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Missing credentials");
        }
        String id = request.identifier();
        Optional<Patient> opt = patientRepository.findByUsernameIgnoreCase(id);
        if (opt.isEmpty()) {
            opt = patientRepository.findByEmailIgnoreCase(id);
        }
        Patient patient = opt.orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Invalid credentials"));
        if (patient.getPassword() == null || !patient.getPassword().equals(request.password())) {
            throw new ResponseStatusException(UNAUTHORIZED, "Invalid credentials");
        }
        return Map.of(
                "ok", true,
                "patientId", patient.getPatientID(),
                "firstName", patient.getFirstName(),
                "lastName", patient.getLastName(),
                "username", patient.getUsername()
        );
    }
}
