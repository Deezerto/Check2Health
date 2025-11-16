package com.appdev.lastico.check2health.Controller;

import com.appdev.lastico.check2health.Entity.Doctor;
import com.appdev.lastico.check2health.Service.DoctorService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    @PostMapping
    public ResponseEntity<Doctor> create(@Valid @RequestBody Doctor doctor) {
        Doctor saved = doctorService.create(doctor);
        return ResponseEntity.created(URI.create("/api/doctors/" + saved.getDoctorID())).body(saved);
    }

    @GetMapping
    public List<Doctor> all() { return doctorService.findAll(); }

    @GetMapping("/{id}")
    public Doctor byId(@PathVariable Long id) { return doctorService.findById(id); }

    @PutMapping("/{id}")
    public Doctor update(@PathVariable Long id, @Valid @RequestBody Doctor doctor) {
        return doctorService.update(id, doctor);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        doctorService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
