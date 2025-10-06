import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api.jsx';

const WordManagement = () => {
  const [newWord, setNewWord] = useState('');
  const [words, setWords] = useState([]);
  const [showWords, setShowWords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadWords = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await adminAPI.getWords();
      setWords(response.data.words);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load words');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWord = async (e) => {
    e.preventDefault();
    
    if (!newWord.trim()) {
      setError('Please enter a word');
      return;
    }

    const word = newWord.trim().toUpperCase();
    
    if (word.length !== 5) {
      setError('Word must be exactly 5 letters');
      return;
    }

    if (!/^[A-Z]{5}$/.test(word)) {
      setError('Word must contain only uppercase letters');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await adminAPI.addWord(word);
      setSuccess(`Word "${word}" added successfully`);
      setNewWord('');
      // Reload words if they're currently shown
      if (showWords) {
        await loadWords();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add word');
    } finally {
      setLoading(false);
    }
  };

  const toggleShowWords = async () => {
    if (!showWords) {
      await loadWords();
    }
    setShowWords(!showWords);
  };

  return (
    <div className="word-management">
      <div className="management-header">
        <h2>Word Management</h2>
      </div>

      <div className="add-word-section">
        <h3>Add New Word</h3>
        <form onSubmit={handleAddWord} className="add-word-form">
          <div className="form-group">
            <input
              type="text"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value.toUpperCase())}
              placeholder="Enter 5-letter word"
              maxLength={5}
              disabled={loading}
            />
            <button type="submit" disabled={loading || newWord.length !== 5}>
              {loading ? 'Adding...' : 'Add Word'}
            </button>
          </div>
          <small className="form-hint">
            Word must be exactly 5 uppercase letters
          </small>
        </form>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
      </div>

      <div className="view-words-section">
        <h3>View All Words</h3>
        <button 
          onClick={toggleShowWords} 
          className="btn btn-secondary"
          disabled={loading}
        >
          {showWords ? 'Hide Words' : 'Show Words'}
        </button>

        {showWords && (
          <div className="words-display">
            <div className="words-count">
              Total words: {words.length}
            </div>
            <div className="words-grid">
              {words.map((word, index) => (
                <div key={index} className="word-item">
                  {word}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WordManagement;
