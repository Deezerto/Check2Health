package com.appdev.lastico.check2health.DTO;

import java.time.LocalDateTime; // Import LocalDateTime for the consultation date

public class ConsultationDetailsDTO {

    private String doctorName;
    private LocalDateTime consultationDate; // Added: Date of the consultation
    private String patientName;            // Added: Name of the patient
    private String reasonForVisit;
    private String doctorNotes;
    private String prescriptions;

    // No-argument constructor
    public ConsultationDetailsDTO() {
    }

    // All-argument constructor (updated to include new fields)
    public ConsultationDetailsDTO(String doctorName, LocalDateTime consultationDate, String patientName,
                                  String reasonForVisit, String doctorNotes, String prescriptions) {
        this.doctorName = doctorName;
        this.consultationDate = consultationDate;
        this.patientName = patientName;
        this.reasonForVisit = reasonForVisit;
        this.doctorNotes = doctorNotes;
        this.prescriptions = prescriptions;
    }

    // Getters and Setters (updated to include new fields)
    public String getDoctorName() {
        return doctorName;
    }

    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }

    public LocalDateTime getConsultationDate() {
        return consultationDate;
    }

    public void setConsultationDate(LocalDateTime consultationDate) {
        this.consultationDate = consultationDate;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public String getReasonForVisit() {
        return reasonForVisit;
    }

    public void setReasonForVisit(String reasonForVisit) {
        this.reasonForVisit = reasonForVisit;
    }

    public String getDoctorNotes() {
        return doctorNotes;
    }

    public void setDoctorNotes(String doctorNotes) {
        this.doctorNotes = doctorNotes;
    }

    public String getPrescriptions() {
        return prescriptions;
    }

    public void setPrescriptions(String prescriptions) {
        this.prescriptions = prescriptions;
    }
}
