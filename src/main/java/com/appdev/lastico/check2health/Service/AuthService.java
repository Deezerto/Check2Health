package com.appdev.lastico.check2health.Service;

import com.appdev.lastico.check2health.DTO.LoginRequest;
import com.appdev.lastico.check2health.Entity.Doctor;
import com.appdev.lastico.check2health.Entity.Patient;
import com.appdev.lastico.check2health.Entity.Staff;
import com.appdev.lastico.check2health.Repository.DoctorRepository;
import com.appdev.lastico.check2health.Repository.PatientRepository;
import com.appdev.lastico.check2health.Repository.StaffRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;
import static org.springframework.security.web.context.HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY;

@Service
public class AuthService {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final StaffRepository staffRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public AuthService(PatientRepository patientRepository, DoctorRepository doctorRepository,
            StaffRepository staffRepository, PasswordEncoder passwordEncoder, EmailService emailService) {
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.staffRepository = staffRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    public Map<String, Object> login(LoginRequest request) {
        if (request == null || request.identifier() == null || request.password() == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Missing credentials");
        }
        String id = request.identifier();

        // Try to find a patient by username OR email first.
        Optional<Patient> pOpt = patientRepository.findByUsernameIgnoreCase(id)
                .or(() -> patientRepository.findByEmailIgnoreCase(id));

        if (pOpt.isPresent()) {
            Patient patient = pOpt.get();
            if (patient.getPassword() != null && passwordEncoder.matches(request.password(), patient.getPassword())) {
                // Patient found and password is correct.
                Map<String, Object> response = new HashMap<>();
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
                throw new ResponseStatusException(UNAUTHORIZED, "Invalid credentials");
            }
        }

        // No patient found with that identifier, now try to find a doctor by email.
        Optional<Doctor> dOpt = doctorRepository.findByEmailIgnoreCase(id);
        if (dOpt.isPresent()) {
            Doctor doctor = dOpt.get();
            if (doctor.getPassword() != null && passwordEncoder.matches(request.password(), doctor.getPassword())) {
                return Map.of(
                        "ok", true,
                        "role", "DOCTOR",
                        "doctorId", doctor.getDoctorID(),
                        "firstName", doctor.getFirstName(),
                        "lastName", doctor.getLastName(),
                        "email", doctor.getEmail() != null ? doctor.getEmail() : "",
                        "medicalRole", doctor.getMedicalRole() != null ? doctor.getMedicalRole() : "");
            } else {
                throw new ResponseStatusException(UNAUTHORIZED, "Invalid credentials");
            }
        }

        // Check for Staff
        Optional<Staff> sOpt = staffRepository.findByEmailIgnoreCase(id);
        if (sOpt.isPresent()) {
            Staff s = sOpt.get();
            if (s.getPassword() != null && passwordEncoder.matches(request.password(), s.getPassword())) {
                String role = "STAFF";
                if ("admin@check2health.local".equalsIgnoreCase(s.getEmail())) {
                    role = "ADMIN";
                }

                return Map.of(
                        "ok", true,
                        "role", role,
                        "staffId", s.getStaffID(),
                        "firstName", s.getFirstName(),
                        "lastName", s.getLastName(),
                        "email", s.getEmail() != null ? s.getEmail() : "",
                        "username", s.getUsername() != null ? s.getUsername() : "");
            } else {
                throw new ResponseStatusException(UNAUTHORIZED, "Invalid credentials");
            }
        }

        // If we reach here, no user was found at all with the given identifier.
        throw new ResponseStatusException(UNAUTHORIZED, "Invalid credentials");
    }

    public Map<String, Object> getUserDetails(String identifier) {
        // Try patient
        Optional<Patient> pOpt = patientRepository.findByEmailIgnoreCase(identifier); // JWT subject is email
        if (pOpt.isPresent()) {
            Patient patient = pOpt.get();
            Map<String, Object> response = new HashMap<>();
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
        }

        // Try doctor
        Optional<Doctor> dOpt = doctorRepository.findByEmailIgnoreCase(identifier);
        if (dOpt.isPresent()) {
            Doctor doctor = dOpt.get();
            return Map.of(
                    "ok", true,
                    "role", "DOCTOR",
                    "doctorId", doctor.getDoctorID(),
                    "firstName", doctor.getFirstName(),
                    "lastName", doctor.getLastName(),
                    "email", doctor.getEmail() != null ? doctor.getEmail() : "",
                    "medicalRole", doctor.getMedicalRole() != null ? doctor.getMedicalRole() : "");
        }

        // Try staff
        Optional<Staff> sOpt = staffRepository.findByEmailIgnoreCase(identifier);
        if (sOpt.isPresent()) {
            Staff s = sOpt.get();
            String role = "STAFF";
            if ("admin@check2health.local".equalsIgnoreCase(s.getEmail())) {
                role = "ADMIN";
            }
            return Map.of(
                    "ok", true,
                    "role", role,
                    "staffId", s.getStaffID(),
                    "firstName", s.getFirstName(),
                    "lastName", s.getLastName(),
                    "email", s.getEmail() != null ? s.getEmail() : "",
                    "username", s.getUsername() != null ? s.getUsername() : "");
        }

        throw new ResponseStatusException(UNAUTHORIZED, "User not found");
    }

    public void forgotPassword(String email) {
        String token = UUID.randomUUID().toString();
        Date expiryDate = new Date(System.currentTimeMillis() + 3600_000); // 1 hour

        Optional<Patient> pOpt = patientRepository.findByEmailIgnoreCase(email);
        if (pOpt.isPresent()) {
            Patient patient = pOpt.get();
            patient.setResetPasswordToken(token);
            patient.setResetPasswordTokenExpiry(expiryDate);
            patientRepository.save(patient);
            emailService.sendPasswordResetEmail(patient.getEmail(), token);
            return;
        }

        Optional<Doctor> dOpt = doctorRepository.findByEmailIgnoreCase(email);
        if (dOpt.isPresent()) {
            Doctor doctor = dOpt.get();
            doctor.setResetPasswordToken(token);
            doctor.setResetPasswordTokenExpiry(expiryDate);
            doctorRepository.save(doctor);
            emailService.sendPasswordResetEmail(doctor.getEmail(), token);
            return;
        }

        Optional<Staff> sOpt = staffRepository.findByEmailIgnoreCase(email);
        if (sOpt.isPresent()) {
            Staff staff = sOpt.get();
            staff.setResetPasswordToken(token);
            staff.setResetPasswordTokenExpiry(expiryDate);
            staffRepository.save(staff);
            emailService.sendPasswordResetEmail(staff.getEmail(), token);
        }

        // We don't throw an error if the user is not found to prevent email
        // enumeration.
    }

    public void resetPassword(String token, String newPassword) {
        Optional<Patient> pOpt = patientRepository.findByResetPasswordToken(token);
        if (pOpt.isPresent()) {
            Patient p = pOpt.get();
            if (p.getResetPasswordTokenExpiry().before(new Date())) {
                throw new ResponseStatusException(BAD_REQUEST, "Token has expired.");
            }
            p.setPassword(passwordEncoder.encode(newPassword));
            p.setResetPasswordToken(null);
            p.setResetPasswordTokenExpiry(null);
            patientRepository.save(p);
            return;
        }

        Optional<Doctor> dOpt = doctorRepository.findByResetPasswordToken(token);
        if (dOpt.isPresent()) {
            Doctor d = dOpt.get();
            if (d.getResetPasswordTokenExpiry().before(new Date())) {
                throw new ResponseStatusException(BAD_REQUEST, "Token has expired.");
            }
            d.setPassword(passwordEncoder.encode(newPassword));
            d.setResetPasswordToken(null);
            d.setResetPasswordTokenExpiry(null);
            doctorRepository.save(d);
            return;
        }

        Optional<Staff> sOpt = staffRepository.findByResetPasswordToken(token);
        if (sOpt.isPresent()) {
            Staff s = sOpt.get();
            if (s.getResetPasswordTokenExpiry().before(new Date())) {
                throw new ResponseStatusException(BAD_REQUEST, "Token has expired.");
            }
            s.setPassword(passwordEncoder.encode(newPassword));
            s.setResetPasswordToken(null);
            s.setResetPasswordTokenExpiry(null);
            staffRepository.save(s);
            return;
        }

        throw new ResponseStatusException(BAD_REQUEST, "Invalid token.");
    }
}