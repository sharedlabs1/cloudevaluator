import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import LogoutButton from '../components/LogoutButton';
import CloudAccountForm from '../components/CloudAccountForm';
import CloudAllocationForm from '../components/CloudAllocationForm';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import './CloudAccountsPage.css';

const CloudAccountsPage: React.FC = () => {
  useAuth();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showAllocForm, setShowAllocForm] = useState(false);
  const [editAccount, setEditAccount] = useState<any | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAccounts = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/cloud', { headers: { Authorization: `Bearer ${token}` } });
      setAccounts(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load cloud accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleEdit = (account: any) => {
    setEditAccount(account);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this cloud account?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/cloud/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchAccounts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ float: 'right', margin: 8 }}><LogoutButton /></div>
      <h2>Cloud Accounts</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <button onClick={() => { setEditAccount(null); setShowForm(true); }}>Add Cloud Account</button>
      <button onClick={() => setShowAllocForm(true)} style={{ marginLeft: 8 }}>Allocate Cloud Account</button>
      {loading ? <div>Loading...</div> : (
        <table className="cloud-accounts-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Provider</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map(a => (
              <tr key={a.id}>
                <td>{a.name}</td>
                <td>{a.provider}</td>
                <td>{a.createdAt ? new Date(a.createdAt).toLocaleString() : ''}</td>
                <td>
                  <button onClick={() => handleEdit(a)}>Edit</button>
                  <button onClick={() => handleDelete(a.id)} style={{ marginLeft: 8 }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showForm && (
        <CloudAccountForm initial={editAccount} onClose={() => { setShowForm(false); fetchAccounts(); }} />
      )}
      {showAllocForm && (
        <CloudAllocationForm onClose={() => setShowAllocForm(false)} />
      )}
    </div>
  );
};

export default CloudAccountsPage;