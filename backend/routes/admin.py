from flask import Blueprint, request, jsonify
import jwt
from datetime import datetime, date
from models import get_db
from utils.validators import validate_word, validate_date_string, get_today_date
from config import Config

admin_bp = Blueprint('admin', __name__)

def verify_admin_token():
    """Verify JWT token and check if user is admin"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None, jsonify({'error': 'No token provided'}), 401
    
    try:
        token = auth_header.split(' ')[1]
        payload = jwt.decode(token, Config.JWT_SECRET, algorithms=['HS256'])
        
        if not payload.get('is_admin', False):
            return None, jsonify({'error': 'Admin access required'}), 403
        
        return payload, None, None
    except jwt.ExpiredSignatureError:
        return None, jsonify({'error': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        return None, jsonify({'error': 'Invalid token'}), 401

@admin_bp.route('/daily-report', methods=['GET'])
def get_daily_report():
    """Get daily report for a specific date"""
    try:
        payload, error_response, status_code = verify_admin_token()
        if error_response:
            return error_response, status_code
        
        date_str = request.args.get('date', get_today_date())
        
        # Validate date format
        is_valid_date, date_msg = validate_date_string(date_str)
        if not is_valid_date:
            return jsonify({'error': date_msg}), 400
        
        db = get_db()
        
        # Parse date for MongoDB query
        start_date = datetime.strptime(date_str, '%Y-%m-%d')
        end_date = datetime.combine(start_date.date(), datetime.max.time())
        
        # Get games for the date
        games = list(db.games.find({
            'started_at': {'$gte': start_date, '$lt': end_date}
        }))
        
        # Calculate statistics
        total_games = len(games)
        unique_users = len(set(game['username'] for game in games))
        correct_guesses = sum(1 for game in games if game['won'])
        success_rate = (correct_guesses / total_games * 100) if total_games > 0 else 0
        
        return jsonify({
            'date': date_str,
            'total_users': unique_users,
            'total_games': total_games,
            'correct_guesses': correct_guesses,
            'success_rate': round(success_rate, 2)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get daily report: {str(e)}'}), 500

@admin_bp.route('/user-report', methods=['GET'])
def get_user_report():
    """Get detailed report for a specific user"""
    try:
        payload, error_response, status_code = verify_admin_token()
        if error_response:
            return error_response, status_code
        
        username = request.args.get('username')
        if not username:
            return jsonify({'error': 'Username parameter is required'}), 400
        
        db = get_db()
        
        # Check if user exists
        user = db.users.find_one({'username': username})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get all games for the user
        games = list(db.games.find({'username': username}).sort('started_at', 1))
        
        # Calculate overall statistics
        total_games = len(games)
        total_wins = sum(1 for game in games if game['won'])
        win_rate = (total_wins / total_games * 100) if total_games > 0 else 0
        
        # Group games by date
        daily_reports = {}
        for game in games:
            game_date = game['started_at'].strftime('%Y-%m-%d')
            if game_date not in daily_reports:
                daily_reports[game_date] = {
                    'date': game_date,
                    'games_played': 0,
                    'games_won': 0,
                    'games': []
                }
            
            daily_reports[game_date]['games_played'] += 1
            if game['won']:
                daily_reports[game_date]['games_won'] += 1
            
            # Add game details
            game_details = {
                'target_word': game['target_word'],
                'won': game['won'],
                'guesses_count': len(game['guesses']),
                'started_at': game['started_at'].isoformat(),
                'completed_at': game['completed_at'].isoformat() if game['completed_at'] else None
            }
            daily_reports[game_date]['games'].append(game_details)
        
        # Convert to list and sort by date
        daily_reports_list = list(daily_reports.values())
        daily_reports_list.sort(key=lambda x: x['date'])
        
        return jsonify({
            'username': username,
            'total_games': total_games,
            'total_wins': total_wins,
            'win_rate': round(win_rate, 2),
            'daily_reports': daily_reports_list
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get user report: {str(e)}'}), 500

@admin_bp.route('/add-word', methods=['POST'])
def add_word():
    """Add a new word to the database"""
    try:
        payload, error_response, status_code = verify_admin_token()
        if error_response:
            return error_response, status_code
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        word = data.get('word', '').strip().upper()
        if not word:
            return jsonify({'error': 'Word is required'}), 400
        
        # Validate word format
        is_valid, msg = validate_word(word)
        if not is_valid:
            return jsonify({'error': msg}), 400
        
        db = get_db()
        
        # Check if word already exists
        if db.words.find_one({'word': word}):
            return jsonify({'error': 'Word already exists in database'}), 400
        
        # Add word
        result = db.words.insert_one({'word': word})
        
        if result.inserted_id:
            return jsonify({'message': f'Word "{word}" added successfully'}), 201
        else:
            return jsonify({'error': 'Failed to add word'}), 500
            
    except Exception as e:
        return jsonify({'error': f'Failed to add word: {str(e)}'}), 500

@admin_bp.route('/words', methods=['GET'])
def get_words():
    """Get all words in the database"""
    try:
        payload, error_response, status_code = verify_admin_token()
        if error_response:
            return error_response, status_code
        
        db = get_db()
        
        # Get all words
        words_cursor = db.words.find({}, {'word': 1, '_id': 0})
        words = [doc['word'] for doc in words_cursor]
        
        return jsonify({
            'words': words,
            'count': len(words)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get words: {str(e)}'}), 500
