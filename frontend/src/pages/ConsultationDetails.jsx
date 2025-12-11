import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import DashboardNav from '../components/DashboardNav'; // Corrected path
import { useAuth } from '../context/AuthContext';

// --- Helper function to parse prescriptions safely ---
const parsePrescriptions = (jsonString) => {
  if (!jsonString) return [];
  try {
    const parsed = JSON.parse(jsonString);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to parse prescriptions JSON:", error);
    return [];
  }
};

export default function ConsultationDetails() {
  const { id } = useParams(); // Get the ID from the URL
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    const fetchConsultationDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/reservations/${id}/consultation-details`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConsultationDetails();
  }, [id]); // Rerun effect if ID changes

  const handleDownload = () => {
    if (!prescriptions || prescriptions.length === 0) {
      alert("No prescriptions to download.");
      return;
    }

    // CSV Header
    const headers = ["Medication Name", "Dosage", "Instructions"];

    // Map data to CSV rows, escaping quotes if necessary
    const rows = prescriptions.map(p => [
      `"${(p.medicationName || '').replace(/"/g, '""')}"`,
      `"${(p.dosage || '').replace(/"/g, '""')}"`,
      `"${(p.instructions || '').replace(/"/g, '""')}"`
    ]);

    // Combine header and rows
    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    // Create Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `prescription_${id}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div style={styles.pageContainer}>
        <DashboardNav active="My Appointments" items={['Dashboard', 'My Appointments']} role="PATIENT" />
        <main style={styles.mainContent}><h2 style={styles.pageTitle}>Loading Consultation Details...</h2></main>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.pageContainer}>
        <DashboardNav active="My Appointments" items={['Dashboard', 'My Appointments']} role="PATIENT" />
        <main style={styles.mainContent}><h2 style={styles.pageTitle}>Error: {error}</h2></main>
      </div>
    );
  }

  if (!data) return null; // Should not happen if not loading and no error, but good practice

  // Safely parse prescriptions from the JSON string
  const prescriptions = parsePrescriptions(data.prescriptions);

  return (
    <div style={styles.pageContainer}>
      {/* 1. Header Integration */}
      <DashboardNav
        userName={data.patientName}
        active="My Appointments"
        items={['Dashboard', 'My Appointments']}
        role="PATIENT"
      />

      <main style={styles.mainContent}>
        <div className="container" style={styles.innerContainer}>

          {/* 2. Breadcrumb / Back Link */}
          <div style={styles.breadcrumb}>
            <Link to="/dashboard/patient/appointments?tab=past" style={styles.backLink}>
              &lt; Back to My Appointments
            </Link>
          </div>

          {/* 3. Page Title */}
          <h2 style={styles.pageTitle}>
            Consultation Details: {new Date(data.consultationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </h2>

          {/* 4. Card 1: Appointment Info */}
          <section style={styles.card}>
            <h3 style={styles.cardHeader}>Appointment Info</h3>
            <div style={styles.cardBody}>
              <div style={styles.infoRow}>
                <span style={styles.label}>Doctor:</span>
                <span style={styles.value}>{data.doctorName}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.label}>Reason for Visit:</span>
                <span style={styles.value}>{data.reasonForVisit}</span>
              </div>
            </div>
          </section>

          {/* 5. Card 2: Doctor's Notes */}
          <section style={styles.card}>
            <h3 style={styles.cardHeader}>Doctor’s Notes</h3>
            <div style={styles.cardBody}>
              <div style={styles.notesBox}>
                {(data.doctorNotes || "").split('\n').map((line, index) => (
                  <p key={index} style={styles.noteParagraph}>
                    {line || <br />}
                  </p>
                ))}
              </div>
            </div>
          </section>

          {/* 6. Card 3: Prescriptions */}
          <section style={styles.card}>
            <h3 style={styles.cardHeader}>Prescriptions</h3>
            <div style={styles.cardBody}>
              {prescriptions.length > 0 ? (
                prescriptions.map((script, index) => (
                  <div key={script.id || index} style={styles.prescriptionItem}>
                    <div>
                      <strong style={styles.prescriptionLabel}>Medication Name:</strong>
                      <span style={styles.prescriptionValue}>{script.medicationName}</span>
                    </div>
                    <div style={{ marginTop: '8px' }}>
                      <strong style={styles.prescriptionLabel}>Dosage:</strong>
                      <span style={styles.prescriptionValue}>{script.dosage}</span>
                    </div>
                    <div style={{ marginTop: '8px' }}>
                      <strong style={styles.prescriptionLabel}>Instructions:</strong>
                      <span style={styles.prescriptionValue}>{script.instructions}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p>No prescriptions for this consultation.</p>
              )}

              <div style={styles.actionArea}>
                <button
                  onClick={handleDownload}
                  style={styles.downloadBtn}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#2563EB'}
                >
                  Download Prescription
                </button>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}

// --- STYLES (Internal Design Tokens) ---
const styles = {
  pageContainer: {
    backgroundColor: '#EFF6FF', // Light blue bg
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '"Inter", "Segoe UI", sans-serif',
  },
  mainContent: {
    padding: '40px 20px',
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
  },
  innerContainer: {
    width: '100%',
    maxWidth: '900px', // Restrict width for readability
  },
  breadcrumb: {
    marginBottom: '20px',
  },
  backLink: {
    color: '#3b82f6',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.95rem',
  },
  pageTitle: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '24px',
  },
  // Card Component Styling
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    marginBottom: '24px',
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
  },
  cardHeader: {
    backgroundColor: '#5A9EF9', // Specific sky blue from user
    padding: '16px 24px',
    margin: 0,
    fontSize: '1rem',
    fontWeight: '700',
    color: '#ffffff', // Changed to white
    borderBottom: '1px solid #e2e8f0',
  },
  cardBody: {
    padding: '24px',
  },
  // Info Row Styling
  infoRow: {
    display: 'flex',
    marginBottom: '12px',
    alignItems: 'baseline',
  },
  label: {
    width: '140px',
    fontWeight: '600',
    color: '#64748b',
    flexShrink: 0,
  },
  value: {
    color: '#1e293b',
    fontWeight: '500',
  },
  // Notes Styling
  notesBox: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '16px',
    color: '#334155',
    lineHeight: '1.6',
    fontSize: '0.95rem',
  },
  noteParagraph: {
    marginBottom: '0.5rem',
    marginTop: 0,
  },
  // Prescription Styling
  prescriptionItem: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
  },
  prescriptionLabel: {
    fontWeight: '700',
    color: '#334155',
    marginRight: '8px',
  },
  prescriptionValue: {
    color: '#475569',
  },
  actionArea: {
    marginTop: '24px',
  },
  downloadBtn: {
    backgroundColor: '#2563EB', // Brand Blue
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '0.95rem',
    transition: 'background-color 0.2s',
  }
};
