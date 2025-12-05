package com.appdev.lastico.check2health.Repository;

import com.appdev.lastico.check2health.Entity.DoctorSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DoctorScheduleRepository extends JpaRepository<DoctorSchedule, Long> {
    List<DoctorSchedule> findByDoctor_DoctorID(Long doctorId);

    Optional<DoctorSchedule> findByDoctor_DoctorIDAndDayOfWeekIgnoreCase(Long doctorId, String dayOfWeek);

    List<DoctorSchedule> findByDoctor_DoctorIDAndSpecificDateBetween(Long doctorId, java.time.LocalDate start,
            java.time.LocalDate end);
}
