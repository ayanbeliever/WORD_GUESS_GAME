import React, { useState, useEffect, useCallback } from 'react';
import { gameAPI } from '../../services/api.jsx';
import GuessRow from './GuessRow.jsx';
import Keyboard from './Keyboard.jsx';

const GameBoard = () => {
  const [gameId, setGameId] = useState(null);
  const [currentGuess, setCurrentGuess] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [gameStatus, setGameStatus] = useState({
    games_played_today: 0,
    remaining_games: 3
  });
  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [targetWord, setTargetWord] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usedLetters, setUsedLetters] = useState({});

  // Load game status on component mount
  useEffect(() => {
    loadGameStatus();
  }, []);

  const loadGameStatus = async () => {
    try {
      const response = await gameAPI.getGameStatus();
      setGameStatus(response.data);
    } catch (err) {
      console.error('Failed to load game status:', err);
    }
  };

  const startNewGame = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await gameAPI.startGame();
      const { game_id } = response.data;
      
      setGameId(game_id);
      setCurrentGuess('');
      setGuesses([]);
      setGameCompleted(false);
      setGameWon(false);
      setTargetWord('');
      setUsedLetters({});
      
      // Reload game status
      await loadGameStatus();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start game');
    } finally {
      setLoading(false);
    }
  };

  const submitGuess = async () => {
    if (currentGuess.length !== 5) {
      setError('Word must be exactly 5 letters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await gameAPI.submitGuess(gameId, currentGuess);
      const { guess, feedback, won, completed, guesses_remaining, target_word } = response.data;

      // Add guess to history
      const newGuess = { word: guess, feedback };
      setGuesses(prev => [...prev, newGuess]);

      // Update used letters
      const newUsedLetters = { ...usedLetters };
      guess.split('').forEach((letter, index) => {
        if (!newUsedLetters[letter] || feedback[index] === 'correct') {
          newUsedLetters[letter] = feedback[index];
        }
      });
      setUsedLetters(newUsedLetters);

      // Check game completion
      if (completed) {
        setGameCompleted(true);
        setGameWon(won);
        if (!won) {
          setTargetWord(target_word);
        }
        // Reload game status
        await loadGameStatus();
      }

      setCurrentGuess('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit guess');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = useCallback((key) => {
    if (gameCompleted || loading) return;

    if (key === 'ENTER') {
      if (currentGuess.length === 5) {
        submitGuess();
      }
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (key.length === 1 && currentGuess.length < 5) {
      setCurrentGuess(prev => prev + key.toUpperCase());
    }
  }, [currentGuess, gameCompleted, loading, submitGuess]);

  // Handle physical keyboard input
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (gameCompleted || loading) return;

      const key = event.key.toUpperCase();
      
      if (key === 'ENTER') {
        event.preventDefault();
        if (currentGuess.length === 5) {
          submitGuess();
        }
      } else if (key === 'BACKSPACE') {
        event.preventDefault();
        setCurrentGuess(prev => prev.slice(0, -1));
      } else if (key.match(/[A-Z]/) && currentGuess.length < 5) {
        event.preventDefault();
        setCurrentGuess(prev => prev + key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentGuess, gameCompleted, loading, submitGuess]);

  const renderGameResult = () => {
    if (!gameCompleted) return null;

    return (
      <div className="game-result-modal">
        <div className="game-result-content">
          {gameWon ? (
            <div className="success-message">
              <h2>🎉 Congratulations!</h2>
              <p>You guessed the word correctly!</p>
            </div>
          ) : (
            <div className="failure-message">
              <h2>Better luck next time!</h2>
              <p>The word was: <strong>{targetWord}</strong></p>
            </div>
          )}
          
          {gameStatus.remaining_games > 0 && (
            <button 
              onClick={startNewGame} 
              className="btn btn-primary"
              disabled={loading}
            >
              Play Again
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="game-board">
      <div className="game-header">
        <h1>Word Guess Game</h1>
        <div className="game-stats">
          <span>Games today: {gameStatus.games_played_today}/3</span>
          <span>Remaining: {gameStatus.remaining_games}</span>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {!gameId && gameStatus.remaining_games > 0 && (
        <div className="start-game-section">
          <button 
            onClick={startNewGame} 
            className="btn btn-primary btn-large"
            disabled={loading}
          >
            {loading ? 'Starting...' : 'Start New Game'}
          </button>
        </div>
      )}

      {gameId && (
        <div className="game-content">
          <div className="guess-board">
            {guesses.map((guess, index) => (
              <GuessRow
                key={index}
                word={guess.word}
                feedback={guess.feedback}
                isActive={false}
              />
            ))}
            {!gameCompleted && (
              <GuessRow
                word={currentGuess}
                feedback={null}
                isActive={true}
              />
            )}
            {/* Fill remaining rows */}
            {Array.from({ length: 5 - guesses.length - (gameCompleted ? 0 : 1) }).map((_, index) => (
              <GuessRow
                key={guesses.length + index + 1}
                word=""
                feedback={null}
                isActive={false}
              />
            ))}
          </div>

          <Keyboard
            onKeyPress={handleKeyPress}
            usedLetters={usedLetters}
            disabled={gameCompleted || loading}
          />
        </div>
      )}

      {gameStatus.remaining_games === 0 && !gameId && (
        <div className="no-games-message">
          <h2>Daily limit reached</h2>
          <p>You've played all 3 games for today. Come back tomorrow!</p>
        </div>
      )}

      {renderGameResult()}
    </div>
  );
};

export default GameBoard;
