package com.appdev.lastico.check2health.Entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;

@Entity
@Table(name = "doctors")
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long doctorID;

    @NotBlank
    @Size(max = 60)
    @Column(nullable = false, length = 60)
    private String firstName;

    @NotBlank
    @Size(max = 60)
    @Column(nullable = false, length = 60)
    private String lastName;

    @Size(max = 80)
    private String medicalRole;

    @Size(max = 30)
    @Pattern(regexp = "^[+0-9()\\-\\s]{7,30}$", message = "Invalid phone number")
    private String phoneNumber;

    @Email
    @Size(max = 120)
    @Column(unique = true, length = 120)
    private String email;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Size(min = 8, max = 255)
    private String password;

    public Doctor() { }

    // Diagram placeholder operations (no-op)
    public void viewReservations() { }
    public void updateReservationStatus() { }
    public void viewSchedule() { }
    public void sendNotification() { }

    public Long getDoctorID() {
        return doctorID;
    }

    public void setDoctorID(Long doctorID) {
        this.doctorID = doctorID;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getMedicalRole() {
        return medicalRole;
    }

    public void setMedicalRole(String medicalRole) {
        this.medicalRole = medicalRole;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
