import React, { useState } from 'react';
import axios from 'axios';

const PROVIDERS = ['aws', 'azure', 'gcp'] as const;

const CloudAccountForm: React.FC<{
  initial?: any;
  onClose: () => void;
}> = ({ initial, onClose }) => {
  const [name, setName] = useState(initial?.name || '');
  const [provider, setProvider] = useState(initial?.provider || 'aws');
  const [credentials, setCredentials] = useState(
    initial?.credentials ? JSON.stringify(initial.credentials, null, 2) : ''
  );
  const [description, setDescription] = useState(initial?.description || '');
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const data = {
        name,
        provider,
        credentials: JSON.parse(credentials),
        description,
        is_active: isActive,
      };
      if (initial) {
        await axios.put(`/api/cloud/${initial.id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/cloud', data, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cloud-account-form-modal">
      <div className="cloud-account-form">
        <h3>{initial ? 'Edit' : 'Add'} Cloud Account</h3>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>Name</label>
          <input value={name} onChange={e => setName(e.target.value)} required />
          <label>Provider</label>
          <select value={provider} onChange={e => setProvider(e.target.value)}>
            {PROVIDERS.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
          </select>
          <label>Credentials (JSON)</label>
          <textarea
            value={credentials}
            onChange={e => setCredentials(e.target.value)}
            rows={6}
            required
            placeholder='{"key": "value"}'
          />
          <label>Description</label>
          <input value={description} onChange={e => setDescription(e.target.value)} />
          <label>
            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
            Active
          </label>
          <div style={{ marginTop: 16 }}>
            <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            <button type="button" onClick={onClose} style={{ marginLeft: 8 }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CloudAccountForm;