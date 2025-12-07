package com.appdev.lastico.check2health.Config;

import com.appdev.lastico.check2health.Entity.Doctor;
import com.appdev.lastico.check2health.Entity.Staff;
import com.appdev.lastico.check2health.Repository.DoctorRepository;
import com.appdev.lastico.check2health.Repository.StaffRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds a dummy doctor and a default admin account for local testing.
 * Passwords are hashed before saving.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final DoctorRepository doctorRepository;
    private final StaffRepository staffRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(DoctorRepository doctorRepository, StaffRepository staffRepository, PasswordEncoder passwordEncoder) {
        this.doctorRepository = doctorRepository;
        this.staffRepository = staffRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedDoctor();
        seedAdmin();
    }

    private void seedDoctor() {
        String email = "demo.doctor@check2health.local";
        if (doctorRepository.existsByEmailIgnoreCase(email)) {
            return; // already seeded
        }
        Doctor d = new Doctor();
        d.setFirstName("Demo");
        d.setLastName("Doctor");
        d.setMedicalRole("General Practitioner");
        d.setPhoneNumber("+63 912 345 6789");
        d.setEmail(email);
        d.setPassword(passwordEncoder.encode("DemoDoc123!"));
        doctorRepository.save(d);
    }

    private void seedAdmin() {
        String email = "admin@check2health.local";
        if (staffRepository.existsByEmailIgnoreCase(email)) {
            return; // already seeded
        }
        Staff admin = new Staff();
        admin.setFirstName("Admin");
        admin.setLastName("User");
        admin.setEmail(email);
        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode("AdminPass123!"));
        staffRepository.save(admin);
    }
}