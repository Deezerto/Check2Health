package com.appdev.lastico.check2health.Controller;

import com.appdev.lastico.check2health.Entity.Reservation;
import com.appdev.lastico.check2health.Entity.Patient;
import com.appdev.lastico.check2health.Entity.Doctor;
import com.appdev.lastico.check2health.Service.ReservationService;
import com.appdev.lastico.check2health.Service.PatientService;
import com.appdev.lastico.check2health.Service.DoctorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService reservationService;
    private final PatientService patientService;
    private final DoctorService doctorService;

    public ReservationController(ReservationService reservationService,
                                PatientService patientService,
                                DoctorService doctorService) {
        this.reservationService = reservationService;
        this.patientService = patientService;
        this.doctorService = doctorService;
    }

    @PostMapping
    public ResponseEntity<Reservation> create(@RequestBody Map<String, Object> payload) {
        try {
            Long patientId = Long.valueOf(payload.get("patientId").toString());
            Long doctorId = Long.valueOf(payload.get("doctorId").toString());
            
            Patient patient = patientService.findById(patientId);
            Doctor doctor = doctorService.findById(doctorId);
            
            // Parse ISO 8601 datetime string (e.g., "2024-01-15T14:30:00.000Z")
            String dateStr = payload.get("reservationDate").toString();
            LocalDateTime reservationDate = ZonedDateTime.parse(dateStr, DateTimeFormatter.ISO_DATE_TIME).toLocalDateTime();
            
            Reservation reservation = new Reservation();
            reservation.setPatient(patient);
            reservation.setDoctor(doctor);
            reservation.setReservationDate(reservationDate);
            reservation.setReasonForVisit(payload.get("reasonForVisit").toString());
            reservation.setPreConsultationData(payload.get("preConsultationData").toString());
            reservation.setReservationStatus("PENDING");
            
            Reservation saved = reservationService.create(reservation);
            return ResponseEntity.created(URI.create("/api/reservations/" + saved.getReservationID())).body(saved);
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
