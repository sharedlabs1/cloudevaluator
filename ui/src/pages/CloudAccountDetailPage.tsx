import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import LogoutButton from '../components/LogoutButton';
import CloudAccountForm from '../components/CloudAccountForm';
import { useAuth } from '../hooks/useAuth';
import './CloudAccountsPage.css';

const CloudAccountDetailPage: React.FC = () => {
  useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState<any>(null);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const [accRes, allocRes] = await Promise.all([
          axios.get(`/api/cloud/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/cloud/allocations', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setAccount(accRes.data.data);
        setAllocations(allocRes.data.data.filter((a: any) => a.cloudaccountid === Number(id)));
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load cloud account');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id, showEdit]);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/cloud/test', {
        provider: account.provider,
        credentials: account.credentials
      }, { headers: { Authorization: `Bearer ${token}` } });
      setTestResult(res.data.data?.success ? 'Success' : 'Failed');
    } catch {
      setTestResult('Failed');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div>
      <Navbar />
      <LogoutButton />
      <div className="cloud-accounts-container">
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {account && (
          <>
            <h2>Cloud Account: {account.name}</h2>
            <div><b>Provider:</b> {account.provider}</div>
            <div><b>Description:</b> {account.description}</div>
            <div><b>Active:</b> {account.is_active ? 'Yes' : 'No'}</div>
            <div style={{ margin: '1rem 0' }}>
              <button onClick={() => setShowEdit(true)}>Edit</button>
              <button onClick={handleTest} disabled={testing} style={{ marginLeft: 8 }}>
                {testing ? 'Testing...' : 'Test Connection'}
              </button>
              {testResult && (
                <span style={{ marginLeft: 8, color: testResult === 'Success' ? 'green' : 'red' }}>
                  {testResult}
                </span>
              )}
              <button onClick={() => navigate('/cloud')} style={{ marginLeft: 8 }}>Back to List</button>
            </div>
            <h3>Allocations</h3>
            <ul>
              {allocations.length === 0 && <li>No allocations for this account.</li>}
              {allocations.map(a => (
                <li key={a.id}>
                  Assessment: {a.assessmentid || 'N/A'}, Batch: {a.batchid || 'N/A'}
                </li>
              ))}
            </ul>
            {showEdit && (
              <CloudAccountForm
                initial={account}
                onClose={() => setShowEdit(false)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CloudAccountDetailPage;