import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            // We don't care about the response status for security reasons.
            // Always show the same message.
            setMessage('If an account with this email exists, a reset link has been sent.');

        } catch (err) {
            // Still show the generic message even if there's a network error,
            // but log the error for debugging.
            console.error("Forgot password error:", err);
            setMessage('If an account with this email exists, a reset link has been sent.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-bg">
            <div className="auth-card" style={{ maxWidth: '450px' }}>
                <div className="auth-card-inner">
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <img src="/assets/logo.png" alt="Check2Health Logo" style={{ maxWidth: '200px', height: 'auto' }} />
                    </div>
                    
                    <h1 className="auth-title" style={{ fontSize: '1.5rem' }}>Forgot Password</h1>
                    
                    {message ? (
                        <div style={{ textAlign: 'center', color: 'green', marginBottom: '1rem' }}>
                            <p>{message}</p>
                            <Link to="/login" className="btn btn-blue" style={{ textDecoration: 'none' }}>Back to Login</Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '1.5rem' }}>
                                Enter your email address and we will send you a link to reset your password.
                            </p>
                            <div className="form-grid">
                                <label className="form-label">
                                    Email Address
                                    <input
                                        type="email"
                                        className="input"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </label>
                            </div>

                            {error && <p style={{ color: 'red', textAlign: 'center', marginTop: '1rem' }}>{error}</p>}

                            <button type="submit" className="btn btn-blue auth-primary" disabled={loading}>
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>
                    )}

                    <div className="auth-return" style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <Link to="/login">Remember your password?</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
