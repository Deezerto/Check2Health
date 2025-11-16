package com.appdev.lastico.check2health.Service;

import com.appdev.lastico.check2health.Entity.Doctor;
import com.appdev.lastico.check2health.Repository.DoctorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.*;

@Service
@Transactional(readOnly = true)
public class DoctorService {

    private final DoctorRepository doctorRepository;

    public DoctorService(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    @Transactional
    public Doctor create(Doctor doctor) {
        if (doctor.getEmail() != null && doctorRepository.existsByEmailIgnoreCase(doctor.getEmail())) {
            throw new ResponseStatusException(CONFLICT, "Email already in use");
        }
        return doctorRepository.save(doctor);
    }

    public List<Doctor> findAll() { return doctorRepository.findAll(); }

    public Doctor findById(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Doctor not found"));
    }

    @Transactional
    public Doctor update(Long id, Doctor updated) {
        Doctor existing = findById(id);
        existing.setFirstName(updated.getFirstName());
        existing.setLastName(updated.getLastName());
        existing.setMedicalRole(updated.getMedicalRole());
        existing.setPhoneNumber(updated.getPhoneNumber());
        existing.setEmail(updated.getEmail());
        if (updated.getPassword() != null && !updated.getPassword().isBlank()) {
            existing.setPassword(updated.getPassword());
        }
        return existing;
    }

    @Transactional
    public void delete(Long id) {
        if (!doctorRepository.existsById(id)) {
            throw new ResponseStatusException(NOT_FOUND, "Doctor not found");
        }
        doctorRepository.deleteById(id);
    }
}
