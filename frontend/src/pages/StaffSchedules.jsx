import React, { useState, useEffect } from 'react';
import DashboardNav from '../components/DashboardNav';
import { useNavigate } from 'react-router-dom';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function StaffSchedules() {
    const navigate = useNavigate();

    const [doctors, setDoctors] = useState([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    // Initialize state similar to DoctorSchedule
    const [rows, setRows] = useState(DAYS.map(d => ({
        dayOfWeek: d,
        active: d !== 'Saturday' && d !== 'Sunday',
        startTime: '09:00',
        endTime: '17:00'
    })));

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
        fetchDoctors();
    }, [navigate]);

    const fetchDoctors = async () => {
        try {
            const res = await fetch('/api/doctors');
            if (res.ok) {
                const data = await res.json();
                setDoctors(data);
                if (data.length > 0) {
                    setSelectedDoctorId(data[0].doctorId); // Default to first doctor
                }
            }
        } catch (err) {
            console.error("Failed to fetch doctors", err);
        }
    };

    // Fetch schedule when selected doctor changes
    useEffect(() => {
        if (!selectedDoctorId) return;
        fetchSchedule(selectedDoctorId);
    }, [selectedDoctorId]);

    const fetchSchedule = async (doctorId) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/schedules/doctor/${doctorId}`);
            if (res.ok) {
                const data = await res.json();
                // Merge with default rows
                setRows(prev => prev.map(r => {
                    const found = data.find(d => d.dayOfWeek.toUpperCase() === r.dayOfWeek.toUpperCase());
                    if (found) {
                        return {
                            ...r,
                            active: found.active,
                            startTime: found.startTime ? found.startTime.substring(0, 5) : '',
                            endTime: found.endTime ? found.endTime.substring(0, 5) : ''
                        };
                    }
                    return { ...r, active: false, startTime: '', endTime: '' }; // Reset if not found
                }));
            }
        } catch (err) {
            console.error("Failed to fetch schedule", err);
        } finally {
            setLoading(false);
        }
    };

    const update = (idx, patch) => {
        setRows(prev => prev.map((row, i) => i === idx ? { ...row, ...patch } : row));
    };

    const save = async () => {
        if (!selectedDoctorId) return;
        setLoading(true);
        setMsg('');
        try {
            const payload = rows.map(r => ({
                dayOfWeek: r.dayOfWeek,
                isActive: r.active,
                startTime: r.startTime,
                endTime: r.endTime
            }));

            const res = await fetch(`/api/schedules/doctor/${selectedDoctorId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setMsg('Schedule saved successfully!');
                setTimeout(() => setMsg(''), 3000);
            } else {
                setMsg('Failed to save schedule.');
            }
        } catch (err) {
            setMsg('Network error.');
        } finally {
            setLoading(false);
        }
    };

    const selectedDoctorName = doctors.find(d => d.doctorId === Number(selectedDoctorId))
        ? `${doctors.find(d => d.doctorId === Number(selectedDoctorId)).firstName} ${doctors.find(d => d.doctorId === Number(selectedDoctorId)).lastName}`
        : 'Selected Doctor';

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
                                <select
                                    className="input"
                                    value={selectedDoctorId}
                                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        appearance: 'none',
                                        backgroundColor: '#fff',
                                        fontSize: '16px',
                                        color: '#000'
                                    }}
                                >
                                    {doctors.map(doc => (
                                        <option key={doc.doctorId} value={doc.doctorId}>
                                            Dr. {doc.firstName} {doc.lastName}
                                        </option>
                                    ))}
                                </select>
                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>▼</span>
                            </div>
                        </div>
                    </div>

                    {/* Weekly Schedule Grid */}
                    <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '40px' }}>
                        {rows.map((r, idx) => (
                            <div key={r.dayOfWeek} style={{
                                display: 'grid',
                                gridTemplateColumns: '160px 1fr 1fr',
                                gap: '10px',
                                alignItems: 'center',
                                padding: '10px 0',
                                borderBottom: '1px solid #e2e8f0'
                            }}>
                                <label style={{ fontWeight: 800, display: 'flex', alignItems: 'center', color: '#000' }}>
                                    <input
                                        type="checkbox"
                                        checked={r.active}
                                        onChange={e => update(idx, { active: e.target.checked })}
                                        style={{ marginRight: '8px', width: '20px', height: '20px', accentColor: '#2563eb', cursor: 'pointer' }}
                                    />
                                    {r.dayOfWeek}
                                </label>
                                <div>
                                    <label className="form-label" style={{ display: 'inline-grid', gridTemplateColumns: '110px 140px', gap: '8px', alignItems: 'center' }}>
                                        <span style={{ fontSize: '14px', color: '#6c757d' }}>Start Time :</span>
                                        <div className="custom-time-wrapper">
                                            <input
                                                type="time"
                                                className="input"
                                                value={r.startTime}
                                                onChange={e => update(idx, { startTime: e.target.value })}
                                                disabled={!r.active}
                                                onClick={(e) => r.active && e.target.showPicker && e.target.showPicker()}
                                                style={{
                                                    padding: '8px',
                                                    borderRadius: '6px',
                                                    border: '1px solid #e2e8f0',
                                                    backgroundColor: '#fff',
                                                    color: '#000',
                                                    opacity: r.active ? 1 : 0.5,
                                                    cursor: r.active ? 'pointer' : 'default'
                                                }}
                                            />
                                            <svg className="custom-time-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ opacity: r.active ? 1 : 0.5 }}>
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </label>
                                </div>
                                <div>
                                    <label className="form-label" style={{ display: 'inline-grid', gridTemplateColumns: '100px 140px', gap: '8px', alignItems: 'center' }}>
                                        <span style={{ fontSize: '14px', color: '#6c757d' }}>End Time :</span>
                                        <div className="custom-time-wrapper">
                                            <input
                                                type="time"
                                                className="input"
                                                value={r.endTime}
                                                onChange={e => update(idx, { endTime: e.target.value })}
                                                disabled={!r.active}
                                                onClick={(e) => r.active && e.target.showPicker && e.target.showPicker()}
                                                style={{
                                                    padding: '8px',
                                                    borderRadius: '6px',
                                                    border: '1px solid #e2e8f0',
                                                    backgroundColor: '#fff',
                                                    color: '#000',
                                                    opacity: r.active ? 1 : 0.5,
                                                    cursor: r.active ? 'pointer' : 'default'
                                                }}
                                            />
                                            <svg className="custom-time-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ opacity: r.active ? 1 : 0.5 }}>
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Action Footer */}
                    <div>
                        <button
                            onClick={save}
                            disabled={loading || !selectedDoctorId}
                            style={{
                                backgroundColor: loading ? '#9ca3af' : '#6495ED',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '14px 24px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                width: '100%'
                            }}>
                            {loading ? 'Saving...' : `Save Schedule for ${selectedDoctorName}`}
                        </button>
                        {msg && <div style={{ marginTop: '15px', textAlign: 'center', color: msg.includes('Failed') ? 'red' : 'green', fontWeight: 'bold' }}>{msg}</div>}
                    </div>

                </div>
            </main>
        </div>
    );
}
