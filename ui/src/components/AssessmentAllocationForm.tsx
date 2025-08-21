import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AssessmentAllocationForm: React.FC<{ assessmentId: string, onClose: () => void }> = ({ assessmentId, onClose }) => {
  const [batches, setBatches] = useState<any[]>([]);
  const [batchId, setBatchId] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('/api/batches', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setBatches(res.data.data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/assessments/allocate', { assessmentId, batchId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Allocation failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <form onSubmit={handleSubmit}>
        <h3>Allocate Assessment</h3>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <label htmlFor="batch-select">Batch</label>
        <select id="batch-select" value={batchId} onChange={e => setBatchId(e.target.value)} required>
          <option value="">Select Batch</option>
          {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <button type="submit" disabled={saving}>{saving ? 'Allocating...' : 'Allocate'}</button>
        <button type="button" onClick={onClose}>Cancel</button>
      </form>
    </div>
  );
};
export default AssessmentAllocationForm;