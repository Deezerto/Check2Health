import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import DashboardNav from "../components/DashboardNav";
import "../components/AppointmentDetails.css";

export default function AppointmentDetails() {
  const navigate = useNavigate();
  const { id } = useParams(); // Assuming URL is /appointment/:id
  const [loading, setLoading] = useState(true);
  
  // State to hold the data shown in the wireframe
  const [appointment, setAppointment] = useState(null);

  // Simulate fetching data from backend
  useEffect(() => {
    // In a real app, use: fetch(`/api/appointments/${id}`)...
    // For now, we mock the data exactly as seen in your screenshot
    setTimeout(() => {
      setAppointment({
        id: 1,
        patientName: "Elvin Opalla Lagamo Jr.",
        patientInfo: {
          dob: "01/01/2001",
          gender: "Male",
          allergies: "Penicillin (causes rash), Peanuts",
          medications: "Albuterol Inhaler (as needed), Claritin 10mg (daily)",
          medicalHistory: "Asthma (diagnosed 2010), Seasonal Allergies"
        },
        preConsultation: {
          reason: "Follow-up on persistent cough",
          symptoms: ["Cough", "Fatigue", "Sore Throat"],
          description: "The cough started 3 weeks ago and is not getting better. It is dry and worse at night. I have also been feeling very tired. Over-the-counter medicine is not helping."
        }
      });
      setLoading(false);
    }, 500);
  }, [id]);

  const handleBeginConsultation = () => {
    // Navigates to Screen 3.4 (Post-Consultation Form)
    // Adjust the path below to match your route configuration
    navigate(`/dashboard/doctor/consultation/${id || 1}`);
  };

  // Prepare props for the DashboardNav
  const navItems = ['Dashboard', 'My Schedule', 'My Appointments'];
  
  if (loading) return <div className="loading-screen">Loading Appointment Details...</div>;
  if (!appointment) return <div className="error-screen">Appointment not found.</div>;

  return (
    <div className="app-details-page">
      {/* 1. Header Navigation */}
      <DashboardNav 
        userName="Dr. Elvin Lagamo" 
        role="DOCTOR" 
        active="My Schedule" 
        items={navItems} 
      />

      <div className="app-details-container">
        <div className="content-wrapper">
          
          {/* 2. Back Link */}
          <div className="back-link-container">
            <Link to="/dashboard/doctor" className="back-link">
              &lt; Back to Dashboard
            </Link>
          </div>

          {/* 3. Title */}
          <h1 className="page-title">
            Appointment: {appointment.patientName}
          </h1>

          {/* 4. Patient Info Card */}
          <div className="info-card">
            <h2 className="card-header">Patient Info</h2>
            <div className="info-grid">
              <div className="info-row">
                <span className="label">Date of Birth:</span>
                <span className="value">{appointment.patientInfo.dob}</span>
              </div>
              <div className="info-row">
                <span className="label">Gender:</span>
                <span className="value">{appointment.patientInfo.gender}</span>
              </div>
              <div className="info-row">
                <span className="label">Known Allergies:</span>
                <span className="value">{appointment.patientInfo.allergies}</span>
              </div>
              <div className="info-row">
                <span className="label">Current Medications:</span>
                <span className="value">{appointment.patientInfo.medications}</span>
              </div>
              <div className="info-row">
                <span className="label">Medical History:</span>
                <span className="value">{appointment.patientInfo.medicalHistory}</span>
              </div>
            </div>
          </div>

          {/* 5. Pre-Consultation Data Card */}
          <div className="info-card">
            <h2 className="card-header">Pre-Consultation Data</h2>
            
            <div className="data-section">
              <div className="info-row">
                <span className="label">Reason for Visit:</span>
                <span className="value">{appointment.preConsultation.reason}</span>
              </div>
            </div>

            <div className="data-section">
              <span className="label block-label">Reported Symptoms:</span>
              <ul className="symptoms-list">
                {appointment.preConsultation.symptoms.map((symptom, index) => (
                  <li key={index}>{symptom}</li>
                ))}
              </ul>
            </div>

            <div className="data-section">
              <span className="label block-label">Patient's Detailed Description:</span>
              <p className="description-text">
                {appointment.preConsultation.description}
              </p>
            </div>
          </div>

          {/* 6. Action Button */}
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