import React from 'react';
import './ProfileModal.css'; // Reusing modal styles

export default function RescheduleModal({ appointment, open, onClose, onConfirm }) {
    if (!open || !appointment) return null;

    return (
        <div className="modal-overlay">
            <div className="modal" style={{
                width: '500px',
                borderRadius: '15px',
                padding: '30px',
                position: 'relative',
                backgroundColor: '#fff',
                boxShadow: '0 4px 32px rgba(0,0,0,0.12)',
                textAlign: 'center'
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
                <div style={{ marginBottom: '10px' }}>
                    <img src="/assets/logo.png" alt="Check Health" style={{ height: '50px' }} />
                </div>

                {/* Title */}
                <h2 style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    marginBottom: '5px',
                    color: '#000'
                }}>
                    Reschedule Appointment
                </h2>

                {/* Subtitle */}
                <div style={{
                    fontSize: '16px',
                    marginBottom: '25px',
                    color: '#000'
                }}>
                    for <span style={{ color: '#2563eb', fontWeight: 'bold' }}>{appointment.name}</span>
                </div>

                {/* Current Appointment (Read-Only) */}
                <div style={{ textAlign: 'left', marginBottom: '20px' }}>
                    <label style={{
                        display: 'block',
                        fontWeight: '600',
                        marginBottom: '8px',
                        color: '#000',
                        fontSize: '14px'
                    }}>
                        Current Appointment
                    </label>
                    <div style={{
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#f8f9fa',
                        color: '#495057',
                        fontSize: '14px'
                    }}>
                        {appointment.doctor}, {appointment.dt}
                    </div>
                </div>

                {/* Divider */}
                <div style={{ textAlign: 'left', marginBottom: '20px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#000', marginBottom: '5px' }}>New Schedule</div>
                    <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0' }} />
                </div>

                {/* New Input Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>

                    {/* Doctor Select */}
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', fontSize: '14px', color: '#000' }}>Assign New Doctor</label>
                        <div className="select-wrapper" style={{ position: 'relative' }}>
                            <select className="input" style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                appearance: 'none',
                                backgroundColor: '#fff',
                                fontSize: '14px'
                            }} defaultValue={appointment.doctor}>
                                <option>{appointment.doctor}</option>
                                <option>Dr. Teodoro Castillo</option>
                                <option>Dr. Miguel Santos</option>
                                <option>Dr. Hugh Jackson</option>
                            </select>
                            <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>▼</span>
                        </div>
                    </div>

                    {/* Date Select */}
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', fontSize: '14px', color: '#000' }}>Select New Date</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                onFocus={(e) => e.target.type = 'date'}
                                onBlur={(e) => e.target.type = 'text'}
                                placeholder="Nov 17, 2025"
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                    fontSize: '14px'
                                }}
                            />

                        </div>
                    </div>

                    {/* Time Select */}
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', fontSize: '14px', color: '#000' }}>Select New Time</label>
                        <div className="select-wrapper" style={{ position: 'relative' }}>
                            <select className="input" style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                appearance: 'none',
                                backgroundColor: '#fff',
                                fontSize: '14px'
                            }} defaultValue="9:00 AM">
                                <option>9:00 AM</option>
                                <option>10:00 AM</option>
                                <option>11:00 AM</option>
                                <option>1:00 PM</option>
                                <option>2:00 PM</option>
                            </select>
                            <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>▼</span>
                        </div>
                    </div>

                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button
                        onClick={() => onConfirm()}
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
                        Confirm Reschedule
                    </button>

                    <button
                        onClick={onClose}
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
                        Cancel
                    </button>
                </div>

            </div>
        </div>
    );
}
