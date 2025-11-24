# Billiards Score Counter

A real-time billiards scoring application built with Vue.js and Node.js. This application allows users to create rooms, invite friends, and keep track of scores during a game.

## Features

*   **User Authentication:** Secure user registration and login.
*   **Room Management:** Create, join, and view game rooms.
*   **Real-time Scoring:** Live score updates for all players in a room using WebSockets.
*   **Game Logging:** Keeps a history of scores and games.

## Technology Stack

### Frontend

*   **Framework:** [Vue.js](https://vuejs.org/) 3
*   **Routing:** [Vue Router](https://router.vuejs.org/)
*   **State Management:** [Pinia](https://pinia.vuejs.org/)
*   **UI Library:** [Vant](https://vant-ui.github.io/vant/)
*   **HTTP Client:** [Axios](https://axios-http.com/)
*   **WebSocket Client:** [Socket.IO Client](https://socket.io/docs/v4/client-api/)
*   **Build Tool:** [Vite](https://vitejs.dev/)

### Backend

*   **Runtime:** [Node.js](https://nodejs.org/)
*   **Framework:** [Koa.js](https://koajs.com/)
*   **ORM:** [Sequelize](https://sequelize.org/) with [MySQL2](https://github.com/sidorares/node-mysql2)
*   **Real-time Communication:** [Socket.IO](https://socket.io/)
*   **Authentication:** [JSON Web Tokens (JWT)](https://jwt.io/)
*   **Database:** MySQL

## Project Structure

The project is a monorepo with two main parts:

```
/
├── client/         # Vue.js frontend application
└── server/         # Node.js (Koa) backend server
```

## Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/en/download/) (v18.x or higher recommended)
*   [MySQL](https://www.mysql.com/downloads/)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd Scorer
    ```

2.  **Setup the Backend:**
    - Navigate to the server directory: `cd server`
    - Install dependencies: `npm install`
    - Create a `.env` file in the `server` directory to store your database credentials and JWT secret.
        ```
        DB_HOST=localhost
        DB_USER=your_db_user
        DB_PASS=your_db_password
        DB_NAME=scorer
        JWT_SECRET=your_jwt_secret
        ```
    - Ensure you have a MySQL database created that matches `DB_NAME`.
    - Start the server: `npm run dev`
    - The server will be running on `http://localhost:3000` (by default).

3.  **Setup the Frontend:**
    - In a new terminal, navigate to the client directory: `cd client`
    - Install dependencies: `npm install`
    - Start the development server: `npm run dev`
    - The client will be running on `http://localhost:5173` (by default).

4.  **Open the application:**
    Open your browser and go to the client's address (`http://localhost:5173`).