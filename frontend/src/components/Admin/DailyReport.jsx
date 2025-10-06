import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api.jsx';

const DailyReport = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadReport = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await adminAPI.getDailyReport(date);
      setReport(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load daily report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [date]);

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  return (
    <div className="daily-report">
      <div className="report-header">
        <h2>Daily Report</h2>
        <div className="date-picker">
          <label htmlFor="report-date">Select Date:</label>
          <input
            type="date"
            id="report-date"
            value={date}
            onChange={handleDateChange}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading report...</div>
      ) : report ? (
        <div className="report-content">
          <div className="report-date">
            <h3>Report for {report.date}</h3>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{report.total_users}</div>
              <div className="stat-label">Unique Users</div>
            </div>

            <div className="stat-card">
              <div className="stat-value">{report.total_games}</div>
              <div className="stat-label">Total Games</div>
            </div>

            <div className="stat-card">
              <div className="stat-value">{report.correct_guesses}</div>
              <div className="stat-label">Correct Guesses</div>
            </div>

            <div className="stat-card">
              <div className="stat-value">{report.success_rate}%</div>
              <div className="stat-label">Success Rate</div>
            </div>
          </div>

          {report.total_games === 0 && (
            <div className="no-data-message">
              <p>No games were played on this date.</p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default DailyReport;
