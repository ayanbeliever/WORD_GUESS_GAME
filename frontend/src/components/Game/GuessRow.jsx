import React from 'react';

const GuessRow = ({ word, feedback, isActive }) => {
  const getLetterClass = (index) => {
    if (!feedback || !feedback[index]) {
      return 'letter-box';
    }
    
    switch (feedback[index]) {
      case 'correct':
        return 'letter-box correct';
      case 'wrong_position':
        return 'letter-box wrong-position';
      case 'not_in_word':
        return 'letter-box not-in-word';
      default:
        return 'letter-box';
    }
  };

  const letters = word ? word.split('') : ['', '', '', '', ''];

  return (
    <div className={`guess-row ${isActive ? 'active' : ''}`}>
      {letters.map((letter, index) => (
        <div key={index} className={getLetterClass(index)}>
          {letter}
        </div>
      ))}
    </div>
  );
};

export default GuessRow;
