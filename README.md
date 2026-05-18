# Linear Independence / Linear Dependence (LI-LD) Learning Tool

LI-LD is an interactive educational web application built with Flask and Python. It is designed to help students and learners understand foundational linear algebra concepts such as matrix construction, rank calculation, and determining the linear independence or dependence of vectors.

## Features

- **Interactive Math Problems:** Users can input vectors and work through linear algebra problems step-by-step.
- **Matrix Operations:**
  - Construct matrices from given vectors.
  - Calculate matrix rank using Row Echelon Form (RREF).
  - Determine if a set of vectors is linearly independent or dependent.
  - Solve for linear relations (null space vectors) if vectors are dependent.
- **Step-by-Step Explanations:** The app provides detailed feedback, hints, and step-by-step explanations of matrix transformations (like RREF reduction, identifying pivots, and free variables).
- **User Authentication & Profiles:** Secure login, registration, and user profiles with custom profile picture uploads.
- **Progress Tracking:** Tracks user performance, including solved problems, unsolved problems, score tracking, and specific steps where mistakes were made (backed by MongoDB).

## Tech Stack

- **Backend:** Python, Flask
- **Math Engine:** NumPy (for SVD, rank calculation, matrix operations)
- **Database:** MongoDB (via PyMongo)
- **Frontend:** HTML, CSS, JavaScript (Jinja2 Templates)

## Setup & Installation

### Prerequisites
- Python 3.8+
- MongoDB running locally or a MongoDB URI connection string

### Installation Steps
1. **Clone the repository:**
   ```bash
   git clone https://github.com/adwaitumredkar25-alt/LI-LD.git
   cd LI-LD
   ```

2. **Create a virtual environment (optional but recommended):**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows use: .venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Variables:**
   Create a `.env` file in the root directory and add your configurations:
   ```env
   SECRET_KEY=your_secret_key
   MONGO_URI=mongodb://localhost:27017/matlab_db
   ```

5. **Run the application:**
   ```bash
   python app.py
   ```
   The application will start on `http://127.0.0.1:5000/`. A default `admin`/`admin` account is automatically generated if the database is empty.

## Project Structure
- `app.py`: Main Flask application, routes, and linear algebra logic.
- `templates/`: HTML templates (Jinja2) for the UI.
- `static/`: Static assets including CSS, JS, and user-uploaded profile pictures.
