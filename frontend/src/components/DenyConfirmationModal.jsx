import React from 'react';
import './ProfileModal.css'; // Reusing modal styles

export default function DenyConfirmationModal({ open, onClose, onConfirm }) {
    if (!open) return null;

    return (
        <div className="modal-overlay" style={{ backdropFilter: 'blur(5px)' }}>
            <div className="modal" style={{
                width: '430px',
                height: 'auto',
                borderRadius: '15px',
                padding: '30px',
                textAlign: 'center',
                position: 'relative',
                backgroundColor: '#fff',
                boxShadow: '0 4px 32px rgba(0,0,0,0.12)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
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
                    margin: '0 0 10px 0',
                    color: '#000'
                }}>
                    <span style={{ color: '#FF5454' }}>Deny</span> Appointment?
                </h2>

                {/* Confirmation Message Block */}
                <div style={{ marginBottom: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                    <p style={{
                        color: '#FF0000',
                        fontSize: '16px',
                        fontWeight: 'normal',
                        margin: '0 0 5px 0'
                    }}>
                        Are you sure you want to deny this request?
                    </p>
                    <p style={{
                        color: '#000',
                        fontSize: '14px',
                        margin: '0'
                    }}>
                        The patient will be notified to book a different time.
                    </p>
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
                        Confirm Denial
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
