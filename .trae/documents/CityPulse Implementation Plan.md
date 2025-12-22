# CityPulse Project Implementation Plan

This plan outlines the steps to build the **CityPulse** Urban Renewal Simulator, a web-based AIED project using React, TypeScript, and AI Agents.

## 1. Project Initialization & Setup

* **Objective**: Create a modern, type-safe web application foundation.

* **Tech Stack**:

  * Frontend: React + Vite + TypeScript

  * Styling: Tailwind CSS

  * State Management: Zustand (for handling game state, metrics, and turns)

  * Visualization: Recharts (Radar charts), Lucide-React (Icons)

* **Actions**:

  * Initialize project with Vite.

  * Install dependencies (`tailwindcss`, `zustand`, `recharts`, `lucide-react`, `clsx`, `tailwind-merge`).

  * Setup project folder structure (`components`, `store`, `types`, `utils`, `data`).

## 2. Core Data Models & State Management

* **Objective**: Define the data structures for the simulation.

* **Data Models**:

  * `GameState`: Metrics (Satisfaction, Economy, Environment), Budget, Turn, Phase (Investigation, Proposal, Simulation).

  * `GridSystem`: 5x5 or similar grid representing the "Old Banyan Tree District". Each cell has a type (Residential, Factory, Park, Commercial, Empty).

  * `AgentSystem`: Definitions for Aunt Zhang, CEO Li, Dr. Chen, and Narrator (including personality prompts).

* **Implementation**:

  * Create `useGameStore` with Zustand to manage the entire application state.

## 3. UI Component Implementation

* **Layout**: Main dashboard layout with Sidebar (Agents), Main Area (Map/Proposal), and Top/Bottom bars (Metrics/News).

* **Components**:

  * **`MetricRadar`**: Radar chart displaying the balance of the three core values.

  * **`CityMap`**: Interactive grid component. Allows clicking cells to change their type (Demolish/Build).

  * **`AgentChat`**: Chat interface for talking to specific NPCs.

  * **`NewsFeed`**: Twitter-like feed for "Market/Public Opinion" updates.

  * **`ControlPanel`**: Buttons for "Next Turn", "Submit Proposal", "Run Simulation".

## 4. Simulation Logic & AI Integration

* **Objective**: Implement the "Plan -> Do -> Check -> Act" loop.

* **Simulation Engine**:

  * **Deterministic Rules**: Base calculations (e.g., Park = +Environment, -Budget).

  * **LLM Layer**:

    * **Role-Playing**: API service to generate responses for Aunt Zhang, CEO Li, etc., based on current game state.

    * **Evaluation**: API service to analyze the user's "Strategy Statement" and grid changes to provide qualitative feedback and dynamic metric adjustments.

* **Note**: We will create a `SimulationService` that can be connected to a real LLM API (OpenAI/Gemini) later, but initially can use mock logic/responses for UI testing if no API key is provided immediately.

## 5. Game Loop Implementation

* **Investigation Phase**: Enable chat with agents, disable map editing.

* **Proposal Phase**: Enable map editing, disable chat, enable "Strategy Statement" input.

* **Feedback Phase**: Trigger simulation, update metrics, show Agent reactions and News feed events.

* **Iteration**: Check win/loss conditions (Budget < 0, Rounds ended, Metrics achieved).

## 6. MVP Execution Steps

1. **Scaffold**: Create project files.
2. **Data Layer**: Implement `useGameStore` and types.
3. **UI Shell**: Build the main layout and metric visualization.
4. **Map Editor**: Build the interactive grid.
5. **Chat & Feed**: Build the text-based interaction components.
6. **Game Logic**: Connect the pieces into a turn-based flow.

