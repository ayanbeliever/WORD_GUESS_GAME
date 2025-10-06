from flask import Flask, jsonify
from flask_cors import CORS
import logging
import os
from models import init_db, close_db
from routes.auth import auth_bp
from routes.game import game_bp
from routes.admin import admin_bp

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_app():
    """Create and configure Flask application"""
    app = Flask(__name__)
    
    # Enable CORS for frontend
    CORS(app, origins=['http://localhost:3000'])
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(game_bp, url_prefix='/api/game')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Endpoint not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500
    
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({'error': 'Bad request'}), 400
    
    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({'error': 'Unauthorized'}), 401
    
    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({'error': 'Forbidden'}), 403
    
    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({'status': 'healthy', 'message': 'Word Guess Game API is running'}), 200
    
    return app

def main():
    """Main function to run the application"""
    # Initialize database
    if not init_db():
        logger.error("Failed to initialize database. Exiting.")
        return
    
    # Create app
    app = create_app()
    
    try:
        logger.info("Starting Word Guess Game API server...")
        port = int(os.getenv('PORT', 5000))
        app.run(host='0.0.0.0', port=port)
    except KeyboardInterrupt:
        logger.info("Shutting down server...")
    finally:
        close_db()

if __name__ == '__main__':
    main()
