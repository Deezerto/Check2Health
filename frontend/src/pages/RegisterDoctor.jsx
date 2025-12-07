import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const RegisterDoctor = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        medicalRole: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch('/api/doctors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to register doctor');
            }

            setSuccess('Doctor registered successfully!');
            setTimeout(() => {
                navigate('/dashboard/staff'); // Or wherever admins should go
            }, 2000);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={{ maxWidth: '500px', margin: '2rem auto', padding: '2rem', boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Register New Doctor</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                    <label>First Name</label>
                    <input type="text" name="firstName" onChange={handleChange} required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label>Last Name</label>
                    <input type="text" name="lastName" onChange={handleChange} required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label>Medical Role (e.g., General Practitioner)</label>
                    <input type="text" name="medicalRole" onChange={handleChange} required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label>Email</label>
                    <input type="email" name="email" onChange={handleChange} required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label>Password</label>
                    <input type="password" name="password" onChange={handleChange} required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <button type="submit" style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: 'none', backgroundColor: '#2563eb', color: 'white', cursor: 'pointer' }}>
                    Register Doctor
                </button>
            </form>
            {error && <p style={{ color: 'red', textAlign: 'center', marginTop: '1rem' }}>{error}</p>}
            {success && <p style={{ color: 'green', textAlign: 'center', marginTop: '1rem' }}>{success}</p>}
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <Link to="/staff-dashboard">Back to Dashboard</Link>
            </div>
        </div>
    );
};

export default RegisterDoctor;
