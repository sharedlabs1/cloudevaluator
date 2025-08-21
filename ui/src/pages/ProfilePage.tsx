import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import LogoutButton from '../components/LogoutButton';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import './ProfilePage.css';

const ProfilePage: React.FC = () => {
  useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', newPassword: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data.data);
        setForm({ ...form, name: res.data.data.name, email: res.data.data.email });
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    await axios.put('/api/users/me', { name: form.name, email: form.email }, { headers: { Authorization: `Bearer ${token}` } });
    setEdit(false);
  };

  const handlePasswordChange = async () => {
    const token = localStorage.getItem('token');
    await axios.post('/api/users/change-password', { password: form.password, newPassword: form.newPassword }, { headers: { Authorization: `Bearer ${token}` } });
    setForm({ ...form, password: '', newPassword: '' });
  };

  return (
    <div>
      <Navbar />
      <LogoutButton />
      <div className="profile-container">
        <h2>Your Profile</h2>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {edit ? (
          <>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <button onClick={handleSave}>Save</button>
          </>
        ) : (
          <>
            <div><strong>Name:</strong> {profile?.name}</div>
            <div><strong>Email:</strong> {profile?.email}</div>
            <div><strong>Role:</strong> {profile?.role}</div>
            <button onClick={() => setEdit(true)}>Edit</button>
          </>
        )}
        <h3>Change Password</h3>
        <input type="password" placeholder="Current Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        <input type="password" placeholder="New Password" value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })} />
        <button onClick={handlePasswordChange}>Change Password</button>
      </div>
    </div>
  );
};

export default ProfilePage;
