from flask import Blueprint, request, jsonify
import jwt
import random
from datetime import datetime, date
from models import get_db
from utils.validators import validate_word, get_today_date, is_same_day
from config import Config

game_bp = Blueprint('game', __name__)

def verify_token():
    """Verify JWT token from Authorization header"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None, jsonify({'error': 'No token provided'}), 401
    
    try:
        token = auth_header.split(' ')[1]
        payload = jwt.decode(token, Config.JWT_SECRET, algorithms=['HS256'])
        return payload, None, None
    except jwt.ExpiredSignatureError:
        return None, jsonify({'error': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        return None, jsonify({'error': 'Invalid token'}), 401

def get_random_word():
    """Get a random word from the database"""
    db = get_db()
    words = list(db.words.find({}, {'word': 1}))
    if not words:
        return None
    return random.choice(words)['word']

def calculate_feedback(guess, target_word):
    """
    Calculate feedback for a guess against target word.
    Returns array of feedback: 'correct', 'wrong_position', 'not_in_word'
    """
    feedback = ['not_in_word'] * 5
    target_letters = list(target_word)
    guess_letters = list(guess)
    
    # First pass: mark exact matches (green)
    for i in range(5):
        if guess_letters[i] == target_letters[i]:
            feedback[i] = 'correct'
            target_letters[i] = None  # Mark as used
            guess_letters[i] = None   # Mark as used
    
    # Second pass: mark wrong positions (orange)
    for i in range(5):
        if guess_letters[i] is not None:  # Not already marked as correct
            if guess_letters[i] in target_letters:
                feedback[i] = 'wrong_position'
                # Remove the first occurrence from target
                target_letters[target_letters.index(guess_letters[i])] = None
    
    return feedback

@game_bp.route('/start', methods=['POST'])
def start_game():
    """Start a new game"""
    try:
        payload, error_response, status_code = verify_token()
        if error_response:
            return error_response, status_code
        
        username = payload['username']
        db = get_db()
        today = get_today_date()
        
        # Check daily game limit
        games_today = db.games.count_documents({
            'username': username,
            'started_at': {'$gte': datetime.strptime(today, '%Y-%m-%d')}
        })
        
        if games_today >= Config.MAX_GAMES_PER_DAY:
            return jsonify({
                'error': f'Daily limit reached. You can play maximum {Config.MAX_GAMES_PER_DAY} games per day.'
            }), 400
        
        # Get random word
        target_word = get_random_word()
        if not target_word:
            return jsonify({'error': 'No words available'}), 500
        
        # Create game document
        game_doc = {
            'username': username,
            'target_word': target_word,
            'guesses': [],
            'won': False,
            'completed': False,
            'started_at': datetime.utcnow(),
            'completed_at': None
        }
        
        result = db.games.insert_one(game_doc)
        
        if result.inserted_id:
            return jsonify({
                'game_id': str(result.inserted_id),
                'message': 'Game started successfully',
                'guesses_remaining': Config.MAX_GUESSES_PER_GAME
            }), 201
        else:
            return jsonify({'error': 'Failed to start game'}), 500
            
    except Exception as e:
        return jsonify({'error': f'Failed to start game: {str(e)}'}), 500

@game_bp.route('/guess', methods=['POST'])
def submit_guess():
    """Submit a guess for the current game"""
    try:
        payload, error_response, status_code = verify_token()
        if error_response:
            return error_response, status_code
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        game_id = data.get('game_id')
        word = data.get('word', '').strip().upper()
        
        if not game_id or not word:
            return jsonify({'error': 'Game ID and word are required'}), 400
        
        # Validate word format
        is_valid, msg = validate_word(word)
        if not is_valid:
            return jsonify({'error': msg}), 400
        
        db = get_db()
        
        # Find game
        from bson import ObjectId
        try:
            game = db.games.find_one({'_id': ObjectId(game_id)})
        except:
            return jsonify({'error': 'Invalid game ID'}), 400
        
        if not game:
            return jsonify({'error': 'Game not found'}), 404
        
        if game['username'] != payload['username']:
            return jsonify({'error': 'Unauthorized'}), 403
        
        if game['completed']:
            return jsonify({'error': 'Game already completed'}), 400
        
        if len(game['guesses']) >= Config.MAX_GUESSES_PER_GAME:
            return jsonify({'error': 'Maximum guesses reached'}), 400
        
        # Calculate feedback
        feedback = calculate_feedback(word, game['target_word'])
        
        # Add guess to game
        guess_data = {
            'word': word,
            'feedback': feedback,
            'timestamp': datetime.utcnow()
        }
        
        # Check if won
        won = word == game['target_word']
        completed = won or len(game['guesses']) + 1 >= Config.MAX_GUESSES_PER_GAME
        
        # Update game
        update_data = {
            '$push': {'guesses': guess_data},
            '$set': {
                'won': won,
                'completed': completed
            }
        }
        
        if completed:
            update_data['$set']['completed_at'] = datetime.utcnow()
        
        db.games.update_one({'_id': ObjectId(game_id)}, update_data)
        
        response_data = {
            'guess': word,
            'feedback': feedback,
            'won': won,
            'completed': completed,
            'guesses_remaining': Config.MAX_GUESSES_PER_GAME - len(game['guesses']) - 1
        }
        
        if completed and not won:
            response_data['target_word'] = game['target_word']
        
        return jsonify(response_data), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to submit guess: {str(e)}'}), 500

@game_bp.route('/status', methods=['GET'])
def get_game_status():
    """Get daily game status for user"""
    try:
        payload, error_response, status_code = verify_token()
        if error_response:
            return error_response, status_code
        
        username = payload['username']
        db = get_db()
        today = get_today_date()
        
        # Count games played today
        games_played_today = db.games.count_documents({
            'username': username,
            'started_at': {'$gte': datetime.strptime(today, '%Y-%m-%d')}
        })
        
        remaining_games = max(0, Config.MAX_GAMES_PER_DAY - games_played_today)
        
        return jsonify({
            'games_played_today': games_played_today,
            'remaining_games': remaining_games
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get game status: {str(e)}'}), 500
