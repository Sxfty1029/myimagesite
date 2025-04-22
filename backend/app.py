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

def generate_plot_image(code):
    try:
        # Create a namespace for numpy and matplotlib
        namespace = {
            'np': np,
            'plt': plt
        }

        # Execute the plot code
        exec(code, namespace)

        # Save the plot to a buffer
        buf = io.BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight')
        buf.seek(0)

        # Convert the plot image to base64
        image_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        buf.close()

        # Clean up the plot
        plt.close('all')

        return image_base64

    except Exception as e:
        logger.error(f"Error generating plot: {str(e)}")
        return None

@app.route('/generate-plot', methods=['POST'])
def generate_plot():
    try:
        data = request.json
        if not data or 'code' not in data:
            logger.error("No code provided in request data")
            return jsonify({'error': 'No code provided'}), 400

        code = data['code']
        logger.info("Received plot code")

        # Generate the plot image and handle errors
        image_base64 = generate_plot_image(code)
        if image_base64 is None:
            return jsonify({'error': 'Plot generation failed'}), 400

        return jsonify({
            'image_url': f'data:image/png;base64,{image_base64}'
        })

    except Exception as e:
        logger.error(f"Server error: {str(e)}")
        return jsonify({'error': f'Server error: {str(e)}'}), 500

if __name__ == '__main__':
    plt.clf()
    plt.close('all')

    port = int(os.environ.get("PORT", 5000))  # 👈 Получаем порт от Render


    app.run(host='0.0.0.0', port=port, debug=True)
