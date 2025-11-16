import React, { useState, useRef, useEffect } from 'react';
import './ProfileModal.css'; // You can create this CSS file for custom styles

export default function ProfileModal({ user, open, onClose, onSave }) {
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(user);
  const [profilePic, setProfilePic] = useState(user.profilePic || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef();

  // Fetch latest info from backend when opened
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError("");
    // Try to get user id and role from session
    let id = null, role = null;
    try {
      const raw = sessionStorage.getItem('auth.user');
      if (raw) {
        const u = JSON.parse(raw);
        id = u.patientID || u.patientId || u.id;
        role = u.role;
      }
    } catch {}
    if (role === 'PATIENT' && id) {
      fetch(`/api/patients/${id}`)
        .then(r => r.ok ? r.json() : Promise.reject('Failed to fetch profile'))
        .then(data => {
          setForm({
            name: [data.firstName, data.lastName].filter(Boolean).join(' ').trim(),
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            contactNumber: data.contactNumber || data.phoneNumber || '',
            birthDate: data.birthDate || data.dateOfBirth || '',
            street: data.street || '',
            barangay: data.barangay || '',
            municipality: data.municipality || data.city || '',
            province: data.province || '',
            profilePic: data.profilePic || null
          });
          setProfilePic(data.profilePic || null);
        })
        .catch(e => setError(e.toString()))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [open]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => {
    setEditMode(false);
    setError("");
    setProfilePic(form.profilePic || null);
    // Refetch to reset form
    if (user) setForm(user);
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    setEditMode(false);
    // Only allow editing contact/address/profilePic
    let id = null, role = null;
    try {
      const raw = sessionStorage.getItem('auth.user');
      if (raw) {
        const u = JSON.parse(raw);
        id = u.patientID || u.patientId || u.id;
        role = u.role;
      }
    } catch {}
    if (role === 'PATIENT' && id) {
      const payload = {
        // Only updatable fields
        contactNumber: form.contactNumber,
        street: form.street,
        barangay: form.barangay,
        municipality: form.municipality,
        province: form.province,
        profilePic: profilePic
      };
      try {
        const res = await fetch(`/api/patients/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload })
        });
        if (!res.ok) throw new Error('Failed to update profile');
        const updated = await res.json();
        // Update sessionStorage
        const raw = sessionStorage.getItem('auth.user');
        if (raw) {
          const u = JSON.parse(raw);
          const merged = { ...u, ...updated };
          sessionStorage.setItem('auth.user', JSON.stringify(merged));
        }
        if (onSave) onSave(updated);
      } catch (e) {
        setError(e.toString());
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setProfilePic(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal profile-modal">
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2 className="profile-title">
          <span role="img" aria-label="profile">👤</span> My Profile
        </h2>
        {loading && <div style={{color:'#888',marginBottom:'1rem'}}>Loading...</div>}
        {error && <div style={{color:'#dc2626',marginBottom:'1rem'}}>{error}</div>}
        <div className="profile-content">
          <div className="profile-pic-section">
            <div className="profile-pic-circle" onClick={() => editMode && fileInputRef.current.click()}>
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="profile-pic-img" />
              ) : (
                <span className="profile-pic-placeholder">{form.firstName?.[0] || 'U'}</span>
              )}
              {editMode && <div className="profile-pic-edit">Change</div>}
            </div>
            {editMode && (
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handlePicChange}
              />
            )}
          </div>
          <form className="profile-form" onSubmit={e => e.preventDefault()}>
            <div className="profile-row">
              <label>Name</label>
              <input name="name" value={form.name || ''} disabled />
              <label>Email</label>
              <input name="email" value={form.email || ''} disabled />
            </div>
            <div className="profile-row">
              <label>Contact Number</label>
              <input name="contactNumber" value={form.contactNumber || ''} onChange={handleChange} disabled={!editMode} />
              <label>Birth Date</label>
              <input name="birthDate" value={form.birthDate || ''} disabled />
            </div>
            <div className="profile-section-title">Address</div>
            <div className="profile-row">
              <label>Street</label>
              <input name="street" value={form.street || ''} onChange={handleChange} disabled={!editMode} />
              <label>Barangay</label>
              <input name="barangay" value={form.barangay || ''} onChange={handleChange} disabled={!editMode} />
            </div>
            <div className="profile-row">
              <label>Municipality</label>
              <input name="municipality" value={form.municipality || ''} onChange={handleChange} disabled={!editMode} />
              <label>Province</label>
              <input name="province" value={form.province || ''} onChange={handleChange} disabled={!editMode} />
            </div>
            <div className="profile-actions">
              {editMode ? (
                <>
                  <button className="btn btn-green" type="button" onClick={handleSave} disabled={loading}>Save</button>
                  <button className="btn btn-gray" type="button" onClick={handleCancel} disabled={loading}>Cancel</button>
                </>
              ) : (
                <button className="btn btn-green" type="button" onClick={handleEdit}>Edit</button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
