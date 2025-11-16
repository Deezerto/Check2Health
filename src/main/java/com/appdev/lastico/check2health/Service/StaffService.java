package com.appdev.lastico.check2health.Service;

import com.appdev.lastico.check2health.Entity.Staff;
import com.appdev.lastico.check2health.Repository.StaffRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.*;

@Service
@Transactional(readOnly = true)
public class StaffService {

    private final StaffRepository staffRepository;

    public StaffService(StaffRepository staffRepository) {
        this.staffRepository = staffRepository;
    }

    @Transactional
    public Staff create(Staff staff) {
        if (staff.getEmail() != null && staffRepository.existsByEmailIgnoreCase(staff.getEmail())) {
            throw new ResponseStatusException(CONFLICT, "Email already in use");
        }
        if (staff.getUsername() != null && staffRepository.existsByUsernameIgnoreCase(staff.getUsername())) {
            throw new ResponseStatusException(CONFLICT, "Username already in use");
        }
        return staffRepository.save(staff);
    }

    public List<Staff> findAll() { return staffRepository.findAll(); }

    public Staff findById(Long id) {
        return staffRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Staff not found"));
    }

    @Transactional
    public Staff update(Long id, Staff updated) {
        Staff existing = findById(id);
        existing.setFirstName(updated.getFirstName());
        existing.setLastName(updated.getLastName());
        existing.setPhoneNumber(updated.getPhoneNumber());
        existing.setEmail(updated.getEmail());
        existing.setUsername(updated.getUsername());
        if (updated.getPassword() != null && !updated.getPassword().isBlank()) {
            existing.setPassword(updated.getPassword());
        }
        return existing;
    }

    @Transactional
    public void delete(Long id) {
        if (!staffRepository.existsById(id)) {
            throw new ResponseStatusException(NOT_FOUND, "Staff not found");
        }
        staffRepository.deleteById(id);
    }
}
