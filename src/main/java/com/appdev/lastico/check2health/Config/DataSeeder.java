package com.appdev.lastico.check2health.Config;

import com.appdev.lastico.check2health.Entity.Doctor;
import com.appdev.lastico.check2health.Entity.Staff;
import com.appdev.lastico.check2health.Repository.DoctorRepository;
import com.appdev.lastico.check2health.Repository.StaffRepository;
import com.appdev.lastico.check2health.Repository.DoctorScheduleRepository;
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
    private final DoctorScheduleRepository doctorScheduleRepository;

    public DataSeeder(DoctorRepository doctorRepository, StaffRepository staffRepository,
            DoctorScheduleRepository doctorScheduleRepository, PasswordEncoder passwordEncoder) {
        this.doctorRepository = doctorRepository;
        this.staffRepository = staffRepository;
        this.doctorScheduleRepository = doctorScheduleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedDoctor();
        seedAdmin();
    }

    private void seedDoctor() {
        // 1. General Practitioners
        createDoctorWithSchedule("demo.doctor@check2health.local", "DemoDoc123!", "Demo", "Doctor",
                "General Practitioner",
                "+63 912 345 6789");
        createDoctorWithSchedule("gp2@check2health.local", "GPPass2!", "John", "Doe", "General Practitioner",
                "+63 912 345 0001");
        createDoctorWithSchedule("gp3@check2health.local", "GPPass3!", "Jane", "Smith", "General Practitioner",
                "+63 912 345 0002");

        // 2. Cardiologist
        createDoctorWithSchedule("cardiologist@check2health.local", "Cardio123!", "Cardio", "Heart", "Cardiologist",
                "+63 912 345 1001");

        // 3. Dermatologist
        createDoctorWithSchedule("dermatologist@check2health.local", "Derma123!", "Derma", "Skin", "Dermatologist",
                "+63 912 345 1002");

        // 4. Pediatrician
        createDoctorWithSchedule("pediatrician@check2health.local", "Pedia123!", "Pedia", "Kid", "Pediatrician",
                "+63 912 345 1003");

        // 5. Neurologist
        createDoctorWithSchedule("neurologist@check2health.local", "Neuro123!", "Neuro", "Brain", "Neurologist",
                "+63 912 345 1004");

        // 6. Orthopedist
        createDoctorWithSchedule("orthopedist@check2health.local", "Ortho123!", "Ortho", "Bone", "Orthopedist",
                "+63 912 345 1005");
    }

    private void createDoctorWithSchedule(String email, String password, String firstName, String lastName, String role,
            String phone) {
        Doctor d;
        if (doctorRepository.existsByEmailIgnoreCase(email)) {
            d = doctorRepository.findByEmailIgnoreCase(email).orElse(null);
        } else {
            d = new Doctor();
            d.setFirstName(firstName);
            d.setLastName(lastName);
            d.setMedicalRole(role);
            d.setPhoneNumber(phone);
            d.setEmail(email);
            d.setPassword(passwordEncoder.encode(password));
            d = doctorRepository.save(d);
        }

        if (d != null) {
            createGenericSchedule(d);
        }
    }

    private void createGenericSchedule(Doctor doctor) {
        // Create generic MONDAY-FRIDAY 9am-5pm schedule if not exists
        String[] days = { "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY" };
        for (String day : days) {
            if (doctorScheduleRepository.findByDoctorAndDayOfWeekIgnoreCase(doctor, day)
                    .isEmpty()) {
                com.appdev.lastico.check2health.Entity.DoctorSchedule s = new com.appdev.lastico.check2health.Entity.DoctorSchedule();
                s.setDoctor(doctor);
                s.setDayOfWeek(day);
                s.setStartTime(java.time.LocalTime.of(9, 0));
                s.setEndTime(java.time.LocalTime.of(17, 0));
                s.setActive(true);
                doctorScheduleRepository.save(s);
            }
        }
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