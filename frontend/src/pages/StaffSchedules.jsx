import React, { useState, useEffect } from 'react';
import DashboardNav from '../components/DashboardNav';
import { useNavigate } from 'react-router-dom';

export default function StaffSchedules() {
    const navigate = useNavigate();

    useEffect(() => {
        const raw = sessionStorage.getItem('auth.user');
        if (!raw) { navigate('/login'); }
        else {
            try {
                const user = JSON.parse(raw);
                if (user.role !== 'STAFF') {
                    navigate('/login');
                }
            } catch (e) {
                navigate('/login');
            }
        }
    }, [navigate]);

    const days = [
        { name: 'Monday', type: 'weekday' },
        { name: 'Tuesday', type: 'weekday' },
        { name: 'Wednesday', type: 'weekday' },
        { name: 'Thursday', type: 'weekday' },
        { name: 'Friday', type: 'weekday' },
        { name: 'Saturday', type: 'weekend' },
        { name: 'Sunday', type: 'weekend' },
    ];

    const timeOptions = [
        "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
        "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
    ];

    return (
        <div className="dash-bg" style={{ backgroundColor: '#E3F2FD', minHeight: '100vh' }}>
            <DashboardNav
                userName="German Velasco"
                active="Schedules"
                items={["Dashboard", "My Appointments", "Schedules", "Analytics"]}
                role="STAFF"
            />

            <main className="container dash-main" style={{ padding: '40px 20px', display: 'flex', justifyContent: 'center' }}>

                {/* Main Content Card */}
                <div className="card" style={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    padding: '40px',
                    width: '100%',
                    maxWidth: '900px'
                }}>

                    {/* Control Header */}
                    <div style={{ marginBottom: '30px' }}>
                        <h1 style={{
                            fontSize: '24px',
                            fontWeight: 'bold',
                            color: '#000',
                            marginBottom: '20px',
                            textAlign: 'left'
                        }}>
                            Manage Doctor Schedules
                        </h1>

                        <div style={{ textAlign: 'left' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                color: '#6c757d',
                                marginBottom: '8px'
                            }}>
                                Select a Doctor to manage their schedule:
                            </label>
                            <div className="select-wrapper" style={{ position: 'relative', maxWidth: '300px' }}>
                                <select className="input" style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                    appearance: 'none',
                                    backgroundColor: '#fff',
                                    fontSize: '16px',
                                    color: '#000'
                                }} defaultValue="Dr. Elvin Lagamo">
                                    <option>Dr. Elvin Lagamo</option>
                                    <option>Dr. Evelyn Reed</option>
                                    <option>Dr. Teodoro Castillo</option>
                                </select>
                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>▼</span>
                            </div>
                        </div>
                    </div>

                    {/* Weekly Schedule Grid */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
                        {days.map((day, index) => (
                            <div key={index} style={{
                                display: 'grid',
                                gridTemplateColumns: '40px 120px 1fr 1fr',
                                alignItems: 'center',
                                gap: '20px'
                            }}>
                                {/* Day Indicator (Checkbox) */}
                                <div style={{
                                    width: '24px',
                                    height: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <input
                                        type="checkbox"
                                        defaultChecked={day.type === 'weekday'}
                                        style={{
                                            width: '20px',
                                            height: '20px',
                                            cursor: 'pointer',
                                            accentColor: '#2563eb'
                                        }}
                                    />
                                </div>

                                {/* Day Label */}
                                <div style={{ fontWeight: 'bold', color: '#000', fontSize: '16px' }}>
                                    {day.name}
                                </div>

                                {/* Start Time */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>Start Time</label>
                                    <div className="select-wrapper" style={{ position: 'relative' }}>
                                        <select className="input" style={{
                                            width: '100%',
                                            padding: '10px',
                                            paddingRight: '35px',
                                            borderRadius: '8px',
                                            border: '1px solid #e2e8f0',
                                            appearance: 'none',
                                            backgroundColor: '#fff',
                                            fontSize: '14px'
                                        }} defaultValue="08:00 AM">
                                            {timeOptions.map(t => <option key={t}>{t}</option>)}
                                        </select>
                                        <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex' }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#9ca3af" viewBox="0 0 16 16">
                                                <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z" />
                                                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z" />
                                            </svg>
                                        </span>
                                    </div>
                                </div>

                                {/* End Time */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>End Time</label>
                                    <div className="select-wrapper" style={{ position: 'relative' }}>
                                        <select className="input" style={{
                                            width: '100%',
                                            padding: '10px',
                                            paddingRight: '35px',
                                            borderRadius: '8px',
                                            border: '1px solid #e2e8f0',
                                            appearance: 'none',
                                            backgroundColor: '#fff',
                                            fontSize: '14px'
                                        }} defaultValue="05:00 PM">
                                            {timeOptions.map(t => <option key={t}>{t}</option>)}
                                        </select>
                                        <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex' }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#9ca3af" viewBox="0 0 16 16">
                                                <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z" />
                                                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z" />
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Action Footer */}
                    <div>
                        <button style={{
                            backgroundColor: '#6495ED',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '14px 24px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            width: '100%'
                        }}>
                            Save Schedule for Dr. Elvin Lagamo
                        </button>
                    </div>

                </div>
            </main>
        </div>
    );
}
