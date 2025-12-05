package com.appdev.lastico.check2health.Controller;

import com.appdev.lastico.check2health.Entity.DoctorSchedule;
import com.appdev.lastico.check2health.Service.DoctorScheduleService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schedules")
public class DoctorScheduleController {

    private final DoctorScheduleService doctorScheduleService;

    public DoctorScheduleController(DoctorScheduleService doctorScheduleService) {
        this.doctorScheduleService = doctorScheduleService;
    }

    @GetMapping("/doctor/{doctorId}")
    public List<DoctorSchedule> getForDoctor(@PathVariable Long doctorId,
            @RequestParam(required = false) java.time.LocalDate date) {
        return doctorScheduleService.getByDoctor(doctorId, date);
    }

    @PutMapping("/doctor/{doctorId}")
    public List<DoctorSchedule> upsertForDoctor(@PathVariable Long doctorId,
            @RequestBody List<DoctorScheduleService.ScheduleDto> week,
            @RequestParam(required = false) java.time.LocalDate date) {
        return doctorScheduleService.upsertDoctorWeek(doctorId, week, date);
    }

    @GetMapping
    public List<DoctorSchedule> all() {
        return doctorScheduleService.allActive();
    }
}
