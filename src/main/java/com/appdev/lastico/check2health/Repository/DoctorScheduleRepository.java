package com.appdev.lastico.check2health.Repository;

import com.appdev.lastico.check2health.Entity.DoctorSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DoctorScheduleRepository extends JpaRepository<DoctorSchedule, Long> {
    List<DoctorSchedule> findByDoctor(com.appdev.lastico.check2health.Entity.Doctor doctor);

    List<DoctorSchedule> findByDoctorAndDayOfWeekIgnoreCase(com.appdev.lastico.check2health.Entity.Doctor doctor,
            String dayOfWeek);

    List<DoctorSchedule> findByDoctorAndSpecificDateBetween(com.appdev.lastico.check2health.Entity.Doctor doctor,
            java.time.LocalDate start, java.time.LocalDate end);
}
