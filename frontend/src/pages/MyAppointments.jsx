import { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import DashboardNav from '../components/DashboardNav';

// --- Helper Hooks and Functions (from original file, no changes needed) ---
function useUserName() {
  return useMemo(() => {
    try {
      const raw = sessionStorage.getItem('auth.user');
      if (!raw) return { full: 'User', first: 'User' };
      const u = JSON.parse(raw);
      const full = [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || u.username || 'User';
      const first = (u.firstName || full || 'User').toString();
      return { full, first };
    } catch {
      return { full: 'User', first: 'User' };
    }
  }, []);
}

function formatDateTime(isoString, type = 'full') {
  try {
    const date = new Date(isoString);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();

    if (type === 'date_only') {
      return `${month} ${day}, ${year}`;
    }

    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const minutesStr = minutes.toString().padStart(2, '0');
    return `${month} ${day}, ${year} at ${hours}:${minutesStr} ${ampm}`;
  } catch {
    return 'Invalid Date';
  }
}

function getStatusBadgeClass(status) {
  const normalized = (status || '').toUpperCase();
  if (normalized === 'CONFIRMED') return 'badge-confirmed';
  if (normalized === 'PENDING') return 'badge-pending';
  if (normalized === 'COMPLETED') return 'badge-completed'; // Let's assume a style for this
  if (normalized === 'CANCELLED') return 'badge-cancelled';
  if (normalized === 'RESCHEDULED') return 'badge-pending'; // Reusing pending style for now, or could be a new one
  return 'badge-pending';
}

function getStatusLabel(status) {
  const normalized = (status || '').toUpperCase();
  if (normalized === 'CONFIRMED') return 'Confirmed';
  if (normalized === 'PENDING') return 'Pending';
  if (normalized === 'COMPLETED') return 'Completed';
  if (normalized === 'CANCELLED') return 'Cancelled';
  if (normalized === 'RESCHEDULED') return 'Rescheduled';
  return status;
}

// --- Main Component ---
export default function MyAppointments() {
  const navigate = useNavigate();
  const { full } = useUserName();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'upcoming');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('auth.user');
      if (!raw) {
        navigate('/login');
        return;
      }
      const user = JSON.parse(raw);
      const patientId = user.patientID || user.patientId || user.id;
      if (!patientId) {
        navigate('/login'); // No patient ID found
        return;
      }

      fetch(`/api/reservations/patient/${patientId}`)
        .then(r => (r.ok ? r.json() : Promise.resolve([])))
        .then(data => {
          // Sort by date descending before setting
          data.sort((a, b) => new Date(b.reservationDate) - new Date(a.reservationDate));
          setAppointments(data);
          setLoading(false);
        })
        .catch(() => {
          setAppointments([]);
          setLoading(false);
        });
    } catch {
      navigate('/login');
    }
  }, [navigate]);

  // --- REFACTORED: Filter logic based on status ---
  const upcoming = appointments.filter(a =>
    a.reservationStatus?.toUpperCase() === 'PENDING' || 
    a.reservationStatus?.toUpperCase() === 'CONFIRMED' ||
    a.reservationStatus?.toUpperCase() === 'RESCHEDULED'
  );

  const past = appointments.filter(a =>
    a.reservationStatus?.toUpperCase() === 'COMPLETED'
  );

  const displayList = activeTab === 'upcoming' ? upcoming : past;

  return (
    <div className="dash-bg">
      <DashboardNav userName={full} active="My Appointments" items={["Dashboard", "My Appointments"]} role="PATIENT" />

      <main className="dash-main" style={{ display: 'flex', justifyContent: 'center', paddingTop: '40px' }}>
        <div className="appointments-card" style={{ maxWidth: '800px' }}>
          <h2 className="appointments-header">My Appointments</h2>
          
          <div className="appointments-tabs">
            <button
              className={`appointments-tab ${activeTab === 'upcoming' ? 'active' : ''}`}
              onClick={() => setActiveTab('upcoming')}
            >
              Upcoming ({upcoming.length})
            </button>
            <button
              className={`appointments-tab ${activeTab === 'past' ? 'active' : ''}`}
              onClick={() => setActiveTab('past')}
            >
              Past ({past.length})
            </button>
          </div>

          {/* --- REFACTORED: Conditional rendering for list content --- */}
          <div className="appointments-list">
            {loading ? (
              <div className="appointments-empty">Loading...</div>
            ) : displayList.length === 0 ? (
              <div className="appointments-empty">No {activeTab} appointments.</div>
            ) : (
              displayList.map((appt) => (
                <div key={appt.reservationID} className="appointment-item">
                  <div className="appointment-info">
                    <div className="appointment-doctor">
                      Dr. {appt.doctor?.firstName || ''} {appt.doctor?.lastName || ''}
                    </div>
                    <div className="appointment-date">
                      {activeTab === 'upcoming'
                        ? formatDateTime(appt.reservationDate, 'full')
                        : formatDateTime(appt.reservationDate, 'date_only')
                      }
                    </div>
                  </div>
                  {activeTab === 'upcoming' ? (
                    <span className={`appointment-badge ${getStatusBadgeClass(appt.reservationStatus)}`}>
                      {getStatusLabel(appt.reservationStatus)}
                    </span>
                  ) : (
                    <Link to={`/dashboard/patient/appointments/${appt.reservationID}`} className="btn btn-blue btn-sm">
                      View Details
                    </Link>
                  )}
                </div>
              ))
            )}
            {activeTab === 'upcoming' && !loading && (
              <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748b', marginTop: '20px', padding: '10px', background: '#f8fafc', borderRadius: '8px' }}>
                To reschedule or cancel, please contact the clinic directly.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
