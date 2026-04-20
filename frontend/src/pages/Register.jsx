import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm]       = useState({ name: '', email: '', password: '', phone: '', role: 'user', location: '' });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep]       = useState(1); // 1 = Form, 2 = OTP
  const [otp, setOtp]         = useState('');
  const { login }             = useAuth();
  const navigate              = useNavigate();

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await api.post('/auth/register', form);
      setSuccess(data.message || 'OTP sent to your email.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await api.post('/auth/verify-otp', { email: form.email, otp });
      login(data);
      navigate(data.role === 'provider' ? '/dashboard' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass">
        {step === 1 ? (
          <>
            <h2>Create account</h2>
            <p>Join Slotify today</p>

            <div className="role-toggle">
              {['user', 'provider'].map((r) => (
                <button key={r} type="button"
                  className={`role-btn ${form.role === r ? 'active' : ''}`}
                  onClick={() => setForm({ ...form, role: r })}>
                  {r === 'user' ? 'I\'m a User' : 'I\'m a Provider'}
                </button>
              ))}
            </div>

            {error && <div className="error-msg">{error}</div>}
            {success && <div className="success-banner">{success}</div>}
            <form onSubmit={handleRegisterSubmit}>
              <div className="field">
                <label>Full name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Priya Sharma" required />
              </div>
              <div className="field">
                <label>Email</label>
                <input type="email" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com" required />
              </div>
              <div className="field">
                <label>Phone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 98765 43210" />
              </div>
              <div className="field">
                <label>Password</label>
                <input type="password" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="At least 6 characters" required />
              </div>
              <div className="field">
                <label>Location</label>
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Hyderabad" required />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Sending OTP…' : 'Continue'}
              </button>
            </form>
            <p className="auth-link">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </>
        ) : (
          <>
            <h2>Verify Email</h2>
            <p>Enter the 6-digit OTP sent to <strong>{form.email}</strong></p>
            {error && <div className="error-msg">{error}</div>}
            {success && <div className="success-banner">{success}</div>}
            
            <form onSubmit={handleOtpSubmit}>
              <div className="field">
                <label>OTP Code</label>
                <input 
                  type="text" 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456" 
                  maxLength={6}
                  style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '20px' }}
                  required 
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Verifying…' : 'Verify & Create Account'}
              </button>
            </form>
            <p className="auth-link" style={{ marginTop: '16px' }}>
              <button type="button" className="btn-outline-sm" onClick={() => setStep(1)}>
                Change Email
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}