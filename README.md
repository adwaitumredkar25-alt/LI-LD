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
- **Interactive Visualizations:** Dynamically visualizes 2D and 3D vectors using Plotly.js so users can intuitively see how vectors span space and whether they are linearly dependent or independent.
- **User Authentication & Profiles:** Secure login, registration, and user profiles with custom profile picture uploads.
- **Progress Tracking:** Tracks user performance, including solved problems, unsolved problems, score tracking, and specific steps where mistakes were made (backed by MongoDB).

## Tech Stack

- **Backend:** Python, Flask
- **Math Engine:** NumPy (for SVD, rank calculation, matrix operations)
- **Database:** MongoDB (via PyMongo)
- **Frontend:** HTML, CSS, JavaScript (Jinja2 Templates)
- **Graphing & Visualization:** Plotly.js (v2.26.0) for dynamic 2D and 3D vector plotting


## Project Structure
- `app.py`: Main Flask application, routes, and linear algebra logic.
- `templates/`: HTML templates (Jinja2) for the UI.
- `static/`: Static assets including CSS, JS, and user-uploaded profile pictures.
