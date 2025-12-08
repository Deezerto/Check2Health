import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardNav from '../components/DashboardNav'

const RegisterDoctor = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        medicalRole: '',
        email: '',
        password: '',
        phoneNumber: '+63 '
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePhoneChange = (e) => {
        const prefix = '+63 ';
        let value = e.target.value;

        // Ensure prefix is always there
        if (!value.startsWith(prefix)) {
            value = prefix;
        }

        // Get only the numbers after the prefix
        let numbers = value.substring(prefix.length).replace(/[^0-9]/g, '');

        // Limit to 10 digits
        if (numbers.length > 10) {
            numbers = numbers.substring(0, 10);
        }

        // Add spaces for formatting
        let formattedNumber = prefix;
        if (numbers.length > 0) {
            formattedNumber += numbers.substring(0, 3);
        }
        if (numbers.length > 3) {
            formattedNumber += ' ' + numbers.substring(3, 6);
        }
        if (numbers.length > 6) {
            formattedNumber += ' ' + numbers.substring(6, 10);
        }

        setFormData({ ...formData, phoneNumber: formattedNumber });
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
        <div className="dash-bg">
            <DashboardNav active="Dashboard" items={["Dashboard", "Manage Appointments", "Schedules", "Analytics"]} role="STAFF" />
            <main className="container dash-main">
                <div style={{ maxWidth: '500px', margin: '2rem auto', padding: '2rem', boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: '8px', background: '#fff' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Register New Doctor</h2>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label>First Name</label>
                            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label>Last Name</label>
                            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label>Medical Role (e.g., General Practitioner)</label>
                            <input type="text" name="medicalRole" value={formData.medicalRole} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label>Phone Number</label>
                            <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handlePhoneChange} required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label>Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label>Password</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>
                        <button type="submit" style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: 'none', backgroundColor: '#2563eb', color: 'white', cursor: 'pointer' }}>
                            Register Doctor
                        </button>
                    </form>
                    {error && <p style={{ color: 'red', textAlign: 'center', marginTop: '1rem' }}>{error}</p>}
                    {success && <p style={{ color: 'green', textAlign: 'center', marginTop: '1rem' }}>{success}</p>}
                </div>
            </main>
        </div>
    );
};

export default RegisterDoctor;
