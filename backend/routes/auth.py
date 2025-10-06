from flask import Blueprint, request, jsonify
import bcrypt
import jwt
from datetime import datetime, timedelta
from models import get_db
from utils.validators import validate_username, validate_password
from config import Config

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        username = data.get('username', '').strip()
        password = data.get('password', '')
        is_admin = data.get('is_admin', False)
        
        # Validate username
        is_valid_username, username_msg = validate_username(username)
        if not is_valid_username:
            return jsonify({'error': username_msg}), 400
        
        # Validate password
        is_valid_password, password_msg = validate_password(password)
        if not is_valid_password:
            return jsonify({'error': password_msg}), 400
        
        db = get_db()
        
        # Check if username already exists
        if db.users.find_one({'username': username}):
            return jsonify({'error': 'Username already exists'}), 400
        
        # Hash password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        # Create user document
        user_doc = {
            'username': username,
            'password': hashed_password.decode('utf-8'),
            'is_admin': bool(is_admin),
            'created_at': datetime.utcnow()
        }
        
        # Insert user
        result = db.users.insert_one(user_doc)
        
        if result.inserted_id:
            return jsonify({
                'message': 'User registered successfully',
                'username': username,
                'is_admin': bool(is_admin)
            }), 201
        else:
            return jsonify({'error': 'Failed to create user'}), 500
            
    except Exception as e:
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user and return JWT token"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        if not username or not password:
            return jsonify({'error': 'Username and password are required'}), 400
        
        db = get_db()
        
        # Find user
        user = db.users.find_one({'username': username})
        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Verify password
        if not bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Generate JWT token
        payload = {
            'username': username,
            'is_admin': user['is_admin'],
            'exp': datetime.utcnow() + timedelta(hours=Config.JWT_EXPIRATION_HOURS)
        }
        
        token = jwt.encode(payload, Config.JWT_SECRET, algorithm='HS256')
        
        return jsonify({
            'token': token,
            'username': username,
            'is_admin': user['is_admin']
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Login failed: {str(e)}'}), 500
