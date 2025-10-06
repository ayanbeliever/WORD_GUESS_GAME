import re
from datetime import datetime, date

def validate_username(username):
    """
    Validate username:
    - Must be at least 5 characters long
    - Must contain both uppercase AND lowercase letters
    """
    if not username or len(username) < 5:
        return False, "Username must be at least 5 characters long"
    
    if not re.search(r'[A-Z]', username):
        return False, "Username must contain at least one uppercase letter"
    
    if not re.search(r'[a-z]', username):
        return False, "Username must contain at least one lowercase letter"
    
    return True, "Valid username"

def validate_password(password):
    """
    Validate password:
    - Must be at least 5 characters long
    - Must contain alphabetic characters
    - Must contain numeric characters
    - Must contain at least ONE special character from: $, %, *, @
    """
    if not password or len(password) < 5:
        return False, "Password must be at least 5 characters long"
    
    if not re.search(r'[a-zA-Z]', password):
        return False, "Password must contain alphabetic characters"
    
    if not re.search(r'[0-9]', password):
        return False, "Password must contain numeric characters"
    
    if not re.search(r'[$%*@]', password):
        return False, "Password must contain at least one special character ($, %, *, @)"
    
    return True, "Valid password"

def validate_word(word):
    """
    Validate word for game:
    - Must be exactly 5 characters
    - Must be uppercase letters only
    """
    if not word or len(word) != 5:
        return False, "Word must be exactly 5 characters long"
    
    if not re.match(r'^[A-Z]{5}$', word):
        return False, "Word must contain only uppercase letters"
    
    return True, "Valid word"

def validate_date_string(date_str):
    """
    Validate date string format YYYY-MM-DD
    """
    try:
        datetime.strptime(date_str, '%Y-%m-%d')
        return True, "Valid date"
    except ValueError:
        return False, "Date must be in YYYY-MM-DD format"

def get_today_date():
    """Get today's date as string in YYYY-MM-DD format"""
    return date.today().strftime('%Y-%m-%d')

def is_same_day(date1_str, date2_str):
    """Check if two date strings represent the same day"""
    try:
        date1 = datetime.strptime(date1_str, '%Y-%m-%d').date()
        date2 = datetime.strptime(date2_str, '%Y-%m-%d').date()
        return date1 == date2
    except ValueError:
        return False
