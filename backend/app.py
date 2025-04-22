import os
import matplotlib
matplotlib.use('Agg')  # Use the 'Agg' backend, which is non-interactive and thread-safe

from flask import Flask, request, jsonify, session
from flask_cors import CORS
import matplotlib.pyplot as plt
import numpy as np
import io
import base64
import logging
from functools import wraps

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Добавляем обработчик для записи логов в файл
file_handler = logging.FileHandler('app.log')  # Логи будут записываться в файл app.log
file_handler.setLevel(logging.INFO)

# Формат логов
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
file_handler.setFormatter(formatter)

# Добавляем обработчик к логгеру
logger.addHandler(file_handler)

# Users and roles
USERS = {
    "admin": {"password": "botadmin1", "role": "admin"},
    "user": {"password": "user123", "role": "user"}
}

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

app.secret_key = os.getenv('FLASK_SECRET_KEY', 'fallback-secret')

@app.route('/')
def home():
    return "Server is running"

@app.route('/health')
def health_check():
    return jsonify({'status': 'ok'})

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.json  # Получаем данные из запроса
        username = data.get('username')
        password = data.get('password')

        if username in USERS and USERS[username]['password'] == password:
            session['username'] = username
            session['role'] = USERS[username]['role']
            logger.info(f"User '{username}' logged in as {USERS[username]['role']}")
            return jsonify({'message': f"Welcome, {username}!", 'role': USERS[username]['role']})
        else:
            logger.warning(f"Failed login attempt for username: {username}")
            return jsonify({'error': 'Invalid username or password'}), 401
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({'error': 'Server error'}), 500

def role_required(required_role):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if 'username' not in session or 'role' not in session:
                logger.warning("Unauthorized access attempt")
                return jsonify({'error': 'Unauthorized'}), 403
            if session['role'] != required_role:
                logger.warning(f"Access denied for user '{session['username']}' with role '{session['role']}'")
                return jsonify({'error': 'Access denied'}), 403
            return func(*args, **kwargs)
        return wrapper
    return decorator

@app.route('/admin', methods=['GET'])
@role_required('admin')
def admin_panel():
    logger.info(f"Admin panel accessed by '{session['username']}'")
    return jsonify({'message': 'Welcome to the admin panel!'})

@app.route('/user', methods=['GET'])
@role_required('user')
def user_panel():
    logger.info(f"User panel accessed by '{session['username']}'")
    return jsonify({'message': 'Welcome to the user panel!'})

@app.route('/generate-image', methods=['POST'])
def generate_image():
    try:
        data = request.json
        if not data or 'code' not in data:
            logger.error("No code provided in request data")
            return jsonify({'error': 'No code provided'}), 400

        code = data['code']
        logger.info(f"Received plot code")

        # Clear any existing plots
        plt.clf()
        plt.close('all')

        try:
            # Create namespace with numpy and matplotlib
            namespace = {
                'np': np,
                'plt': plt
            }
            
            # Execute the code
            exec(code, namespace)
            
            # Save plot to buffer
            buf = io.BytesIO()
            plt.savefig(buf, format='png', bbox_inches='tight')
            buf.seek(0)
            
            # Convert to base64
            image_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
            
            # Clean up
            plt.close('all')
            
            return jsonify({
                'imageUrl': f'data:image/png;base64,{image_base64}'
            })

        except Exception as e:
            logger.error(f"Plot generation error: {str(e)}")
            return jsonify({'error': f'Plot generation failed: {str(e)}'}), 400

    except Exception as e:
        logger.error(f"Server error: {str(e)}")
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/generate-image', methods=['POST'])
def generate_plot():
    try:
        # Получаем код Python из запроса
        data = request.get_json()
        code = data.get('code', '')

        # Выполняем код Python
        exec_globals = {}
        exec(code, exec_globals)

        # Сохраняем график в буфер
        buf = io.BytesIO()
        plt.savefig(buf, format='png')
        buf.seek(0)
        encoded_image = base64.b64encode(buf.read()).decode('utf-8')
        buf.close()
        plt.close()

        # Возвращаем изображение в формате base64
        return jsonify({'image_url': f'data:image/png;base64,{encoded_image}'})
    except Exception as e:
        return jsonify({'image_url': 'https://myimagesitebackend.onrender.com/plot.png'})

if __name__ == '__main__':
    # Clear any existing plots
    plt.clf()
    plt.close('all')

    port = int(os.environ.get("PORT", 5000))  # 👈 Получаем порт от Render


    app.run(host='0.0.0.0', port=port, debug=True)
