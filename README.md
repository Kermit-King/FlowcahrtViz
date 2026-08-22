# FlowchartViz - Degree Path Simulator

**FlowchartViz** is an interactive university curriculum visualizer and degree progression simulator. Upload an official university curriculum PDF (e.g., Computer Science, Engineering), and the app automatically parses course information, prerequisites, credit units, and term structures to generate an interactive Directed Acyclic Graph (DAG) flowchart.

---

## Features

- **PDF Curriculum Parsing**: Powered by Google Gemini AI (`@google/genai` with `gemini-2.5-flash`) and `pdf-parse` to extract structured course data from uploaded PDFs.
- **Interactive Prerequisite Tree**: Built with [React Flow](https://reactflow.dev/) and automatically laid out using [Dagre](https://github.com/dagrejs/dagre) for DAG visualization.
- **GWA / Grade Calculator**: Calculate overall GWA (General Weighted Average) and track degree progression in real time using Zustand state management.
- **Modern Design**: Clean interface styled with Tailwind CSS, Lucide icons, and Shadcn UI components.

---

## Environment Setup & API Key Configuration

The PDF parsing functionality requires a **Google Gemini API Key**.

### 1. Obtain a Gemini API Key
Get your free or paid API key from [Google AI Studio](https://aistudio.google.com/).

### 2. Configure Local Environment Variables
Create or edit your `.env.local` file in the root directory of the project:

```bash
cp .env.example .env.local
```

Add your `GEMINI_API_KEY` in `.env.local`:

```env
# Google Gemini API Key for curriculum PDF parsing
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

> **Note:** Never commit your actual API keys or `.env.local` file to version control. The `.env.local` file is listed in `.gitignore` for security.

---

## Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** / **yarn** / **pnpm** / **bun**

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   cd FlowcahrtViz
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables as described in the [Environment Setup](#environment-setup--api-key-configuration) section.

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

- `npm run dev`: Runs the app in development mode with Next.js Turbopack.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs ESLint checks across the project codebase.

---

## Project Structure

```
FlowchartViz/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── parse-curriculum/route.ts  # Gemini API PDF parsing route
│   │   ├── globals.css                    # Tailwind CSS configuration
│   │   ├── layout.tsx                     # Root layout component
│   │   └── page.tsx                       # Main application view
│   ├── components/
│   │   ├── CurriculumFlow.tsx             # React Flow Canvas & node mapping
│   │   ├── FileUpload.tsx                 # Drag-and-drop PDF upload component
│   │   ├── GWACalculator.tsx              # Interactive GWA calculation panel
│   │   └── ui/                            # Reusable UI components
│   ├── lib/                               # Utility functions
│   └── store/
│       └── courseStore.ts                 # Zustand store for courses & state
├── .env.example                           # Environment variable template
├── .env.local                             # Local environment secrets (git-ignored)
├── package.json                           # Project dependencies and scripts
└── README.md                              # Project documentation
```
