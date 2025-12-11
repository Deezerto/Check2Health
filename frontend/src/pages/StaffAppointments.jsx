import DashboardNav from '../components/DashboardNav'

import AppointmentActionModal from '../components/AppointmentActionModal'
import PreConsultationModal from '../components/PreConsultationModal'
import RescheduleModal from '../components/RescheduleModal'
import ApproveConfirmationModal from '../components/ApproveConfirmationModal'
import DenyConfirmationModal from '../components/DenyConfirmationModal'
import AlreadyApprovedModal from '../components/AlreadyApprovedModal'
import AlreadyDeniedModal from '../components/AlreadyDeniedModal'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'



function StatusBadge({ status }) {
    let color = '#6c757d' // default gray
    let bg = '#e9ecef'

    if (status === 'Confirmed') {
        color = '#fff'
        bg = '#28a745'
    } else if (status === 'Completed') {
        color = '#fff'
        bg = '#007bff' // Blue-ish
    } else if (status === 'Pending') {
        color = '#212529'
        bg = '#ffc107'
    } else if (status === 'Cancelled') {
        color = '#fff'
        bg = '#dc3545'
    } else if (status === 'Rescheduled') {
        color = '#fff'
        bg = '#fd7e14' // Orange
    }

    return (
        <span style={{
            backgroundColor: bg,
            color: color,
            padding: '4px 12px',
            borderRadius: '50px',
            fontSize: '0.85rem',
            fontWeight: 500,
            display: 'inline-block',
            minWidth: '80px',
            textAlign: 'center'
        }}>
            {status}
        </span>
    )
}

