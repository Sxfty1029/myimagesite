from flask import Flask, request, jsonify
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import io
import base64
import logging
from flask_cors import CORS

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

file_handler = logging.FileHandler('app.log')
file_handler.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def generate_plot_image(function_type, parameters):
    try:
        namespace = {
            'np': np,
            'plt': plt
        }
        exec(function_type, namespace)
        buf = io.BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight')
        buf.seek(0)
        image_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        buf.close()
        plt.close('all')
        return image_base64
    except Exception as e:
        logger.error(f"Error generating plot: {str(e)}")
        return None

@app.route('/generate-plot', methods=['POST'])
def generate_plot():
    try:
        data = request.json
        if not data or 'functionType' not in data or 'parameters' not in data:
            logger.error("Invalid request data")
            return jsonify({'error': 'Invalid request data'}), 400

        function_type = data['functionType']
        parameters = data['parameters']
        logger.info(f"Received request for function type: {function_type} with parameters: {parameters}")

        # Generate the plot image
        image_base64 = generate_plot_image(function_type, parameters)
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
    
    print("Starting Flask server...")
    print("Access the server at http://127.0.0.1:5500")
    app.run(debug=True, port=5500)