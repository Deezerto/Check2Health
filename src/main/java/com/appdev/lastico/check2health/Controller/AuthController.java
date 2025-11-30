package com.appdev.lastico.check2health.Controller;

import com.appdev.lastico.check2health.Entity.Patient;
import com.appdev.lastico.check2health.Entity.Doctor;
import com.appdev.lastico.check2health.Repository.PatientRepository;
import com.appdev.lastico.check2health.Repository.DoctorRepository;
import com.appdev.lastico.check2health.Entity.Staff;
import com.appdev.lastico.check2health.Repository.StaffRepository;
import com.appdev.lastico.check2health.Service.PatientService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

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
    private final StaffRepository staffRepository;

    public AuthController(PatientService patientService, PatientRepository patientRepository,
            DoctorRepository doctorRepository, StaffRepository staffRepository) {
        this.patientService = patientService;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.staffRepository = staffRepository;
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

    public record LoginRequest(String identifier, String password) {
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody LoginRequest request) {
        if (request == null || request.identifier() == null || request.password() == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Missing credentials");
        }
        String id = request.identifier();

        // Try to find a patient by username OR email first.
        Optional<Patient> pOpt = patientRepository.findByUsernameIgnoreCase(id)
                .or(() -> patientRepository.findByEmailIgnoreCase(id));

        if (pOpt.isPresent()) {
            // A patient account exists with this identifier. This check must be final.
            Patient patient = pOpt.get();
            if (patient.getPassword() != null && patient.getPassword().equals(request.password())) {
                // Patient found and password is correct.
                Map<String, Object> response = new java.util.HashMap<>();
                response.put("ok", true);
                response.put("role", "PATIENT");
                response.put("patientId", patient.getPatientID());
                response.put("firstName", patient.getFirstName());
                response.put("lastName", patient.getLastName());
                response.put("username", patient.getUsername());
                response.put("email", patient.getEmail() != null ? patient.getEmail() : "");
                response.put("phoneNumber", patient.getPhoneNumber() != null ? patient.getPhoneNumber() : "");
                response.put("dateOfBirth",
                        patient.getDateOfBirth() != null ? patient.getDateOfBirth().toString() : "");
                response.put("street", patient.getStreet() != null ? patient.getStreet() : "");
                response.put("barangay", patient.getBarangay() != null ? patient.getBarangay() : "");
                response.put("municipality", patient.getMunicipality() != null ? patient.getMunicipality() : "");
                response.put("province", patient.getProvince() != null ? patient.getProvince() : "");
                return response;
            } else {
                // Patient found, but password incorrect. Fail fast.
                throw new ResponseStatusException(UNAUTHORIZED, "Invalid credentials");
            }
        }

        // No patient found with that identifier, now try to find a doctor by email.
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
                        "email", doctor.getEmail() != null ? doctor.getEmail() : "",
                        "medicalRole", doctor.getMedicalRole() != null ? doctor.getMedicalRole() : "");
            } else {
                // Doctor found, but password incorrect. Fail fast.
                throw new ResponseStatusException(UNAUTHORIZED, "Invalid credentials");
            }
        }

        // Check for Staff
        Optional<Staff> sOpt = staffRepository.findByEmailIgnoreCase(id);
        if (sOpt.isPresent()) {
            Staff staff = sOpt.get();
            if (staff.getPassword() != null && staff.getPassword().equals(request.password())) {
                return Map.of(
                        "ok", true,
                        "role", "STAFF",
                        "staffId", staff.getStaffID(),
                        "firstName", staff.getFirstName(),
                        "lastName", staff.getLastName(),
                        "email", staff.getEmail() != null ? staff.getEmail() : "",
                        "username", staff.getUsername() != null ? staff.getUsername() : "");
            } else {
                throw new ResponseStatusException(UNAUTHORIZED, "Invalid credentials");
            }
        }

        // If we reach here, no user was found at all with the given identifier.
        throw new ResponseStatusException(UNAUTHORIZED, "Invalid credentials");
    }
}
