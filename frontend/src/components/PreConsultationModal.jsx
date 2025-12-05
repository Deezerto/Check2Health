import React, { useMemo } from 'react';
import './ProfileModal.css'; // Reusing modal styles

export default function PreConsultationModal({ appointment, open, onClose, onAction }) {
    if (!open || !appointment) return null;

    // Parse the JSON data safely
    const data = useMemo(() => {
        try {
            return JSON.parse(appointment.raw.preConsultationData || '{}')
        } catch (e) {
            console.error("Failed to parse pre-consultation data", e)
            return {}
        }
    }, [appointment]);

    const patient = appointment.raw.patient || {};
    const dob = patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A';

    return (
        <div className="modal-overlay">
            <div className="modal" style={{
                width: '700px',
                borderRadius: '20px',
                padding: '30px',
                position: 'relative',
                backgroundColor: '#fff',
                boxShadow: '0 4px 32px rgba(0,0,0,0.12)',
                maxHeight: '90vh',
                overflowY: 'auto'
            }}>
                {/* Close Button */}
                <button
                    className="modal-close"
                    onClick={onClose}
                    style={{ top: '20px', right: '20px', color: '#2563eb' }}
                >
                    &times;
                </button>

                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                    <img src="/assets/logo.png" alt="Check Health" style={{ height: '50px' }} />
                </div>

                {/* Title */}
                <h2 style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    marginBottom: '5px',
                    color: '#000'
                }}>
                    Pre-Consultation
                </h2>

                {/* Context */}
                <div style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    textAlign: 'left',
                    marginBottom: '20px',
                    color: '#000'
                }}>
                    Appointment: {appointment.name}
                </div>

                {/* Data Containers */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '30px' }}>

                    {/* Box A: Patient Info */}
                    <div style={{
                        backgroundColor: '#F5F5F5',
                        borderRadius: '12px',
                        padding: '20px'
                    }}>
                        <div style={{ display: 'grid', gap: '10px' }}>
                            <div style={{ display: 'flex', borderBottom: '1px solid #e0e0e0', paddingBottom: '8px' }}>
                                <span style={{ fontWeight: 'bold', width: '180px', color: '#000' }}>Date of Birth:</span>
                                <span style={{ color: '#333' }}>{dob}</span>
                            </div>
                            <div style={{ display: 'flex', borderBottom: '1px solid #e0e0e0', paddingBottom: '8px' }}>
                                <span style={{ fontWeight: 'bold', width: '180px', color: '#000' }}>Gender:</span>
                                <span style={{ color: '#333' }}>{patient.gender || 'N/A'}</span>
                            </div>
                            <div style={{ display: 'flex', borderBottom: '1px solid #e0e0e0', paddingBottom: '8px' }}>
                                <span style={{ fontWeight: 'bold', width: '180px', color: '#000' }}>Known Allergies:</span>
                                <span style={{ color: '#333' }}>{data.knownAllergies || 'None'}</span>
                            </div>
                            <div style={{ display: 'flex', borderBottom: '1px solid #e0e0e0', paddingBottom: '8px' }}>
                                <span style={{ fontWeight: 'bold', width: '180px', color: '#000' }}>Current Medications:</span>
                                <span style={{ color: '#333' }}>{data.currentMedications || 'None'}</span>
                            </div>
                            <div style={{ display: 'flex' }}>
                                <span style={{ fontWeight: 'bold', width: '180px', color: '#000' }}>Medical History:</span>
                                <span style={{ color: '#333' }}>{data.medicalHistory || 'None'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Box B: Pre-Consultation Data */}
                    <div style={{
                        backgroundColor: '#F5F5F5',
                        borderRadius: '12px',
                        padding: '20px'
                    }}>
                        <div style={{ marginBottom: '15px' }}>
                            <span style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', color: '#000' }}>Reason for Visit:</span>
                            <span style={{ color: '#333' }}>{appointment.reason || "N/A"}</span>
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <span style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', color: '#000' }}>Reported Symptoms:</span>
                            {/* Check if currentSymptoms is an array or string/null */}
                            {Array.isArray(data.currentSymptoms) && data.currentSymptoms.length > 0 ? (
                                <ul style={{ margin: '0', paddingLeft: '20px', color: '#333' }}>
                                    {data.currentSymptoms.map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                            ) : (
                                <span style={{ color: '#333' }}>None reported</span>
                            )}
                        </div>

                        <div>
                            <span style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', color: '#000' }}>Patient's Detailed Description:</span>
                            <p style={{ margin: '0', lineHeight: '1.5', color: '#333' }}>
                                {data.detailedDescription || 'No description provided.'}
                            </p>
                        </div>
                    </div>

                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button
                        onClick={() => onAction('approve')}
                        style={{
                            width: '100%',
                            padding: '14px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: '#76D65F',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            cursor: 'pointer'
                        }}
                    >
                        Approve Appointment
                    </button>

                    <button
                        onClick={() => onAction('reschedule')}
                        style={{
                            width: '100%',
                            padding: '14px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: '#FF9F43',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            cursor: 'pointer'
                        }}
                    >
                        Reschedule Appointment
                    </button>

                    <button
                        onClick={() => onAction('deny')}
                        style={{
                            width: '100%',
                            padding: '14px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: '#FF5E5E',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            cursor: 'pointer'
                        }}
                    >
                        Deny Appointment
                    </button>
                </div>

            </div>
        </div>
    );
}
