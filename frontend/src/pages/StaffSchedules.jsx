import React, { useState, useEffect } from 'react';
import DashboardNav from '../components/DashboardNav';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Copy } from 'lucide-react';
import WheelTimePicker from '../components/WheelTimePicker';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function StaffSchedules() {
    const navigate = useNavigate();

    const [doctors, setDoctors] = useState([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const [staffName, setStaffName] = useState('');

    // Initialize to the Monday of the current week
    const [currentWeekStart, setCurrentWeekStart] = useState(() => {
        const d = new Date()
        const day = d.getDay()
        const diff = d.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
        const monday = new Date(d.setDate(diff))
        monday.setHours(0, 0, 0, 0)
        return monday
    })

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
                if (user.role !== 'STAFF' && user.role !== 'ADMIN') {
                    navigate('/login');
                } else {
                    setStaffName(`${user.firstName} ${user.lastName}`);
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

    const formatDate = (date) => {
        // Use 'en-CA' to get YYYY-MM-DD format in local time
        return date.toLocaleDateString('en-CA')
    }

    // Fetch schedule when selected doctor or week changes
    useEffect(() => {
        if (!selectedDoctorId) return;
        fetchSchedule(selectedDoctorId, currentWeekStart);
    }, [selectedDoctorId, currentWeekStart]);

    const fetchSchedule = async (doctorId, weekStart) => {
        setLoading(true);
        try {
            const dateStr = formatDate(weekStart)
            const res = await fetch(`/api/schedules/doctor/${doctorId}?date=${dateStr}`);
            if (res.ok) {
                const data = await res.json();
                // Merge with default rows
                setRows(DAYS.map(d => {
                    const found = data.find(item => item.dayOfWeek.toUpperCase() === d.toUpperCase());
                    if (found) {
                        return {
                            dayOfWeek: d,
                            active: found.active,
                            startTime: found.startTime ? found.startTime.substring(0, 5) : '',
                            endTime: found.endTime ? found.endTime.substring(0, 5) : ''
                        };
                    }
                    return { dayOfWeek: d, active: false, startTime: '09:00', endTime: '17:00' };
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
                dayOfWeek: r.dayOfWeek.toUpperCase(),
                isActive: r.active,
                startTime: r.startTime,
                endTime: r.endTime
            }));

            const dateStr = formatDate(currentWeekStart)
            const res = await fetch(`/api/schedules/doctor/${selectedDoctorId}?date=${dateStr}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setMsg(`Schedule saved for week of ${currentWeekStart.toLocaleDateString()}`);
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

    const changeWeek = (weeks) => {
        const newDate = new Date(currentWeekStart)
        newDate.setDate(newDate.getDate() + (weeks * 7))
        setCurrentWeekStart(newDate)
    }

    const copyLastWeek = () => {
        const lastWeek = new Date(currentWeekStart)
        lastWeek.setDate(lastWeek.getDate() - 7)

        const dateStr = formatDate(lastWeek)
        setLoading(true)
        fetch(`/api/schedules/doctor/${selectedDoctorId}?date=${dateStr}`)
            .then(r => r.ok ? r.json() : [])
            .then(data => {
                if (Array.isArray(data) && data.length) {
                    setRows(DAYS.map(d => {
                        const found = data.find(item => item.dayOfWeek.toUpperCase() === d.toUpperCase());
                        if (found) {
                            return {
                                dayOfWeek: d,
                                active: found.active,
                                startTime: found.startTime ? found.startTime.substring(0, 5) : '',
                                endTime: found.endTime ? found.endTime.substring(0, 5) : ''
                            };
                        }
                        return { dayOfWeek: d, active: false, startTime: '09:00', endTime: '17:00' };
                    }));
                    alert("Copied schedule from previous week. Don't forget to save!");
                } else {
                    alert("No schedule found for last week.");
                }
            })
            .finally(() => setLoading(false))
    }

    const selectedDoctorName = doctors.find(d => d.doctorId === Number(selectedDoctorId))
        ? `${doctors.find(d => d.doctorId === Number(selectedDoctorId)).firstName} ${doctors.find(d => d.doctorId === Number(selectedDoctorId)).lastName}`
        : 'Selected Doctor';

    const weekEnd = new Date(currentWeekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)

    const formatTime12Hour = (time24) => {
        if (!time24) return '--:-- --'
        const [h, m] = time24.split(':').map(Number)
        const period = h >= 12 ? 'PM' : 'AM'
        const hour = h % 12 || 12
        return `${hour}:${String(m).padStart(2, '0')} ${period}`
    }

    return (
        <div className="dash-bg" style={{ backgroundColor: '#E3F2FD', minHeight: '100vh' }}>
            <DashboardNav
                userName={staffName}
                active="Schedules"
                items={["Dashboard", "Manage Appointments", "Schedules", "Analytics"]}
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

                    {/* Week Scrubber Header */}
                    <div style={{
                        position: 'sticky',
                        top: '0',
                        backgroundColor: '#fff',
                        zIndex: 10,
                        paddingBottom: '20px',
                        borderBottom: '1px solid #f1f5f9',
                        marginBottom: '20px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <button onClick={() => changeWeek(-1)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '5px' }}>
                                    <ChevronLeft size={24} color="#1e293b" />
                                </button>
                                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#000' }}>
                                    {currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                <button onClick={() => changeWeek(1)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '5px' }}>
                                    <ChevronRight size={24} color="#1e293b" />
                                </button>
                            </div>
                            <button
                                onClick={copyLastWeek}
                                disabled={loading || !selectedDoctorId}
                                style={{
                                    color: '#1E90FF',
                                    background: 'none',
                                    border: 'none',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    opacity: (loading || !selectedDoctorId) ? 0.5 : 1
                                }}
                            >
                                <Copy size={16} />
                                Copy last week's schedule
                            </button>
                        </div>
                        <div style={{
                            marginTop: '10px',
                            backgroundColor: '#eff6ff',
                            color: '#1e40af',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span style={{ fontWeight: 'bold' }}>i</span>
                            Viewing schedule for specific week. Changes do not affect other weeks.
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
                                padding: '20px 0',
                                borderBottom: '1px solid #e2e8f0'
                            }}>
                                <label style={{ fontWeight: 800, display: 'flex', alignItems: 'center', color: '#000', cursor: 'pointer' }}>
                                    <div style={{
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '4px',
                                        border: r.active ? 'none' : '1px solid #cbd5e1',
                                        backgroundColor: r.active ? '#1E90FF' : '#fff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: '12px',
                                        transition: 'all 0.2s'
                                    }}>
                                        {r.active && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={r.active}
                                        onChange={e => update(idx, { active: e.target.checked })}
                                        style={{ display: 'none' }}
                                    />
                                    {r.dayOfWeek}
                                </label>
                                <div>
                                    <label className="form-label" style={{ display: 'inline-grid', gridTemplateColumns: '110px 140px', gap: '8px', alignItems: 'center' }}>
                                        <span style={{ fontSize: '14px', color: r.active ? '#000' : '#94a3b8', fontWeight: '500' }}>Start Time :</span>
                                        <div className="custom-time-wrapper" style={{ position: 'relative' }}>
                                            {r.active ? (
                                                <WheelTimePicker
                                                    value={r.startTime}
                                                    onChange={val => update(idx, { startTime: val })}
                                                    label="Start Time"
                                                />
                                            ) : (
                                                <div style={{
                                                    padding: '10px 12px',
                                                    backgroundColor: '#f1f5f9',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '8px',
                                                    color: '#94a3b8',
                                                    fontSize: '14px',
                                                    fontWeight: '500',
                                                    width: '140px'
                                                }}>
                                                    {formatTime12Hour(r.startTime)}
                                                </div>
                                            )}
                                        </div>
                                    </label>
                                </div>
                                <div>
                                    <label className="form-label" style={{ display: 'inline-grid', gridTemplateColumns: '100px 140px', gap: '8px', alignItems: 'center' }}>
                                        <span style={{ fontSize: '14px', color: r.active ? '#000' : '#94a3b8', fontWeight: '500' }}>End Time :</span>
                                        <div className="custom-time-wrapper" style={{ position: 'relative' }}>
                                            {r.active ? (
                                                <WheelTimePicker
                                                    value={r.endTime}
                                                    onChange={val => update(idx, { endTime: val })}
                                                    label="End Time"
                                                />
                                            ) : (
                                                <div style={{
                                                    padding: '10px 12px',
                                                    backgroundColor: '#f1f5f9',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '8px',
                                                    color: '#94a3b8',
                                                    fontSize: '14px',
                                                    fontWeight: '500',
                                                    width: '140px'
                                                }}>
                                                    {formatTime12Hour(r.endTime)}
                                                </div>
                                            )}
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
                                backgroundColor: loading ? '#9ca3af' : '#1E90FF',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '14px 24px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                width: '100%',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#2563eb')}
                            onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#1E90FF')}
                        >
                            {loading ? 'Saving...' : `Save Schedule for ${selectedDoctorName}`}
                        </button>
                        {msg && <div style={{ marginTop: '15px', textAlign: 'center', color: msg.includes('Failed') ? 'red' : 'green', fontWeight: 'bold' }}>{msg}</div>}
                    </div>

                </div>
            </main>
        </div>
    );
}
