package com.appdev.lastico.check2health.Service;

import com.appdev.lastico.check2health.Entity.Doctor;
import com.appdev.lastico.check2health.Entity.Patient;
import com.appdev.lastico.check2health.Entity.Reservation;
import com.appdev.lastico.check2health.Repository.ReservationRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import com.appdev.lastico.check2health.DTO.ConsultationDetailsDTO;
import java.util.List;
import java.util.Map;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final PatientService patientService;
    private final DoctorService doctorService;

    public ReservationService(ReservationRepository reservationRepository,
            PatientService patientService,
            DoctorService doctorService) {
        this.reservationRepository = reservationRepository;
        this.patientService = patientService;
        this.doctorService = doctorService;
    }

    @Transactional
    public Reservation createFromPayload(Map<String, Object> payload) {
        Long patientId = Long.valueOf(payload.get("patientId").toString());
        Long doctorId = Long.valueOf(payload.get("doctorId").toString());

        Patient patient = patientService.findById(patientId);
        Doctor doctor = doctorService.findById(doctorId);

        // Parse ISO 8601 datetime string (e.g., "2024-01-15T14:30:00.000Z")
        String dateStr = payload.get("reservationDate").toString();
        LocalDateTime reservationDate = LocalDateTime.parse(dateStr);

        Reservation reservation = new Reservation();
        reservation.setPatient(patient);
        reservation.setDoctor(doctor);
        reservation.setReservationDate(reservationDate);
        reservation.setReasonForVisit(payload.get("reasonForVisit").toString());
        reservation.setPreConsultationData(payload.get("preConsultationData").toString());
        reservation.setReservationStatus("PENDING");

        return reservationRepository.save(reservation);
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

    public Reservation updateConsultation(Long reservationId, String doctorNotes, String postConsultationData,
            String status) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new EntityNotFoundException("Reservation not found with id " + reservationId));

        if (doctorNotes != null) {
            reservation.setDoctorNotes(doctorNotes);
        }
        if (postConsultationData != null) {
            reservation.setPostConsultationData(postConsultationData);
        }
        if (status != null) {
            reservation.setReservationStatus(status); // e.g., "COMPLETED"
        }

        return reservationRepository.save(reservation);
    }

    // Method to retrieve detailed consultation information for a patient
    public ConsultationDetailsDTO getConsultationDetails(Long reservationId) {
        // Find the reservation by ID, or throw an exception if not found
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new EntityNotFoundException("Reservation not found with id: " + reservationId));

        // Create a new DTO to hold the consultation details
        ConsultationDetailsDTO dto = new ConsultationDetailsDTO();

        // Populate Doctor's Name (e.g., "Dr. John Doe")
        if (reservation.getDoctor() != null) {
            dto.setDoctorName("Dr. " + reservation.getDoctor().getFirstName() + " " + reservation.getDoctor().getLastName());
        } else {
            // Handle cases where doctor might be null, though ideally it shouldn't be for a completed consultation
            dto.setDoctorName("N/A");
        }

        // Populate Consultation Date
        dto.setConsultationDate(reservation.getReservationDate());

        // Populate Patient's Name
        if (reservation.getPatient() != null) {
            dto.setPatientName(reservation.getPatient().getFirstName() + " " + reservation.getPatient().getLastName());
        } else {
            // Handle cases where patient might be null, though ideally it shouldn't be
            dto.setPatientName("N/A");
        }

        // Populate Reason for Visit
        dto.setReasonForVisit(reservation.getReasonForVisit());

        // Populate Doctor's Notes
        dto.setDoctorNotes(reservation.getDoctorNotes());

        // Populate Prescriptions (from postConsultationData, which is expected to contain JSON for prescriptions)
        dto.setPrescriptions(reservation.getPostConsultationData());

        return dto;
    }
}
