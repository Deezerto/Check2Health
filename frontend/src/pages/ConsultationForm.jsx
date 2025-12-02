import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardNav from '../components/DashboardNav'; 

// UPDATED IMPORT: Pointing to the components folder for CSS
import '../components/ConsultationForm.css'; 

export default function ConsultationForm() {
  const navigate = useNavigate();
  const { id } = useParams(); 
  
  // State for form fields
  const [notes, setNotes] = useState('');
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock Patient Name
  const patientName = "John Smith"; 

  // Handlers
  const addPrescription = () => {
    setPrescriptions([...prescriptions, { name: '', dosage: '', instructions: '' }]);
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

  const handleComplete = () => {
    setLoading(true);
    // Simulate Backend API Call
    setTimeout(() => {
      console.log("Saving:", { appointmentId: id, notes, prescriptions });
      setLoading(false);
      navigate('/dashboard/doctor');
    }, 1500);
  };

  return (
    <div className="consultation-page">
      <DashboardNav 
        userName="Dr. Elvin Lagamo" 
        role="DOCTOR" 
        active="My Schedule" 
        items={['Dashboard', 'My Schedule', 'My Appointments']} 
      />

      <div className="consultation-container">
        <div className="consultation-content">
          
          <h1 className="page-title">Consultation Notes: {patientName}</h1>

          {/* Doctor's Notes Card */}
          <div className="form-card">
            <h2 className="card-header">Doctor's Notes</h2>
            <p className="helper-text">Enter your diagnosis, observations, and advice for the patient.</p>
            <textarea 
              className="notes-area" 
              placeholder="Patient presented with..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
                        value={p.name}
                        onChange={(e) => updatePrescription(index, 'name', e.target.value)}
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
              onClick={() => navigate(-1)} 
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              className="btn-complete" 
              onClick={handleComplete}
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