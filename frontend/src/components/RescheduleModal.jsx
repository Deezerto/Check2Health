import React, { useState, useEffect } from 'react';
import './ProfileModal.css'; // Reusing modal styles

export default function RescheduleModal({ appointment, open, onClose, onConfirm }) {
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState('');

    // Calendar State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [allSchedules, setAllSchedules] = useState([]);

    // Slots
    const [availableTimes, setAvailableTimes] = useState([]);
    const [selectedTime, setSelectedTime] = useState('');

    useEffect(() => {
        if (open) {
            // Reset
            // Default to appointment's doctor if possible
            const initialDocId = appointment?.raw?.doctor?.doctorId || '';
            setSelectedDoctorId(initialDocId);
            setSelectedDate(null);
            setSelectedTime('');
            setAvailableTimes([]);
            setCurrentDate(new Date());

            // Fetch Doctors
            fetch('/api/doctors')
                .then(res => res.json())
                .then(data => setDoctors(data))
                .catch(err => console.error("Failed to fetch doctors", err));

            // Fetch Schedules
            fetch('/api/schedules')
                .then(res => res.json())
                .then(list => setAllSchedules(list))
                .catch(err => console.error("Failed to fetch schedules", err));
        }
    }, [open, appointment]);

    // --- Helpers ---
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
        const res = [];
        for (let i = 0; i < firstDay; i++) res.push(null);
        for (let i = 1; i <= days; i++) res.push(new Date(year, month, i));
        return res;
    };

    const isSameDate = (d1, d2) => {
        return d1 && d2 &&
            d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();
    };

    const hasAvailability = (date) => {
        if (!date || !selectedDoctorId) return false;
        const dateStr = date.toLocaleDateString('en-CA'); // YYYY-MM-DD
        const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' }).toUpperCase();

        // 1. Specific
        const specific = allSchedules.find(s =>
            s.active &&
            s.doctor &&
            String(s.doctor.doctorId) === String(selectedDoctorId) &&
            s.specificDate === dateStr
        );
        if (specific) return true;

        // 2. Weekly
        const generic = allSchedules.find(s =>
            s.active &&
            s.doctor &&
            String(s.doctor.doctorId) === String(selectedDoctorId) &&
            s.dayOfWeek.toUpperCase() === dayOfWeek &&
            !s.specificDate
        );
        return !!generic;
    };

    // --- Effects ---
    // Generate Slots when Date/Doctor changes
    useEffect(() => {
        if (!selectedDoctorId || !selectedDate) {
            setAvailableTimes([]);
            setSelectedTime('');
            return;
        }

        const dateStr = selectedDate.toLocaleDateString('en-CA');
        const dayOfWeek = selectedDate.toLocaleString('en-US', { weekday: 'long' }).toUpperCase();

        // Find schedule
        let schedule = allSchedules.find(s =>
            s.active &&
            s.doctor &&
            String(s.doctor.doctorId) === String(selectedDoctorId) &&
            s.specificDate === dateStr
        );

        if (!schedule) {
            schedule = allSchedules.find(s =>
                s.active &&
                s.doctor &&
                String(s.doctor.doctorId) === String(selectedDoctorId) &&
                s.dayOfWeek.toUpperCase() === dayOfWeek &&
                !s.specificDate
            );
        }

        if (!schedule) {
            setAvailableTimes([]);
            return;
        }

        // Generate 30m slots
        const startStr = (schedule.startTime || '').slice(0, 5);
        const endStr = (schedule.endTime || '').slice(0, 5);
        if (!startStr || !endStr) return;

        const [startH, startM] = startStr.split(':').map(Number);
        const [endH, endM] = endStr.split(':').map(Number);

        let current = new Date();
        current.setHours(startH, startM, 0, 0);
        const end = new Date();
        end.setHours(endH, endM, 0, 0);

        const slots = [];
        while (current <= end) {
            const h = current.getHours();
            const m = current.getMinutes();
            const ampm = h >= 12 ? 'PM' : 'AM';
            const h12 = h % 12 || 12;
            const timeStr = `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
            slots.push(timeStr);
            current.setMinutes(current.getMinutes() + 30);
        }
        setAvailableTimes(slots);
        setSelectedTime(''); // Reset time selection
    }, [selectedDoctorId, selectedDate, allSchedules]);


    const handleConfirm = () => {
        if (!selectedDoctorId || !selectedDate || !selectedTime) {
            alert("Please select a doctor, a date, and a time slot.");
            return;
        }

        // Construct ISO string (Local Time)
        const [timePart, ampm] = selectedTime.split(' ');
        const [hoursStr, minutesStr] = timePart.split(':');
        let hours = parseInt(hoursStr, 10);
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;

        const appointmentDate = new Date(selectedDate);
        appointmentDate.setHours(hours, parseInt(minutesStr, 10), 0, 0);

        // Explicit formatting YYYY-MM-DDTHH:mm:ss
        const year = appointmentDate.getFullYear();
        const month = String(appointmentDate.getMonth() + 1).padStart(2, '0');
        const day = String(appointmentDate.getDate()).padStart(2, '0');
        const hh = String(appointmentDate.getHours()).padStart(2, '0');
        const mm = String(appointmentDate.getMinutes()).padStart(2, '0');
        const isoDateTime = `${year}-${month}-${day}T${hh}:${mm}:00`;

        onConfirm(selectedDoctorId, isoDateTime);
    };

    const changeMonth = (offset) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentDate(newDate);
    };

    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    const calendarDays = getDaysInMonth(currentDate);

    if (!open || !appointment) return null;

    return (
        <div className="modal-overlay">
            <div className="modal" style={{
                width: '600px', // Widened for calendar
                borderRadius: '15px',
                padding: '30px',
                position: 'relative',
                backgroundColor: '#fff',
                boxShadow: '0 4px 32px rgba(0,0,0,0.12)',
                textAlign: 'center',
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
                <div style={{ marginBottom: '10px' }}>
                    <img src="/assets/logo.png" alt="Check Health" style={{ height: '50px' }} />
                </div>

                {/* Header */}
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px', color: '#000' }}>
                    Reschedule Appointment
                </h2>
                <div style={{ fontSize: '16px', marginBottom: '20px', color: '#000' }}>
                    for <span style={{ color: '#2563eb', fontWeight: 'bold' }}>{appointment.name}</span>
                </div>

                {/* Current Appointment */}
                <div style={{ textAlign: 'left', marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#000', fontSize: '14px' }}>
                        Current Appointment
                    </label>
                    <div style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8f9fa', color: '#495057', fontSize: '14px' }}>
                        {appointment.doctor}, {appointment.dt}
                    </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', marginBottom: '20px' }} />

                {/* --- New Schedule Form --- */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* 1. Doctor Select */}
                    <div>
                        <label style={{ display: 'block', textAlign: 'left', fontWeight: '600', marginBottom: '5px', fontSize: '14px', color: '#000' }}>Assign New Doctor</label>
                        <select
                            className="input"
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            value={selectedDoctorId}
                            onChange={(e) => {
                                setSelectedDoctorId(e.target.value);
                                setSelectedDate(null); // Reset date if doctor changes
                            }}
                        >
                            <option value="" disabled>Select a doctor</option>
                            {doctors.map(doc => (
                                <option key={doc.doctorId} value={doc.doctorId}>
                                    Dr. {doc.firstName} {doc.lastName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 2. Calendar Grid */}
                    <div>
                        <label style={{ display: 'block', textAlign: 'left', fontWeight: '600', marginBottom: '10px', fontSize: '14px', color: '#000' }}>Select Date</label>

                        <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '15px' }}>
                            {/* Header Row */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <button onClick={() => changeMonth(-1)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px', color: '#64748b' }}>&lt;</button>
                                <span style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '14px' }}>{monthName}</span>
                                <button onClick={() => changeMonth(1)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px', color: '#64748b' }}>&gt;</button>
                            </div>

                            {/* Days Header */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '10px' }}>
                                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                    <div key={d} style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>{d}</div>
                                ))}
                            </div>

                            {/* Date Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: '10px' }}>
                                {calendarDays.map((date, i) => {
                                    if (!date) return <div key={i}></div>;

                                    const available = hasAvailability(date);
                                    const isSelected = isSameDate(date, selectedDate);
                                    const isToday = isSameDate(date, new Date());

                                    return (
                                        <div
                                            key={i}
                                            onClick={() => available && setSelectedDate(date)}
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                cursor: available ? 'pointer' : 'default',
                                                opacity: available ? 1 : 0.4
                                            }}
                                        >
                                            <div style={{
                                                width: '28px',
                                                height: '28px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: '50%',
                                                fontSize: '13px',
                                                fontWeight: '500',
                                                backgroundColor: isSelected ? '#5A9EF9' : (isToday ? '#f1f5f9' : 'transparent'),
                                                color: isSelected ? '#fff' : '#1e293b',
                                                border: (isToday && !isSelected) ? '1px solid #cbd5e1' : 'none'
                                            }}>
                                                {date.getDate()}
                                            </div>
                                            {available && (
                                                <div style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: '#7ED957', marginTop: '2px' }}></div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* 3. Time Slot Select */}
                    <div>
                        <label style={{ display: 'block', textAlign: 'left', fontWeight: '600', marginBottom: '5px', fontSize: '14px', color: '#000' }}>Select Time Slot</label>
                        <select
                            className="input"
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                            disabled={!selectedDate || availableTimes.length === 0}
                        >
                            <option value="" disabled>
                                {!selectedDate ? "Select a date first" : (availableTimes.length === 0 ? "No slots available" : "Select a time")}
                            </option>
                            {availableTimes.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                        <button
                            onClick={handleConfirm}
                            style={{
                                width: '100%', padding: '14px', borderRadius: '8px', border: 'none',
                                backgroundColor: '#76D65F', color: 'white', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer'
                            }}
                        >
                            Confirm Reschedule
                        </button>

                        <button
                            onClick={onClose}
                            style={{
                                width: '100%', padding: '14px', borderRadius: '8px', border: 'none',
                                backgroundColor: '#FF5E5E', color: 'white', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
