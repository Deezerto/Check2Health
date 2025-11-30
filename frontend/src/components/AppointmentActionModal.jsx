import React from 'react';
import './ProfileModal.css'; // Reusing modal styles

export default function AppointmentActionModal({ appointment, open, onClose, onAction }) {
    if (!open || !appointment) return null;

    return (
        <div className="modal-overlay">
            <div className="modal" style={{
                width: '500px',
                borderRadius: '24px',
                padding: '40px',
                textAlign: 'center',
                position: 'relative',
                backgroundColor: '#fff',
                boxShadow: '0 4px 32px rgba(0,0,0,0.12)'
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
                <div style={{ marginBottom: '5px' }}>
                    <img src="/assets/logo.png" alt="Check Health" style={{ height: '60px' }} />
                </div>

                {/* Title */}
                <h2 style={{
                    fontSize: '22px',
                    fontWeight: 'bold',
                    marginBottom: '20px',
                    marginTop: '5px',
                    color: '#000'
                }}>
                    Pending <span style={{ color: '#2563eb' }}>Appointment</span>
                </h2>

                {/* Reason Section */}
                <div style={{ textAlign: 'left', marginBottom: '30px' }}>
                    <label style={{
                        display: 'block',
                        fontWeight: '600',
                        marginBottom: '8px',
                        color: '#000'
                    }}>
                        Reason
                    </label>
                    <textarea
                        readOnly
                        value={appointment.reason || "No reason provided."}
                        style={{
                            width: '100%',
                            minHeight: '80px',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            resize: 'vertical',
                            fontFamily: 'inherit',
                            fontSize: '1rem'
                        }}
                    />
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
                            backgroundColor: '#8FD974',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            cursor: 'pointer'
                        }}
                    >
                        Approve Appointment
                    </button>

                    <button
                        onClick={() => onAction('view')}
                        style={{
                            width: '100%',
                            padding: '14px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: '#FFD93D',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            cursor: 'pointer'
                        }}
                    >
                        View Pre-Consultation
                    </button>

                    <button
                        onClick={() => onAction('reschedule')}
                        style={{
                            width: '100%',
                            padding: '14px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: '#FF8A3D',
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
                            backgroundColor: '#FF5454',
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
