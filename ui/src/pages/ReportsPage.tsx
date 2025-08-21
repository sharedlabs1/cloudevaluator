// ui/src/pages/ReportsPage.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ReportsPage: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  useEffect(() => {
    axios.get('/api/reports/cloud-summary').then(res => setReport(res.data.data));
  }, []);
  return (
    <div>
      <h2>Cloud Evaluation Report</h2>
      {report && (
        <table>
          <thead>
            <tr>
              <th>Cloud</th>
              <th>Pass Rate</th>
              <th>Avg Score</th>
              <th>Attempts</th>
            </tr>
          </thead>
          <tbody>
            {report.map((row: any) => (
              <tr key={row.provider}>
                <td>{row.provider}</td>
                <td>{row.passRate}%</td>
                <td>{row.avgScore}</td>
                <td>{row.attempts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
export default ReportsPage;