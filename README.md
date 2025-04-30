# Instant Messaging System - Frontend (Software Engineering Course Project)

This repository contains the frontend code for a web-based Instant Messaging (IM) system, developed as a software engineering course assignment. The goal is to create a functional PC Web chat application similar to iMessage, focusing on real-time communication and core messaging features.

## Overview

The frontend provides the user interface for interacting with the IM system. It communicates with a separate backend service via APIs and WebSockets for real-time updates. The UI follows a standard chat application layout with a conversation list on the left and the active chat window on the right.

## Key Features

*   **User Authentication:**
    *   User Registration
    *   User Login / Logout
*   **User Management:**
    *   View and Edit User Profile (Username, Avatar, etc.)
    *   Search for other users
*   **Friend Management:**
    *   View Friend List (with grouping)
    *   Send/Accept Friend Requests
    *   Remove Friends
*   **Chat Interface:**
    *   Display list of active conversations (private and group chats)
    *   Real-time message display in the chat window (differentiating own messages)
    *   Send text messages
    *   Display message timestamps and auxiliary info (e.g., read status - for private chats)
    *   Show unread message counts per conversation
*   **Group Chat:**
    *   Create group chats by selecting friends
    *   View group information (name, members)
    *   Invite members (requires approval)
    *   Leave groups
*   **Message History:**
    *   View conversation history
    *   (Optional based on implementation) Filter/Search chat history
    *   (Optional based on implementation) Delete messages
    *   (Optional based on implementation) Reply to specific messages

## Tech Stack (Example - Adjust as needed)

*   HTML
*   CSS
*   JavaScript
*   Vue3
*   WebSocket API (for real-time communication)
*   Vite

## Getting Started

### Prerequisites

*   Node.js (Version specified by your project, e.g., >= 18.x)
*   npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/resi1ience/IM-Frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

### Running the Development Server

1.  **Configure Backend API:** 
    ```
    # Example .env file
    VITE_API_BASE_URL=http://localhost:8080/api
    VITE_WS_URL=ws://localhost:8080/ws
    ```
2.  Start the development server:
    ```bash
    npm run dev
    # or
    yarn dev
    # or common alternatives like npm start / yarn start
    ```
3.  Open your browser and navigate to `http://localhost:[your-port]` (e.g., `http://localhost:5173` for Vite, `http://localhost:3000` for Create React App).

### Building for Production

```bash
npm run build
# or
yarn build