from pymongo import MongoClient
from config import Config
import logging

# Database connection
client = None
db = None

def init_db():
    """Initialize database connection and create collections with indexes"""
    global client, db
    
    try:
        client = MongoClient(Config.MONGO_URI)
        db = client.word_guess_db
        
        # Create indexes for better performance
        db.users.create_index("username", unique=True)
        db.games.create_index([("username", 1), ("started_at", 1)])
        db.words.create_index("word", unique=True)
        
        # Initialize words collection if empty
        if db.words.count_documents({}) == 0:
            words_data = [{"word": word} for word in Config.INITIAL_WORDS]
            db.words.insert_many(words_data)
            logging.info(f"Initialized words collection with {len(Config.INITIAL_WORDS)} words")
        
        logging.info("Database initialized successfully")
        return True
        
    except Exception as e:
        logging.error(f"Database initialization failed: {str(e)}")
        return False

def get_db():
    """Get database instance"""
    return db

def close_db():
    """Close database connection"""
    global client
    if client:
        client.close()
