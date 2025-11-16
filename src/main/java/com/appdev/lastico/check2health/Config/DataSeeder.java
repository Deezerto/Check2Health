package com.appdev.lastico.check2health.Config;

import com.appdev.lastico.check2health.Entity.Doctor;
import com.appdev.lastico.check2health.Repository.DoctorRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Seeds a dummy doctor account for local testing.
 * Password stored in plaintext for demo ONLY.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final DoctorRepository doctorRepository;

    public DataSeeder(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    @Override
    public void run(String... args) {
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
        d.setPassword("DemoDoc123!"); // plaintext demo
        doctorRepository.save(d);
    }
}