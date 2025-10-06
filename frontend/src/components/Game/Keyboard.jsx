import React from 'react';

const Keyboard = ({ onKeyPress, usedLetters, disabled }) => {
  const keyboardLayout = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
  ];

  const getKeyClass = (key) => {
    if (key === 'ENTER' || key === 'BACKSPACE') {
      return 'keyboard-key special-key';
    }
    
    if (usedLetters[key]) {
      return `keyboard-key ${usedLetters[key]}`;
    }
    
    return 'keyboard-key';
  };

  const handleKeyClick = (key) => {
    if (disabled) return;
    onKeyPress(key);
  };

  return (
    <div className="keyboard">
      {keyboardLayout.map((row, rowIndex) => (
        <div key={rowIndex} className="keyboard-row">
          {row.map((key) => (
            <button
              key={key}
              className={getKeyClass(key)}
              onClick={() => handleKeyClick(key)}
              disabled={disabled}
            >
              {key === 'BACKSPACE' ? '⌫' : key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;
