# Backend Application

This directory contains the backend application for the web app, built using Python and Flask. The backend is responsible for handling requests from the frontend, generating plots based on user-provided code, and serving the generated images.

## Setup Instructions

1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd my-web-app/backend
   ```

2. **Create a virtual environment** (optional but recommended):
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. **Install dependencies**:
   ```
   pip install -r requirements.txt
   ```

4. **Run the application**:
   ```
   python app.py
   ```

   The application will start on `http://localhost:5000`.

## API Endpoints

### POST /generate-plot

- **Description**: Generates a plot based on the provided code.
- **Request Body**:
  ```json
  {
      "code": "your_plot_code_here"
  }
  ```
- **Response**:
  - On success:
    ```json
    {
        "image_url": "data:image/png;base64,..."
    }
    ```
  - On error:
    ```json
    {
        "error": "Error message"
    }
    ```

## Logging

Logs are written to `app.log` in the backend directory. Check this file for any errors or information regarding the application's operation.

## Docker

To build and run the backend application using Docker, use the following commands:

1. **Build the Docker image**:
   ```
   docker build -t my-web-app-backend .
   ```

2. **Run the Docker container**:
   ```
   docker run -p 5000:5000 my-web-app-backend
   ```

## Additional Information

For more details on the project structure and frontend setup, refer to the respective README files in the `frontend` directory.