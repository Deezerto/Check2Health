import DashboardNav from '../components/DashboardNav'
import AppointmentActionModal from '../components/AppointmentActionModal'
import PreConsultationModal from '../components/PreConsultationModal'
import RescheduleModal from '../components/RescheduleModal'
import ApproveConfirmationModal from '../components/ApproveConfirmationModal'
import DenyConfirmationModal from '../components/DenyConfirmationModal'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const appointments = [
    { name: 'John Smith', doctor: 'Dr. Evelyn Reed', dt: 'Nov 17, 2025, 9:00 AM', status: 'Confirmed', reason: 'Annual Check-up' },
    { name: 'Maria Garcia', doctor: 'Dr. Teodoro Castillo', dt: 'Nov 17, 2025, 9:00 AM', status: 'Completed', reason: 'Stomach ache' },
    { name: 'David Lee', doctor: 'Dr. Miguel Santos', dt: 'Nov 17, 2025, 9:00 AM', status: 'Pending', reason: 'Annual Check-up' },
    { name: 'Elvin Lagamo', doctor: 'Dr. Hugh Jackson', dt: 'Nov 17, 2025, 9:00 AM', status: 'Cancelled', reason: 'Stomach ache' },
]

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
    const [previousModal, setPreviousModal] = useState(null)

    useEffect(() => {
        const raw = sessionStorage.getItem('auth.user')
        if (!raw) { navigate('/login') }
        else {
            try {
                const user = JSON.parse(raw);
                if (user.role !== 'STAFF') {
                    navigate('/login'); // Or some other appropriate redirect
                }
            } catch (e) {
                navigate('/login');
            }
        }
    }, [navigate])

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
        console.log('Appointment Approved')
        setApproveConfirmationOpen(false)
        setSelectedAppointment(null)
        setPreviousModal(null)
        // Add API call logic here later
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
        console.log('Appointment Denied')
        setDenyConfirmationOpen(false)
        setSelectedAppointment(null)
        setPreviousModal(null)
        // Add API call logic here later
    }

    return (
        <div className="dash-bg" style={{ backgroundColor: '#E9F3FF', minHeight: '100vh' }}>
            <DashboardNav
                userName="German Velasco"
                active="My Appointments"
                items={["Dashboard", "My Appointments", "Schedules", "Analytics"]}
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
                            style={{ backgroundColor: '#fff', borderColor: '#e2e8f0' }}
                        />

                        <div className="select-wrapper" style={{ position: 'relative' }}>
                            <select className="input" style={{ backgroundColor: '#fff', borderColor: '#e2e8f0', appearance: 'none' }}>
                                <option>All Doctors</option>
                            </select>
                            <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>▼</span>
                        </div>

                        <div className="select-wrapper" style={{ position: 'relative' }}>
                            <select className="input" style={{ backgroundColor: '#fff', borderColor: '#e2e8f0', appearance: 'none' }}>
                                <option>All Statuses</option>
                            </select>
                            <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>▼</span>
                        </div>

                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                className="input"
                                placeholder="Start Date"
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
                                {appointments.map((apt, i) => (
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
                                                    setSelectedAppointment(apt)
                                                    setModalOpen(true)
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
                                ))}
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
                onConfirm={() => {
                    console.log('Reschedule confirmed')
                    setRescheduleOpen(false)
                    setSelectedAppointment(null)
                    setPreviousModal(null)
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
        </div>
    )
}
