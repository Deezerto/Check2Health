import React from 'react';
import './ProfileModal.css'; // Reusing modal styles

export default function AlreadyDeniedModal({ open, onClose }) {
    if (!open) return null;

    return (
        <div className="modal-overlay" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}>
            <div className="modal" style={{
                width: '450px',
                borderRadius: '16px',
                padding: '30px',
                position: 'relative',
                backgroundColor: '#fff',
                boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
            }}>
                {/* Logo Section */}
                <div>
                    <img src="/assets/logo.png" alt="Check Health" style={{ height: '40px' }} />
                </div>

                {/* Text Content */}
                <h2 style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#000',
                    marginBottom: '8px',
                    marginTop: '5px',
                    lineHeight: '1.2'
                }}>
                    Appointment <span style={{ color: '#FF5454' }}>Denied</span>
                </h2>

                <p style={{
                    fontSize: '15px',
                    color: '#000',
                    marginBottom: '5px',
                    marginTop: '5px',
                    lineHeight: '1.5'
                }}>
                    The patient's appointment has already been denied.
                </p>
                <p style={{
                    fontSize: '15px',
                    color: '#FF5454',
                    marginBottom: '30px',
                    marginTop: '0px',
                    lineHeight: '1.5'
                }}>
                    No further actions can be taken on this record.
                </p>

                {/* Action Button */}
                <button
                    onClick={onClose}
                    style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '12px',
                        border: 'none',
                        backgroundColor: '#FF5454',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#FF3B3B'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#FF5454'}
                >
                    Okay
                </button>
            </div>
        </div>
    );
}
