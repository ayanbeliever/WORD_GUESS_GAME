import React, { useState } from 'react';
import { adminAPI } from '../../services/api.jsx';

const UserReport = () => {
  const [username, setUsername] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedDays, setExpandedDays] = useState(new Set());

  const loadUserReport = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await adminAPI.getUserReport(username.trim());
      setReport(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load user report');
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    loadUserReport();
  };

  const toggleDayExpansion = (date) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDays(newExpanded);
  };

  return (
    <div className="user-report">
      <div className="report-header">
        <h2>User Report</h2>
        <form onSubmit={handleSubmit} className="user-search-form">
          <div className="form-group">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'Get Report'}
            </button>
          </div>
        </form>
      </div>

      {error && <div className="error-message">{error}</div>}

      {report && (
        <div className="report-content">
          <div className="user-summary">
            <h3>User: {report.username}</h3>
            <div className="summary-stats">
              <div className="summary-stat">
                <span className="stat-value">{report.total_games}</span>
                <span className="stat-label">Total Games</span>
              </div>
              <div className="summary-stat">
                <span className="stat-value">{report.total_wins}</span>
                <span className="stat-label">Total Wins</span>
              </div>
              <div className="summary-stat">
                <span className="stat-value">{report.win_rate}%</span>
                <span className="stat-label">Win Rate</span>
              </div>
            </div>
          </div>

          <div className="daily-breakdown">
            <h3>Daily Breakdown</h3>
            {report.daily_reports.length === 0 ? (
              <p>No games played yet.</p>
            ) : (
              <div className="daily-reports">
                {report.daily_reports.map((dayReport) => (
                  <div key={dayReport.date} className="day-report">
                    <div 
                      className="day-header"
                      onClick={() => toggleDayExpansion(dayReport.date)}
                    >
                      <div className="day-info">
                        <span className="day-date">{dayReport.date}</span>
                        <span className="day-stats">
                          {dayReport.games_played} games, {dayReport.games_won} wins
                        </span>
                      </div>
                      <span className="expand-icon">
                        {expandedDays.has(dayReport.date) ? '▼' : '▶'}
                      </span>
                    </div>

                    {expandedDays.has(dayReport.date) && (
                      <div className="day-details">
                        {dayReport.games.map((game, index) => (
                          <div key={index} className="game-detail">
                            <div className="game-info">
                              <span className="game-word">{game.target_word}</span>
                              <span className={`game-result ${game.won ? 'won' : 'lost'}`}>
                                {game.won ? 'Won' : 'Lost'}
                              </span>
                              <span className="game-guesses">
                                {game.guesses_count} guesses
                              </span>
                            </div>
                            <div className="game-time">
                              Started: {new Date(game.started_at).toLocaleTimeString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserReport;
