package com.appdev.lastico.check2health.Service;

import com.appdev.lastico.check2health.Entity.Patient;
import com.appdev.lastico.check2health.Repository.PatientRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.*;

@Service
@Transactional(readOnly = true)
public class PatientService {

    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;

    public PatientService(PatientRepository patientRepository, PasswordEncoder passwordEncoder) {
        this.patientRepository = patientRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public Patient create(Patient patient) {
        if (patient.getEmail() != null && patientRepository.existsByEmailIgnoreCase(patient.getEmail())) {
            throw new ResponseStatusException(CONFLICT, "Email already in use");
        }
        if (patient.getUsername() != null && patientRepository.existsByUsernameIgnoreCase(patient.getUsername())) {
            throw new ResponseStatusException(CONFLICT, "Username already in use");
        }
        patient.setPassword(passwordEncoder.encode(patient.getPassword()));
        return patientRepository.save(patient);
    }

    public List<Patient> findAll() {
        return patientRepository.findAll();
    }

    public Patient findById(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Patient not found"));
    }

    @Transactional
    public Patient update(Long id, Patient updated) {
        Patient existing = findById(id);
        existing.setFirstName(updated.getFirstName());
        existing.setLastName(updated.getLastName());
        existing.setDateOfBirth(updated.getDateOfBirth());
        existing.setAge(updated.getAge());
        existing.setGender(updated.getGender());
        existing.setEmail(updated.getEmail());
        existing.setStreet(updated.getStreet());
        existing.setBarangay(updated.getBarangay());
        existing.setMunicipality(updated.getMunicipality());
        existing.setProvince(updated.getProvince());
        existing.setUsername(updated.getUsername());
        if (updated.getPassword() != null && !updated.getPassword().isBlank()) {
            existing.setPassword(passwordEncoder.encode(updated.getPassword()));
        }
        existing.setPhoneNumber(updated.getPhoneNumber());
        return existing; // managed entity will be flushed
    }

    @Transactional
    public void delete(Long id) {
        if (!patientRepository.existsById(id)) {
            throw new ResponseStatusException(NOT_FOUND, "Patient not found");
        }
        patientRepository.deleteById(id);
    }
}
