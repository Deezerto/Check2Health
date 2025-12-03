package com.appdev.lastico.check2health.Service;

import com.appdev.lastico.check2health.Entity.Doctor;
import com.appdev.lastico.check2health.Entity.DoctorSchedule;
import com.appdev.lastico.check2health.Repository.DoctorRepository;
import com.appdev.lastico.check2health.Repository.DoctorScheduleRepository;
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
public class DoctorScheduleService {

    private final DoctorScheduleRepository doctorScheduleRepository;
    private final DoctorRepository doctorRepository;

    public DoctorScheduleService(DoctorScheduleRepository doctorScheduleRepository, DoctorRepository doctorRepository) {
        this.doctorScheduleRepository = doctorScheduleRepository;
        this.doctorRepository = doctorRepository;
    }

    public List<DoctorSchedule> getByDoctor(Long doctorId) {
        return doctorScheduleRepository.findByDoctor_DoctorID(doctorId);
    }

    @Transactional
    public List<DoctorSchedule> upsertDoctorWeek(Long doctorId, List<ScheduleDto> week) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Doctor not found"));

        List<DoctorSchedule> saved = new ArrayList<>();
        for (ScheduleDto dto : week) {
            String day = normalize(dto.dayOfWeek());
            DoctorSchedule s = doctorScheduleRepository
                    .findByDoctor_DoctorIDAndDayOfWeekIgnoreCase(doctorId, day)
                    .orElseGet(() -> {
                        DoctorSchedule n = new DoctorSchedule();
                        n.setDoctor(doctor);
                        n.setDayOfWeek(day);
                        return n;
                    });
            s.setActive(dto.isActive());
            s.setStartTime(
                    dto.startTime() != null && !dto.startTime().isBlank() ? LocalTime.parse(dto.startTime()) : null);
            s.setEndTime(dto.endTime() != null && !dto.endTime().isBlank() ? LocalTime.parse(dto.endTime()) : null);
            saved.add(doctorScheduleRepository.save(s));
        }
        return saved;
    }

    public List<DoctorSchedule> allActive() {
        // Simple: return all schedules; frontend filters active
        return doctorScheduleRepository.findAll();
    }

    private String normalize(String d) {
        return d == null ? null : d.trim().toUpperCase(Locale.ROOT);
    }

    public record ScheduleDto(String dayOfWeek, boolean isActive, String startTime, String endTime) {
    }
}