export default function StaffAppointments() {
    const navigate = useNavigate()
    const [selectedAppointment, setSelectedAppointment] = useState(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [preConsultationOpen, setPreConsultationOpen] = useState(false)
    const [rescheduleOpen, setRescheduleOpen] = useState(false)
    const [approveConfirmationOpen, setApproveConfirmationOpen] = useState(false)
    const [denyConfirmationOpen, setDenyConfirmationOpen] = useState(false)
    const [alreadyApprovedModalOpen, setAlreadyApprovedModalOpen] = useState(false)
    const [alreadyDeniedModalOpen, setAlreadyDeniedModalOpen] = useState(false)
    const [previousModal, setPreviousModal] = useState(null)

    const [appointments, setAppointments] = useState([])
    const [staffName, setStaffName] = useState('')

    // Filter States
    const [doctors, setDoctors] = useState([])
    const [searchName, setSearchName] = useState('')
    const [selectedDoctor, setSelectedDoctor] = useState('')
    const [selectedStatus, setSelectedStatus] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    const { user, loading } = useAuth()

    useEffect(() => {
        if (!loading) {
            if (user && (user.role === 'STAFF' || user.role === 'ADMIN')) {
                setStaffName(`${user.firstName} ${user.lastName}`)
            } else {
                navigate('/login')
            }
        }

        // Fetch Doctors
        fetch('/api/doctors')
            .then(res => res.json())
            .then(data => setDoctors(data))
            .catch(err => console.error('Failed to fetch doctors:', err))

        // Fetch Reservations
        fetch('/api/reservations')
            .then(res => res.json())
            .then(data => {
                const formatted = data.map(r => ({
                    id: r.reservationID,
                    name: `${r.patient.firstName} ${r.patient.lastName}`,
                    doctor: `Dr. ${r.doctor.firstName} ${r.doctor.lastName}`,
                    dt: new Date(r.reservationDate).toLocaleString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true
                    }),
                    status: r.reservationStatus.charAt(0).toUpperCase() + r.reservationStatus.slice(1).toLowerCase(),
                    reason: r.reasonForVisit,
                    raw: r
                }))
                setAppointments(formatted)
            })
            .catch(err => console.error('Failed to fetch appointments:', err))
    }, [navigate, user, loading])

    // Filter Logic
    const filteredAppointments = appointments.filter(apt => {
        const matchName = apt.name.toLowerCase().includes(searchName.toLowerCase())

        const matchDoctor = selectedDoctor === '' || (apt.raw.doctor && apt.raw.doctor.doctorId.toString() === selectedDoctor)

        const matchStatus = selectedStatus === '' || apt.status.toLowerCase() === selectedStatus.toLowerCase()

        let matchDate = true
        const aptDate = new Date(apt.raw.reservationDate)

        if (startDate) {
            const start = new Date(startDate)
            start.setHours(0, 0, 0, 0)
            matchDate = matchDate && aptDate >= start
        }

        if (endDate) {
            const end = new Date(endDate)
            end.setHours(23, 59, 59, 999)
            matchDate = matchDate && aptDate <= end
        }

        return matchName && matchDoctor && matchStatus && matchDate
    })

    const handleAction = (action) => {
        console.log('Action:', action, 'on', selectedAppointment)

        if (action === 'view') {
            setModalOpen(false)
            setPreConsultationOpen(true)
            return
        }

        if (action === 'reschedule') {
            if (modalOpen) setPreviousModal('action')
            else if (preConsultationOpen) setPreviousModal('pre-consultation')

            setModalOpen(false)
            setPreConsultationOpen(false)
            setRescheduleOpen(true)
            return
        }

        if (action === 'approve') {
            if (modalOpen) setPreviousModal('action')
            else if (preConsultationOpen) setPreviousModal('pre-consultation')

            setModalOpen(false)
            setPreConsultationOpen(false)
            setApproveConfirmationOpen(true)
            return
        }

        if (action === 'deny') {
            if (modalOpen) setPreviousModal('action')
            else if (preConsultationOpen) setPreviousModal('pre-consultation')

            setModalOpen(false)
            setPreConsultationOpen(false)
            setDenyConfirmationOpen(true)
            return
        }

        // Implement actual logic here (e.g., API call)
        setModalOpen(false)
        setPreConsultationOpen(false)
        setRescheduleOpen(false)
        setApproveConfirmationOpen(false)
        setDenyConfirmationOpen(false)
        setSelectedAppointment(null)
    }

    const handleRescheduleClose = () => {
        setRescheduleOpen(false)
        if (previousModal === 'action') {
            setModalOpen(true)
        } else if (previousModal === 'pre-consultation') {
            setPreConsultationOpen(true)
        } else {
            setSelectedAppointment(null)
        }
        setPreviousModal(null)
    }

    const handleApproveClose = () => {
        setApproveConfirmationOpen(false)
        if (previousModal === 'action') {
            setModalOpen(true)
        } else if (previousModal === 'pre-consultation') {
            setPreConsultationOpen(true)
        } else {
            setSelectedAppointment(null)
        }
        setPreviousModal(null)
    }

    const handleApproveConfirm = () => {
        if (!selectedAppointment) return

        fetch(`/api/reservations/${selectedAppointment.id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'CONFIRMED' })
        })
            .then(res => {
                if (res.ok) {
                    alert('Appointment Approved!')
                    // Refresh
                    fetch('/api/reservations')
                        .then(r => r.json())
                        .then(data => {
                            const formatted = data.map(r => ({
                                id: r.reservationID,
                                name: `${r.patient.firstName} ${r.patient.lastName}`,
                                doctor: `Dr. ${r.doctor.firstName} ${r.doctor.lastName}`,
                                dt: new Date(r.reservationDate).toLocaleString('en-US', {
                                    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true
                                }),
                                status: r.reservationStatus.charAt(0).toUpperCase() + r.reservationStatus.slice(1).toLowerCase(),
                                reason: r.reasonForVisit,
                                raw: r
                            }))
                            setAppointments(formatted)
                        })
                } else {
                    alert('Failed to approve appointment.')
                }
            })
            .catch(err => console.error('Approve failed', err))
            .finally(() => {
                setApproveConfirmationOpen(false)
                setSelectedAppointment(null)
                setPreviousModal(null)
            })
    }

    const handleDenyClose = () => {
        setDenyConfirmationOpen(false)
        if (previousModal === 'action') {
            setModalOpen(true)
        } else if (previousModal === 'pre-consultation') {
            setPreConsultationOpen(true)
        } else {
            setSelectedAppointment(null)
        }
        setPreviousModal(null)
    }

    const handleDenyConfirm = () => {
        if (!selectedAppointment) return

        fetch(`/api/reservations/${selectedAppointment.id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'CANCELLED' })
        })
            .then(res => {
                if (res.ok) {
                    alert('Appointment Denied (Cancelled).')
                    // Refresh
                    fetch('/api/reservations')
                        .then(r => r.json())
                        .then(data => {
                            const formatted = data.map(r => ({
                                id: r.reservationID,
                                name: `${r.patient.firstName} ${r.patient.lastName}`,
                                doctor: `Dr. ${r.doctor.firstName} ${r.doctor.lastName}`,
                                dt: new Date(r.reservationDate).toLocaleString('en-US', {
                                    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true
                                }),
                                status: r.reservationStatus.charAt(0).toUpperCase() + r.reservationStatus.slice(1).toLowerCase(),
                                reason: r.reasonForVisit,
                                raw: r
                            }))
                            setAppointments(formatted)
                        })
                } else {
                    alert('Failed to deny appointment.')
                }
            })
            .catch(err => console.error('Deny failed', err))
            .finally(() => {
                setDenyConfirmationOpen(false)
                setSelectedAppointment(null)
                setPreviousModal(null)
            })
    }

    return (
        <div className="dash-bg" style={{ backgroundColor: '#E9F3FF', minHeight: '100vh' }}>
            <DashboardNav
                userName={staffName}
                active="Manage Appointments"
                items={["Dashboard", "Manage Appointments", "Schedules", "Analytics"]}
                role="STAFF"
            />

            <main className="container dash-main" style={{ padding: '30px 20px' }}>

                {/* Main Content Panel */}
                <div className="card" style={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    padding: '24px',
                    minHeight: '600px'
                }}>

                    {/* Title Section */}
                    <h1 style={{
                        fontSize: '24px',
                        fontWeight: 700,
                        color: '#000',
                        margin: '0 0 24px 0'
                    }}>
                        Manage All Appointments
                    </h1>

                    {/* Filter Bar */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(5, 1fr)',
                        gap: '16px',
                        marginBottom: '30px'
                    }}>
                        <input
                            type="text"
                            className="input"
                            placeholder="Patient Name"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            style={{ backgroundColor: '#fff', borderColor: '#e2e8f0' }}
                        />

                        <div className="select-wrapper" style={{ position: 'relative' }}>
                            <select
                                className="input"
                                value={selectedDoctor}
                                onChange={(e) => setSelectedDoctor(e.target.value)}
                                style={{ backgroundColor: '#fff', borderColor: '#e2e8f0', appearance: 'none' }}
                            >
                                <option value="">All Doctors</option>
                                {doctors.map(doc => (
                                    <option key={doc.doctorId} value={doc.doctorId}>
                                        Dr. {doc.firstName} {doc.lastName}
                                    </option>
                                ))}
                            </select>
                            <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>▼</span>
                        </div>

                        <div className="select-wrapper" style={{ position: 'relative' }}>
                            <select
                                className="input"
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                style={{ backgroundColor: '#fff', borderColor: '#e2e8f0', appearance: 'none' }}
                            >
                                <option value="">All Statuses</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Pending">Pending</option>
                                <option value="Rescheduled">Rescheduled</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="Completed">Completed</option>
                            </select>
                            <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>▼</span>
                        </div>

                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                className="input"
                                placeholder="Start Date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                onFocus={(e) => e.target.type = 'date'}
                                onBlur={(e) => e.target.type = 'text'}
                                style={{ backgroundColor: '#fff', borderColor: '#e2e8f0' }}
                            />

                        </div>

                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                className="input"
                                placeholder="End Date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                onFocus={(e) => e.target.type = 'date'}
                                onBlur={(e) => e.target.type = 'text'}
                                style={{ backgroundColor: '#fff', borderColor: '#e2e8f0' }}
                            />

                        </div>
                    </div>

                    {/* Appointments Table */}
                    <div className="table-wrap">
                        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#F4F4F4' }}>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#4a5568', fontWeight: 600 }}>Patient Name</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#4a5568', fontWeight: 600 }}>Doctor</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#4a5568', fontWeight: 600 }}>Date & Time</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#4a5568', fontWeight: 600 }}>Status</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#4a5568', fontWeight: 600 }}>Reason</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'center', color: '#4a5568', fontWeight: 600 }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAppointments.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>No appointments found.</td>
                                    </tr>
                                ) : (
                                    filteredAppointments.map((apt, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                            <td style={{ padding: '16px', color: '#000', fontWeight: 500 }}>{apt.name}</td>
                                            <td style={{ padding: '16px', color: '#000' }}>{apt.doctor}</td>
                                            <td style={{ padding: '16px', color: '#333' }}>{apt.dt}</td>
                                            <td style={{ padding: '16px' }}>
                                                <StatusBadge status={apt.status} />
                                            </td>
                                            <td style={{ padding: '16px', color: '#000' }}>{apt.reason}</td>
                                            <td style={{ padding: '16px', textAlign: 'center' }}>
                                                <button
                                                    onClick={() => {
                                                        if (apt.status === 'Confirmed') {
                                                            setAlreadyApprovedModalOpen(true)
                                                        } else if (apt.status === 'Cancelled') {
                                                            setAlreadyDeniedModalOpen(true)
                                                        } else {
                                                            setSelectedAppointment(apt)
                                                            setModalOpen(true)
                                                        }
                                                    }}
                                                    style={{
                                                        backgroundColor: '#2563eb',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '50%',
                                                        width: '32px',
                                                        height: '32px',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    &gt;
                                                </button>
                                            </td>
                                        </tr>
                                    )))}
                            </tbody>
                        </table>
                    </div>

                </div>
            </main>

            <AppointmentActionModal
                appointment={selectedAppointment}
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onAction={handleAction}
            />

            <PreConsultationModal
                appointment={selectedAppointment}
                open={preConsultationOpen}
                onClose={() => setPreConsultationOpen(false)}
                onAction={handleAction}
            />

            <RescheduleModal
                appointment={selectedAppointment}
                open={rescheduleOpen}
                onClose={handleRescheduleClose}
                onConfirm={(doctorId, dateTime) => {
                    console.log('Reschedule confirmed:', doctorId, dateTime)

                    if (!selectedAppointment) return;

                    // Fetch the doctor object first? Or just patch the ID?
                    // The backend expects a whole Reservation object usually for PUT.
                    // But we can try to re-use the raw object and update fields.

                    // We need to fetch the full doctor object or at least create a stub with ID if usage allows.
                    // Instead of complex logic, let's just update what we can.
                    // Actually, the PUT endpoint expects a full Reservation object.

                    const updatedReservation = {
                        ...selectedAppointment.raw,
                        reservationDate: dateTime,
                        doctor: { doctorID: doctorId } // This is risky if backend needs full doctor. Ideally we fetch doctor first.
                    };

                    // Let's fetch the doctor first to be safe, then update.
                    fetch(`/api/doctors/${doctorId}`)
                        .then(res => res.json())
                        .then(doctor => {
                            const payload = {
                                ...selectedAppointment.raw,
                                reservationDate: dateTime,
                                reservationStatus: 'RESCHEDULED',
                                doctor: doctor
                            };

                            fetch(`/api/reservations/${selectedAppointment.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(payload)
                            })
                                .then(res => {
                                    if (res.ok) {
                                        alert("Appointment successfully rescheduled!");
                                        setRescheduleOpen(false);
                                        setSelectedAppointment(null);
                                        setPreviousModal(null);
                                        // Refresh list
                                        fetch('/api/reservations')
                                            .then(res => res.json())
                                            .then(data => {
                                                const formatted = data.map(r => ({
                                                    id: r.reservationID,
                                                    name: `${r.patient.firstName} ${r.patient.lastName}`,
                                                    doctor: `Dr. ${r.doctor.firstName} ${r.doctor.lastName}`,
                                                    dt: new Date(r.reservationDate).toLocaleString('en-US', {
                                                        month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true
                                                    }),
                                                    status: r.reservationStatus.charAt(0).toUpperCase() + r.reservationStatus.slice(1).toLowerCase(),
                                                    reason: r.reasonForVisit,
                                                    raw: r
                                                }))
                                                setAppointments(formatted)
                                            })
                                    } else {
                                        alert("Failed to reschedule. Please try again.");
                                    }
                                })
                                .catch(e => console.error("Update failed", e));
                        })
                        .catch(e => console.error("Doctor fetch failed", e));
                }}
            />

            <ApproveConfirmationModal
                appointment={selectedAppointment}
                open={approveConfirmationOpen}
                onClose={handleApproveClose}
                onConfirm={handleApproveConfirm}
            />

            <DenyConfirmationModal
                open={denyConfirmationOpen}
                onClose={handleDenyClose}
                onConfirm={handleDenyConfirm}
            />

            <AlreadyApprovedModal
                open={alreadyApprovedModalOpen}
                onClose={() => setAlreadyApprovedModalOpen(false)}
            />

            <AlreadyDeniedModal
                open={alreadyDeniedModalOpen}
                onClose={() => setAlreadyDeniedModalOpen(false)}
            />
        </div>
    )
}
