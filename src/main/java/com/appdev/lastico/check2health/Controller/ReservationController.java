package com.appdev.lastico.check2health.Controller;

import com.appdev.lastico.check2health.Entity.Reservation;
import com.appdev.lastico.check2health.Service.ReservationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @PostMapping
    public ResponseEntity<Reservation> create(@RequestBody Map<String, Object> payload) {
        try {
            Reservation saved = reservationService.createFromPayload(payload);
            URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                    .path("/{id}")
                    .buildAndExpand(saved.getReservationID())
                    .toUri();
            return ResponseEntity.created(location).body(saved);
        } catch (Exception e) {
            e.printStackTrace(); // Log the error for debugging
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping
    public List<Reservation> all() {
        return reservationService.findAll();
    }

    @GetMapping("/{id}")
    public Reservation byId(@PathVariable Long id) {
        return reservationService.findById(id);
    }

    @GetMapping("/patient/{patientId}")
    public List<Reservation> byPatientId(@PathVariable Long patientId) {
        return reservationService.findByPatientId(patientId);
    }

    @GetMapping("/doctor/{doctorId}")
    public List<Reservation> byDoctorId(@PathVariable Long doctorId) {
        return reservationService.findByDoctorId(doctorId);
    }

    @GetMapping("/status/{status}")
    public List<Reservation> byStatus(@PathVariable String status) {
        return reservationService.findByStatus(status);
    }

    @PutMapping("/{id}")
    public Reservation update(@PathVariable Long id, @RequestBody Reservation reservation) {
        return reservationService.update(id, reservation);
    }

    @PatchMapping("/{id}/status")
    public Reservation updateStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        return reservationService.updateStatus(id, status);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        reservationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
