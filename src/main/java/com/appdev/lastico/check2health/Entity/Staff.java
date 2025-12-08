package com.appdev.lastico.check2health.Entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import java.util.Date;

@Entity
@Table(name = "staff")
public class Staff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long staffID;

    @NotBlank
    @Size(max = 60)
    @Column(nullable = false, length = 60)
    private String firstName;

    @NotBlank
    @Size(max = 60)
    @Column(nullable = false, length = 60)
    private String lastName;

    @Size(max = 30)
    @Pattern(regexp = "^[+0-9()\\-\\s]{7,30}$", message = "Invalid phone number")
    private String phoneNumber;

    @Email
    @Size(max = 120)
    @Column(unique = true, length = 120)
    private String email;

    @Size(max = 60)
    @Column(unique = true, length = 60)
    private String username;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Size(min = 8, max = 255)
    private String password;

    @Column(name = "reset_password_token")
    private String resetPasswordToken;

    @Column(name = "reset_password_token_expiry")
    private Date resetPasswordTokenExpiry;

    public Staff() { }

    // Diagram placeholder operations (no-op)
    public void approveReservation() { }
    public void cancelReservation() { }
    public void updateReservationStatus() { }
    public void sendNotifications() { }
    public void manageSchedules() { }
    public void viewPatients() { }

    public Long getStaffID() { return staffID; }
    public void setStaffID(Long staffID) { this.staffID = staffID; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getResetPasswordToken() {
        return resetPasswordToken;
    }

    public void setResetPasswordToken(String resetPasswordToken) {
        this.resetPasswordToken = resetPasswordToken;
    }

    public Date getResetPasswordTokenExpiry() {
        return resetPasswordTokenExpiry;
    }

    public void setResetPasswordTokenExpiry(Date resetPasswordTokenExpiry) {
        this.resetPasswordTokenExpiry = resetPasswordTokenExpiry;
    }
}
