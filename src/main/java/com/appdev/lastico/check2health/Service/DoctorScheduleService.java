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

    public List<DoctorSchedule> getByDoctor(long doctorId, java.time.LocalDate weekStart) {
        Doctor doctor = doctorRepository.findById(doctorId).orElse(null);
        if (doctor == null)
            return new ArrayList<>();

        if (weekStart == null) {
            return doctorScheduleRepository.findByDoctor(doctor);
        }
        java.time.LocalDate weekEnd = weekStart.plusDays(6);
        return doctorScheduleRepository.findByDoctorAndSpecificDateBetween(doctor, weekStart, weekEnd);
    }

    @Transactional
    public List<DoctorSchedule> upsertDoctorWeek(long doctorId, List<ScheduleDto> week, java.time.LocalDate weekStart) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Doctor not found"));

        List<DoctorSchedule> saved = new ArrayList<>();

        // If weekStart is provided, we are saving for a specific week
        if (weekStart != null) {
            java.time.LocalDate weekEnd = weekStart.plusDays(6);
            List<DoctorSchedule> existing = doctorScheduleRepository
                    .findByDoctorAndSpecificDateBetween(doctor, weekStart, weekEnd);

            for (ScheduleDto dto : week) {
                String day = normalize(dto.dayOfWeek());
                // Calculate the specific date for this day of the week
                int dayIndex = getDayIndex(day); // 0=Monday, 6=Sunday
                if (dayIndex == -1)
                    continue;

                java.time.LocalDate targetDate = weekStart.plusDays(dayIndex);

                DoctorSchedule s = existing.stream()
                        .filter(e -> e.getSpecificDate() != null && e.getSpecificDate().equals(targetDate))
                        .findFirst()
                        .orElseGet(() -> {
                            DoctorSchedule n = new DoctorSchedule();
                            n.setDoctor(doctor);
                            n.setDayOfWeek(day);
                            n.setSpecificDate(targetDate);
                            return n;
                        });

                s.setActive(dto.isActive());
                s.setStartTime(dto.startTime() != null && !dto.startTime().isBlank() ? LocalTime.parse(dto.startTime())
                        : null);
                s.setEndTime(dto.endTime() != null && !dto.endTime().isBlank() ? LocalTime.parse(dto.endTime()) : null);
                saved.add(doctorScheduleRepository.save(s));
            }
        } else {
            // Fallback to old behavior (generic weekly schedule) - or we can decide to
            // deprecate it
            for (ScheduleDto dto : week) {
                String day = normalize(dto.dayOfWeek());
                DoctorSchedule s = doctorScheduleRepository
                        .findByDoctorAndDayOfWeekIgnoreCase(doctor, day)
                        .stream()
                        .findFirst()
                        .orElseGet(() -> {
                            DoctorSchedule n = new DoctorSchedule();
                            n.setDoctor(doctor);
                            n.setDayOfWeek(day);
                            return n;
                        });
                s.setActive(dto.isActive());
                s.setStartTime(
                        dto.startTime() != null && !dto.startTime().isBlank() ? LocalTime.parse(dto.startTime())
                                : null);
                s.setEndTime(dto.endTime() != null && !dto.endTime().isBlank() ? LocalTime.parse(dto.endTime()) : null);
                saved.add(doctorScheduleRepository.save(s));
            }
        }
        return saved;
    }

    public List<DoctorSchedule> allActive() {
        return doctorScheduleRepository.findAll();
    }

    private String normalize(String d) {
        return d == null ? null : d.trim().toUpperCase(Locale.ROOT);
    }

    private int getDayIndex(String day) {
        if (day == null)
            return -1;
        switch (day.toUpperCase()) {
            case "MONDAY":
                return 0;
            case "TUESDAY":
                return 1;
            case "WEDNESDAY":
                return 2;
            case "THURSDAY":
                return 3;
            case "FRIDAY":
                return 4;
            case "SATURDAY":
                return 5;
            case "SUNDAY":
                return 6;
            default:
                return -1;
        }
    }

    public record ScheduleDto(String dayOfWeek, boolean isActive, String startTime, String endTime) {
    }
}
