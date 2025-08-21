import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import LogoutButton from '../components/LogoutButton';
import { useAuth } from '../hooks/useAuth';
import CloudAllocationForm from '../components/CloudAllocationForm';
import './BatchDetailPage.css';

const BatchDetailPage: React.FC = () => {
  useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState<any>(null);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [cloudAccounts, setCloudAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAllocForm, setShowAllocForm] = useState(false);

  useEffect(() => {
    const fetchBatchAndAllocations = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const [batchRes, allocRes, accountsRes] = await Promise.all([
          axios.get(`/api/batches/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/cloud/allocations', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/cloud', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setBatch(batchRes.data.data);
        setAllocations(allocRes.data.data.filter((a: any) => a.batchid === Number(id)));
        setCloudAccounts(accountsRes.data.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load batch or allocations');
      } finally {
        setLoading(false);
      }
    };
    fetchBatchAndAllocations();
  }, [id]);

  const handleRemove = async (allocationId: string) => {
    if (!window.confirm('Remove this allocation?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/cloud/allocations/${allocationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh allocations
      const allocRes = await axios.get('/api/cloud/allocations', { headers: { Authorization: `Bearer ${token}` } });
      setAllocations(allocRes.data.data.filter((a: any) => a.batchid === Number(id)));
    } catch (err: any) {
      alert('Failed to remove allocation');
    }
  };

  return (
    <div>
      <Navbar />
      <LogoutButton />
      <div className="batch-detail-container">
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {batch && (
          <>
            <h2>Batch: {batch.name}</h2>
            <h3>Students</h3>
            <ul>
              {batch.students?.map((s: any) => (
                <li key={s.id}>{s.name} ({s.email})</li>
              ))}
            </ul>
            <h3>Cloud Allocations</h3>
            <button onClick={() => setShowAllocForm(true)}>Allocate Cloud Account</button>
            <ul className="cloud-allocation-list">
              {allocations.length === 0 && <li>No cloud accounts allocated to this batch.</li>}
              {allocations.map(a => {
                const acc = cloudAccounts.find((c: any) => c.id === a.cloudaccountid);
                return (
                  <li key={a.id}>
                    {acc
                      ? <>
                          <b>{acc.name}</b> ({acc.provider})
                          <span
                            className="cloud-allocation-link"
                            onClick={() => navigate(`/cloud/${acc.id}`)}
                          >[Edit]</span>
                          <span
                            className="cloud-allocation-link"
                            onClick={() => handleRemove(a.id)}
                          >[Remove]</span>
                        </>
                      : <>Cloud Account ID: {a.cloudaccountid}</>
                    }
                    (Assessment: {a.assessmentid || 'N/A'})
                  </li>
                );
              })}
            </ul>
            {showAllocForm && (
              <CloudAllocationForm onClose={() => setShowAllocForm(false)} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BatchDetailPage;