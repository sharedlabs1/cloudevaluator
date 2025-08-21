import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import LogoutButton from '../components/LogoutButton';
import { useAuth } from '../hooks/useAuth';
import CloudAllocationForm from '../components/CloudAllocationForm';
import AssessmentAllocationForm from '../components/AssessmentAllocationForm';
import './AssessmentDetailPage.css';

const AssessmentDetailPage: React.FC = () => {
  useAuth();
  const { id } = useParams();
  const [assessment, setAssessment] = useState<any>(null);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [cloudAccounts, setCloudAccounts] = useState<any[]>([]);
  const [showAllocForm, setShowAllocForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const [assessmentRes, allocRes, accountsRes] = await Promise.all([
          axios.get(`/api/assessments/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/cloud/allocations', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/cloud', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setAssessment(assessmentRes.data.data);
        setAllocations(allocRes.data.data.filter((a: any) => a.assessmentid === Number(id)));
        setCloudAccounts(accountsRes.data.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load assessment or allocations');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  return (
    <div>
      <Navbar />
      <LogoutButton />
      <div className="assessment-detail-container">
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {assessment && (
          <>
            <h2>{assessment.title}</h2>
            <p>{assessment.description}</p>
            <h3>Questions</h3>
            {assessment.questions.map((q: any) => (
              <div key={q.id} className="question-block">
                <h4>Scenario: {q.scenario}</h4>
                <div>
                  <strong>Validation Script:</strong>
                  <pre>{q.evaluationScript}</pre>
                </div>
                <h5>Tasks</h5>
                <ul>
                  {q.tasks.map((t: any) => (
                    <li key={t.id}>
                      <Link to={`/tasks/${t.id}`}>{t.description}</Link> (Marks: {t.marks})
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <h3>Cloud Allocations</h3>
            <button onClick={() => setShowAllocForm(true)}>Allocate Cloud Account</button>
            <ul className="cloud-allocation-list">
              {allocations.length === 0 && <li>No cloud accounts allocated to this assessment.</li>}
              {allocations.map(a => {
                const acc = cloudAccounts.find((c: any) => c.id === a.cloudaccountid);
                return (
                  <li key={a.id}>
                    {acc
                      ? <>
                          <b>{acc.name}</b> ({acc.provider})
                          <span
                            className="cloud-allocation-link"
                            onClick={() => {
                              // Optionally, open edit modal or navigate to cloud account page
                              // setEditAccount(acc); setShowForm(true);
                            }}
                          >[Edit]</span>
                        </>
                      : <>Cloud Account ID: {a.cloudaccountid}</>
                    }
                    (Batch: {a.batchid || 'N/A'})
                  </li>
                );
              })}
            </ul>
            {showAllocForm && (
              <CloudAllocationForm onClose={() => { setShowAllocForm(false); /* refresh allocations */ }} />
            )}
            <button onClick={() => setShowAllocForm(true)}>Allocate Assessment</button>
            {showAllocForm && (
              <AssessmentAllocationForm assessmentId={id!} onClose={() => setShowAllocForm(false)} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AssessmentDetailPage;
