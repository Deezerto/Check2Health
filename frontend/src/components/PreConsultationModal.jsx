import React from 'react';
import './ProfileModal.css'; // Reusing modal styles

export default function PreConsultationModal({ appointment, open, onClose, onAction }) {
    if (!open || !appointment) return null;

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
                                <span style={{ fontWeight: 'bold', width: '180px' }}>Date of Birth:</span>
                                <span>01/01/2001</span>
                            </div>
                            <div style={{ display: 'flex', borderBottom: '1px solid #e0e0e0', paddingBottom: '8px' }}>
                                <span style={{ fontWeight: 'bold', width: '180px' }}>Gender:</span>
                                <span>Male</span>
                            </div>
                            <div style={{ display: 'flex', borderBottom: '1px solid #e0e0e0', paddingBottom: '8px' }}>
                                <span style={{ fontWeight: 'bold', width: '180px' }}>Known Allergies:</span>
                                <span>Penicillin (causes rash), Peanuts</span>
                            </div>
                            <div style={{ display: 'flex', borderBottom: '1px solid #e0e0e0', paddingBottom: '8px' }}>
                                <span style={{ fontWeight: 'bold', width: '180px' }}>Current Medications:</span>
                                <span>Albuterol Inhaler (as needed), Claritin 10mg (daily)</span>
                            </div>
                            <div style={{ display: 'flex' }}>
                                <span style={{ fontWeight: 'bold', width: '180px' }}>Medical History:</span>
                                <span>Asthma (diagnosed 2010), Seasonal Allergies</span>
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
                            <span style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Reason for Visit:</span>
                            <span>{appointment.reason || "Follow-up on persistent cough"}</span>
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <span style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Reported Symptoms:</span>
                            <ul style={{ margin: '0', paddingLeft: '20px' }}>
                                <li>Cough</li>
                                <li>Fatigue</li>
                                <li>Sore Throat</li>
                            </ul>
                        </div>

                        <div>
                            <span style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Patient's Detailed Description:</span>
                            <p style={{ margin: '0', lineHeight: '1.5' }}>
                                The cough started 3 weeks ago and hasn't improved with over-the-counter medication. It's worse at night and interferes with sleep. I also feel generally tired and have a mild sore throat in the mornings.
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
