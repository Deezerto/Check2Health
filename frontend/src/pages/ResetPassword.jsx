import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const [token, setToken] = useState(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const resetToken = searchParams.get('token');
        if (resetToken) {
            setToken(resetToken);
        } else {
            setError('Invalid or missing reset token. Please request a new link.');
        }
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            setLoading(false);
            return;
        }

        if (!token) {
            setError('Missing reset token.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, newPassword: password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to reset password.');
            }

            setMessage('Password reset successfully.');

        } catch (err) {
            setError(err.message);
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

                    <h1 className="auth-title" style={{ fontSize: '1.5rem' }}>Reset Password</h1>

                    {message ? (
                        <div style={{ textAlign: 'center', color: 'green' }}>
                            <p>{message}</p>
                            <Link to="/login" className="btn btn-blue" style={{ textDecoration: 'none' }}>Click here to login</Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                            <div className="form-grid">
                                <label className="form-label">
                                    New Password
                                    <input
                                        type="password"
                                        className="input"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength="8"
                                        disabled={loading || !token}
                                    />
                                </label>
                                <label className="form-label">
                                    Confirm New Password
                                    <input
                                        type="password"
                                        className="input"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        minLength="8"
                                        disabled={loading || !token}
                                    />
                                </label>
                            </div>

                            <button type="submit" className="btn btn-blue auth-primary" style={{ marginTop: '1rem' }} disabled={loading || !token}>
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
