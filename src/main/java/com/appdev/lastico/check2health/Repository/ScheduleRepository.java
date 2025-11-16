package com.appdev.lastico.check2health.Repository;

import com.appdev.lastico.check2health.Entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findByDoctor_DoctorID(Long doctorId);
    Optional<Schedule> findByDoctor_DoctorIDAndDayOfWeekIgnoreCase(Long doctorId, String dayOfWeek);
}
