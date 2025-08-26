# Smart Support AI – MERN Stack Application
Overview

Smart Support AI is a full-stack web application built using the MERN stack (MongoDB, Express.js, React.js, Node.js). It leverages Google's Gemini API as a Large Language Model (LLM) to provide AI-powered support and intelligent query handling. The application aims to deliver real-time responses and enhance user experience with a clean and responsive UI.

# Features

AI-Powered Support: Integrated Gemini API to generate intelligent, context-aware responses.

Full-Stack Implementation: Built with MongoDB Atlas for backend data storage, Express.js and Node.js for server logic, and React.js for the frontend.

Real-Time Query Handling: Seamless communication between client and server.

Scalable Cloud Backend: MongoDB Atlas ensures secure and scalable data management.

Error Handling and Debugging: Addressed and resolved backend–frontend integration issues for smooth communication.

# Tech Stack

Frontend: React.js, Tailwind CSS (if used)

Backend: Node.js, Express.js

Database: MongoDB Atlas

AI Integration: Gemini API

Deployment: (Mention if deployed on platforms like Vercel, Render, Railway, etc.)

# Challenges Faced

Encountered difficulties while connecting the backend and frontend, particularly in API routing and CORS handling.

Overcame these issues through structured debugging, proper environment configuration, and API endpoint optimization.

# How to Run Locally

Clone the repository

git clone <your-repo-link>
cd smart-support-ai


# Install dependencies

npm install
cd client
npm install
cd ..


# Set up environment variables
Create a .env file in the root directory with:

MONGODB_URI=your_mongodb_atlas_connection_string
GEMINI_API_KEY=your_gemini_api_key
PORT=5000


# Run the backend server

npm run server


# Run the frontend

cd client
npm start


# Open the app
Navigate to http://localhost:3000 in your browser.

# Future Enhancements

Add user authentication and role-based access.

Enhance UI/UX with better chat interfaces.

Support more AI models and APIs.

Enable multi-language query support.

License

This project is licensed under the MIT License.
