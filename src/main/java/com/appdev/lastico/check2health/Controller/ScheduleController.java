package com.appdev.lastico.check2health.Controller;

import com.appdev.lastico.check2health.Entity.Schedule;
import com.appdev.lastico.check2health.Service.ScheduleService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    private final ScheduleService scheduleService;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @GetMapping("/doctor/{doctorId}")
    public List<Schedule> getForDoctor(@PathVariable Long doctorId) {
        return scheduleService.getByDoctor(doctorId);
    }

    @PutMapping("/doctor/{doctorId}")
    public List<Schedule> upsertForDoctor(@PathVariable Long doctorId, @RequestBody List<ScheduleService.ScheduleDto> week) {
        return scheduleService.upsertDoctorWeek(doctorId, week);
    }

    @GetMapping
    public List<Schedule> all() { return scheduleService.allActive(); }
}
