import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import DashboardNav from "../components/DashboardNav";
import "../components/AppointmentDetails.css"; // Assuming this CSS file exists and is styled

export default function AppointmentDetails() {
  const navigate = useNavigate();
  const { id } = useParams(); // Gets the appointment ID from the URL (e.g., /dashboard/doctor/appointment/:id)
  
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Effect to get the logged-in user from session storage
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('auth.user');
      if (raw) {
        setUser(JSON.parse(raw));
      } else {
        navigate('/login');
      }
    } catch {
      navigate('/login');
    }
  }, [navigate]);

  // Effect to fetch appointment details from the backend
  useEffect(() => {
    if (id) {
      setLoading(true);
      fetch(`/api/reservations/${id}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch appointment details.');
          }
          return response.json();
        })
        .then(data => {
          setAppointment(data);
          setError(null);
        })
        .catch(err => {
          console.error("Fetch error:", err);
          setError(err.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]); // This effect runs whenever the appointment 'id' from the URL changes

  const handleBeginConsultation = () => {
    // This will navigate the doctor to the post-consultation form
    navigate(`/dashboard/doctor/consultation/${id}`);
  };

  if (loading) {
    return <div className="loading-screen">Loading Appointment Details...</div>;
  }

  if (error) {
    return <div className="error-screen">Error: {error}</div>;
  }
  
  if (!appointment) {
    return <div className="error-screen">Appointment not found.</div>;
  }

  // Formatting data for display
  const patient = appointment.patient;
  const patientName = patient ? `${patient.firstName} ${patient.lastName}` : "N/A";
  const dob = patient ? new Date(patient.birthdate).toLocaleDateString() : "N/A";

  // NOTE: The backend 'Reservation' entity does not seem to have fields for allergies, medications,
  // medical history, or a structured list of symptoms. 
  // For now, these fields are left blank. They will need to be added to the backend `Reservation` entity
  // and the data capture form used by the patient.
  const symptoms = Array.isArray(appointment.symptoms) ? appointment.symptoms : [];

  return (
    <div className="app-details-page">
      <DashboardNav 
        userName={`Dr. ${user?.firstName || ''} ${user?.lastName || ''}`}
        active="Dashboard" 
        items={['Dashboard', 'My Schedule']} 
      />

      <div className="app-details-container">
        <div className="content-wrapper">
          
          <div className="back-link-container">
            <Link to="/dashboard/doctor" className="back-link">
              &lt; Back to Dashboard
            </Link>
          </div>

          <h1 className="page-title">
            Appointment: {patientName}
          </h1>

          <div className="info-card">
            <h2 className="card-header">Patient Info</h2>
            <div className="info-grid">
              <div className="info-row"><span className="label">Date of Birth:</span><span className="value">{dob}</span></div>
              <div className="info-row"><span className="label">Gender:</span><span className="value">{patient?.gender || "N/A"}</span></div>
              <div className="info-row"><span className="label">Known Allergies:</span><span className="value">N/A</span></div>
              <div className="info-row"><span className="label">Current Medications:</span><span className="value">N/A</span></div>
              <div className="info-row"><span className="label">Medical History:</span><span className="value">N/A</span></div>
            </div>
          </div>

          <div className="info-card">
            <h2 className="card-header">Pre-Consultation Data</h2>
            <div className="data-section">
              <div className="info-row">
                <span className="label">Reason for Visit:</span>
                <span className="value">{appointment.purpose || "N/A"}</span>
              </div>
            </div>
            {symptoms.length > 0 && (
              <div className="data-section">
                <span className="label block-label">Reported Symptoms:</span>
                <ul className="symptoms-list">
                  {symptoms.map((symptom, index) => <li key={index}>{symptom}</li>)}
                </ul>
              </div>
            )}
            <div className="data-section">
              <span className="label block-label">Patient's Detailed Description:</span>
              <p className="description-text">
                {appointment.description || "No description provided."}
              </p>
            </div>
          </div>

          <div className="action-footer">
            <button className="btn-begin" onClick={handleBeginConsultation}>
              Begin Consultation
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}