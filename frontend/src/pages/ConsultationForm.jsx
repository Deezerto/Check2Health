import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import DashboardNav from '../components/DashboardNav';
import '../components/ConsultationForm.css';

export default function ConsultationForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // Get appointment ID from URL
  
  const [patientName, setPatientName] = useState("Loading Patient...");
  const [doctorNotes, setDoctorNotes] = useState('');
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false); // For form submission
  const [fetchingData, setFetchingData] = useState(true); // For initial data fetch
  const [error, setError] = useState(null); // For fetch or submission errors
  const [user, setUser] = useState(null); // For DashboardNav

  // Fetch logged-in user for DashboardNav
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

  // Fetch appointment details to get patient name
  useEffect(() => {
    if (id) {
      setFetchingData(true);
      fetch(`/api/reservations/${id}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch appointment details for consultation.');
          }
          return response.json();
        })
        .then(data => {
          if (data && data.patient) {
            setPatientName(`${data.patient.firstName} ${data.patient.lastName}`);
          }
          // Optionally load existing notes/prescriptions if editing an incomplete consultation
          // if (data.doctorNotes) setDoctorNotes(data.doctorNotes);
          // if (data.postConsultationData) setPrescriptions(JSON.parse(data.postConsultationData));
          setError(null);
        })
        .catch(err => {
          console.error("Fetch error:", err);
          setError(err.message);
          setPatientName("Error loading patient name");
        })
        .finally(() => {
          setFetchingData(false);
        });
    }
  }, [id]);

  const addPrescription = () => {
    setPrescriptions([...prescriptions, { medicationName: '', dosage: '', instructions: '' }]);
  };

  const updatePrescription = (index, field, value) => {
    const updated = [...prescriptions];
    updated[index][field] = value;
    setPrescriptions(updated);
  };

  const removePrescription = (index) => {
    const updated = prescriptions.filter((_, i) => i !== index);
    setPrescriptions(updated);
  };

  const handleCompleteAppointment = () => {
    setLoading(true);
    setError(null);

    // Prepare data for backend
    const postData = {
      doctorNotes: doctorNotes,
      postConsultationData: JSON.stringify(prescriptions), // Convert array of prescriptions to JSON string
      reservationStatus: 'COMPLETED'
    };

    fetch(`/api/reservations/${id}/consultation`, { // Assuming a PATCH endpoint for updating consultation data
      method: 'PATCH', // Or PUT, depending on your API design for partial updates
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${sessionStorage.getItem('auth.token')}` // Add token if authentication is needed
      },
      body: JSON.stringify(postData),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to complete appointment.');
        }
        return response.json();
      })
      .then(() => {
        navigate('/dashboard/doctor'); // Redirect to dashboard on success
      })
      .catch(err => {
        console.error("Submission error:", err);
        setError(err.message || 'Error completing appointment.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (fetchingData) {
    return <div className="loading-screen">Loading consultation form...</div>;
  }

  return (
    <div className="consultation-page">
      <DashboardNav 
        userName={`Dr. ${user?.firstName || ''} ${user?.lastName || ''}`}
        active="Dashboard" 
        items={['Dashboard', 'My Schedule']} 
      />

      <div className="consultation-container">
        <div className="consultation-content">
          
          <h1 className="page-title">Consultation Notes: {patientName}</h1>

          {error && <div className="error-message">{error}</div>}

          {/* Doctor's Notes Card */}
          <div className="form-card">
            <h2 className="card-header">Doctor's Notes</h2>
            <p className="helper-text">Enter your diagnosis, observations, and advice for the patient.</p>
            <textarea 
              className="notes-area" 
              placeholder="Patient presented with..."
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              rows="8"
            />
          </div>

          {/* Prescriptions Card */}
          <div className="form-card">
            <div className="card-header-row">
              <h2 className="card-header" style={{marginBottom:0}}>Prescriptions</h2>
              <button className="btn-add-presc" onClick={addPrescription}>+ Add Prescription</button>
            </div>
            
            <div className="prescriptions-list">
              {prescriptions.length === 0 ? (
                <div className="empty-state">No prescriptions added.</div>
              ) : (
                prescriptions.map((p, index) => (
                  <div key={index} className="prescription-item">
                    <div className="presc-row">
                      <input 
                        placeholder="Medication Name" 
                        value={p.medicationName}
                        onChange={(e) => updatePrescription(index, 'medicationName', e.target.value)}
                        className="input-field"
                      />
                      <input 
                        placeholder="Dosage (e.g. 500mg)" 
                        value={p.dosage}
                        onChange={(e) => updatePrescription(index, 'dosage', e.target.value)}
                        className="input-field"
                      />
                    </div>
                    <input 
                      placeholder="Instructions (e.g. Twice a day after meals)" 
                      value={p.instructions}
                      onChange={(e) => updatePrescription(index, 'instructions', e.target.value)}
                      className="input-field full-width"
                    />
                    <button className="btn-remove" onClick={() => removePrescription(index)}>Remove</button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button 
              className="btn-cancel" 
              onClick={() => navigate(-1)} // Go back to the previous page (Appointment Details)
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              className="btn-complete" 
              onClick={handleCompleteAppointment}
              disabled={loading}
            >
              {loading ? 'Completing...' : 'Complete Appointment'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}