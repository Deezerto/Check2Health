import React from 'react';
import './ProfileModal.css'; // Reusing modal styles

export default function ApproveConfirmationModal({ appointment, open, onClose, onConfirm }) {
    if (!open || !appointment) return null;

    return (
        <div className="modal-overlay" style={{ backdropFilter: 'blur(5px)' }}>
            <div className="modal" style={{
                width: '420px',
                height: 'auto',
                borderRadius: '15px',
                padding: '30px',
                textAlign: 'center',
                position: 'relative',
                backgroundColor: '#fff',
                boxShadow: '0 4px 32px rgba(0,0,0,0.12)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
            }}>
                {/* Close Button */}
                <button
                    className="modal-close"
                    onClick={onClose}
                    style={{ top: '20px', right: '20px', color: '#2563eb' }}
                >
                    &times;
                </button>

                {/* Top Section: Logo */}
                <div style={{ marginBottom: '10px' }}>
                    <img src="/assets/logo.png" alt="Check Health" style={{ height: '50px' }} />
                </div>

                {/* Title Block */}
                <h2 style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    margin: '0 0 20px 0',
                    color: '#000'
                }}>
                    <span style={{ color: '#7ED957' }}>Approve</span> Appointment?
                </h2>

                {/* Confirmation Details Block */}
                <div style={{ textAlign: 'left', marginBottom: '30px', flex: 1 }}>
                    <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        marginBottom: '5px',
                        color: '#000'
                    }}>
                        Appointment
                    </label>
                    <div style={{
                        border: '1px solid #000',
                        borderRadius: '4px',
                        padding: '15px',
                        fontSize: '14px',
                        lineHeight: '1.4',
                        color: '#000'
                    }}>
                        Approve booking for {appointment.name} with {appointment.doctor} on {appointment.dt}?
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button
                        onClick={onConfirm}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: '#7ED957',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            cursor: 'pointer'
                        }}
                    >
                        Confirm Approval
                    </button>

                    <button
                        onClick={onClose}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: '#FF5454',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
