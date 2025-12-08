package com.appdev.lastico.check2health.Repository;

import com.appdev.lastico.check2health.Entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Long> {
    Optional<Staff> findByEmailIgnoreCase(String email);
    Optional<Staff> findByUsernameIgnoreCase(String username);
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByUsernameIgnoreCase(String username);
    Optional<Staff> findByResetPasswordToken(String resetPasswordToken);
}
