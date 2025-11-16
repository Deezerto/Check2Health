package com.appdev.lastico.check2health.Controller;

import com.appdev.lastico.check2health.Entity.Patient;
import com.appdev.lastico.check2health.Entity.Doctor;
import com.appdev.lastico.check2health.Repository.PatientRepository;
import com.appdev.lastico.check2health.Repository.DoctorRepository;
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
    private final DoctorRepository doctorRepository;

    public AuthController(PatientService patientService, PatientRepository patientRepository, DoctorRepository doctorRepository) {
        this.patientService = patientService;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
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

        // Try patient by username or email
        Optional<Patient> pOpt = patientRepository.findByUsernameIgnoreCase(id);
        if (pOpt.isEmpty()) {
            pOpt = patientRepository.findByEmailIgnoreCase(id);
        }
        if (pOpt.isPresent()) {
            Patient patient = pOpt.get();
            if (patient.getPassword() != null && patient.getPassword().equals(request.password())) {
                return Map.of(
                        "ok", true,
                        "role", "PATIENT",
                        "patientId", patient.getPatientID(),
                        "firstName", patient.getFirstName(),
                        "lastName", patient.getLastName(),
                        "username", patient.getUsername()
                );
            }
            // If password doesn't match, continue to try doctor (avoid user enumeration)
        }

        // Try doctor by email
        Optional<Doctor> dOpt = doctorRepository.findByEmailIgnoreCase(id);
        if (dOpt.isPresent()) {
            Doctor doctor = dOpt.get();
            if (doctor.getPassword() != null && doctor.getPassword().equals(request.password())) {
                return Map.of(
                        "ok", true,
                        "role", "DOCTOR",
                        "doctorId", doctor.getDoctorID(),
                        "firstName", doctor.getFirstName(),
                        "lastName", doctor.getLastName(),
                        "medicalRole", doctor.getMedicalRole()
                );
            }
        }

        throw new ResponseStatusException(UNAUTHORIZED, "Invalid credentials");
    }

    // Doctor login (email only for demo). Plaintext password comparison.
    @PostMapping("/login-doctor")
    public Map<String, Object> loginDoctor(@RequestBody LoginRequest request) {
        if (request == null || request.identifier() == null || request.password() == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Missing credentials");
        }
        Doctor doctor = doctorRepository.findByEmailIgnoreCase(request.identifier())
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Invalid credentials"));
        if (doctor.getPassword() == null || !doctor.getPassword().equals(request.password())) {
            throw new ResponseStatusException(UNAUTHORIZED, "Invalid credentials");
        }
        return Map.of(
                "ok", true,
                "doctorId", doctor.getDoctorID(),
                "firstName", doctor.getFirstName(),
                "lastName", doctor.getLastName(),
                "medicalRole", doctor.getMedicalRole()
        );
    }
}
