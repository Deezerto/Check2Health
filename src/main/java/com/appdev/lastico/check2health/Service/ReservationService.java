package com.appdev.lastico.check2health.Service;

import com.appdev.lastico.check2health.Entity.Reservation;
import com.appdev.lastico.check2health.Repository.ReservationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;

    public ReservationService(ReservationRepository reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    public Reservation create(Reservation reservation) {
        return reservationRepository.save(reservation);
    }

    public List<Reservation> findAll() {
        return reservationRepository.findAll();
    }

    public Reservation findById(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found with id: " + id));
    }

    public List<Reservation> findByPatientId(Long patientId) {
        return reservationRepository.findByPatient_PatientID(patientId);
    }

    public List<Reservation> findByDoctorId(Long doctorId) {
        return reservationRepository.findByDoctor_DoctorID(doctorId);
    }

    public List<Reservation> findByStatus(String status) {
        return reservationRepository.findByReservationStatus(status);
    }

    public List<Reservation> findByPatientIdAndStatus(Long patientId, String status) {
        return reservationRepository.findByPatient_PatientIDAndReservationStatus(patientId, status);
    }

    public Reservation update(Long id, Reservation reservation) {
        Reservation existing = findById(id);
        if (reservation.getReservationDate() != null) {
            existing.setReservationDate(reservation.getReservationDate());
        }
        if (reservation.getReservationStatus() != null) {
            existing.setReservationStatus(reservation.getReservationStatus());
        }
        if (reservation.getReasonForVisit() != null) {
            existing.setReasonForVisit(reservation.getReasonForVisit());
        }
        if (reservation.getPreConsultationData() != null) {
            existing.setPreConsultationData(reservation.getPreConsultationData());
        }
        if (reservation.getDoctor() != null) {
            existing.setDoctor(reservation.getDoctor());
        }
        return reservationRepository.save(existing);
    }

    public void delete(Long id) {
        reservationRepository.deleteById(id);
    }

    public Reservation updateStatus(Long id, String status) {
        Reservation reservation = findById(id);
        reservation.setReservationStatus(status);
        return reservationRepository.save(reservation);
    }
}
