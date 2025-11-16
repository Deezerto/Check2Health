package com.appdev.lastico.check2health.Service;

import com.appdev.lastico.check2health.Entity.Doctor;
import com.appdev.lastico.check2health.Entity.Schedule;
import com.appdev.lastico.check2health.Repository.DoctorRepository;
import com.appdev.lastico.check2health.Repository.ScheduleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@Transactional(readOnly = true)
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final DoctorRepository doctorRepository;

    public ScheduleService(ScheduleRepository scheduleRepository, DoctorRepository doctorRepository) {
        this.scheduleRepository = scheduleRepository;
        this.doctorRepository = doctorRepository;
    }

    public List<Schedule> getByDoctor(Long doctorId) {
        return scheduleRepository.findByDoctor_DoctorID(doctorId);
    }

    @Transactional
    public List<Schedule> upsertDoctorWeek(Long doctorId, List<ScheduleDto> week) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Doctor not found"));

        List<Schedule> saved = new ArrayList<>();
        for (ScheduleDto dto : week) {
            String day = normalize(dto.dayOfWeek());
            Schedule s = scheduleRepository
                    .findByDoctor_DoctorIDAndDayOfWeekIgnoreCase(doctorId, day)
                    .orElseGet(() -> {
                        Schedule n = new Schedule();
                        n.setDoctor(doctor);
                        n.setDayOfWeek(day);
                        return n;
                    });
            s.setActive(dto.active());
            s.setStartTime(dto.startTime() != null && !dto.startTime().isBlank() ? LocalTime.parse(dto.startTime()) : null);
            s.setEndTime(dto.endTime() != null && !dto.endTime().isBlank() ? LocalTime.parse(dto.endTime()) : null);
            saved.add(scheduleRepository.save(s));
        }
        return saved;
    }

    public List<Schedule> allActive() {
        // Simple: return all schedules; frontend filters active
        return scheduleRepository.findAll();
    }

    private String normalize(String d) {
        return d == null ? null : d.trim().toUpperCase(Locale.ROOT);
    }

    public record ScheduleDto(String dayOfWeek, boolean active, String startTime, String endTime) {}
}
