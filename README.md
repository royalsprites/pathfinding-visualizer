# Pathfinding Visualizer

Laboratory Activity 3 - Web-based Interactive Algorithm Visualizer

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [License](#license)

## Overview

This project is a web-based interactive visualizer for pathfinding algorithms, developed as part of a laboratory activity. It allows users to visualize how different pathfinding algorithms work on a grid-based interface.

## Features

- Interactive grid where users can set start and end points, and place obstacles.
- Visualization of various pathfinding algorithms.
- Real-time updates to demonstrate the algorithm's progress.

## Tech Stack

- **Frontend:** [Vite](https://vitejs.dev/), [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Backend:** [Node.js](https://nodejs.org/), [Express](https://expressjs.com/)
- **Database:** [Drizzle ORM](https://orm.drizzle.team/)

## Getting Started

### Prerequisites

Ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/royalsprites/pathfinding-visualizer.git
   cd pathfinding-visualizer
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   ```

### Running the Application

1. **Start the development server:**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. **Access the application:**

   Open your browser and navigate to `http://localhost:5173` to view the application.

## Project Structure

```plaintext
pathfinding-visualizer/
├── client/             # Frontend application
├── server/             # Backend server
├── shared/             # Shared utilities and types
├── components.json     # Component configurations
├── drizzle.config.ts   # Drizzle ORM configuration
├── tailwind.config.ts  # Tailwind CSS configuration
├── vite.config.ts      # Vite configuration
├── package.json        # Project metadata and scripts
├── tsconfig.json       # TypeScript configuration
└── README.md           # Project documentation

---

Feel free to contribute to this project by submitting issues or pull requests.
