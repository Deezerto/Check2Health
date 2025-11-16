package com.appdev.lastico.check2health.Repository;

import com.appdev.lastico.check2health.Entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    
    List<Reservation> findByPatient_PatientID(Long patientId);
    
    List<Reservation> findByDoctor_DoctorID(Long doctorId);
    
    List<Reservation> findByReservationStatus(String status);
    
    List<Reservation> findByPatient_PatientIDAndReservationStatus(Long patientId, String status);
}
