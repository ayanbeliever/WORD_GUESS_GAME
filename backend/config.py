import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
    JWT_SECRET = os.getenv('JWT_SECRET', 'dev-jwt-secret')
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/word_guess_db')
    JWT_EXPIRATION_HOURS = 24
    
    # Game settings
    MAX_GAMES_PER_DAY = 3
    MAX_GUESSES_PER_GAME = 5
    WORD_LENGTH = 5
    
    # Initial words for the database
    INITIAL_WORDS = [
        'APPLE', 'BREAD', 'CHAIR', 'DANCE', 'EAGLE', 
        'FLAME', 'GRAPE', 'HOUSE', 'IMAGE', 'JOKER',
        'KNIFE', 'LEMON', 'MOUSE', 'NIGHT', 'OCEAN',
        'PIANO', 'QUEEN', 'RIVER', 'STORM', 'TIGER'
    ]
