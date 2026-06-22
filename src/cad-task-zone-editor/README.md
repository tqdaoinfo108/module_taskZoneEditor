# CAD Task Zone Editor

A production-ready React module for visualizing 2D CAD floor plans, drawing polygonal zones, and managing construction/operation tasks.

## Features
- **Canvas Rendering**: Uses `react-konva` for high-performance canvas.
- **Interactive Tools**: Pan, Zoom, Fit, Draw Polygon.
- **Task Management**: Select zones and assign tasks, status, and assignees.
- **History**: Undo/Redo support.
- **Embeddable**: Easily integratable into existing React SPAs.
- **JSON Output**: Standardized JSON output for backend integration.

## Installation

\`\`\`bash
npm install cad-task-zone-editor konva react-konva zustand uuid
\`\`\`

## Usage

\`\`\`tsx
import { CadTaskEditor } from "cad-task-zone-editor";

function MyComponent() {
  const [data, setData] = useState(null);

  return (
    <CadTaskEditor
       image="/cad-blueprint.png"
       zones={[]}
       onChange={(updatedData) => setData(updatedData)}
       readonly={false}
       className="w-full h-[600px]"
    />
  );
}
\`\`\`

## Technologies Used
- **Zustand** + **React Context**: Isolated state management for multi-instance support.
- **React Konva**: Hardware accelerated graphics, scalable for large CAD blueprints.
- **Tailwind CSS**: Clean, responsive, minimal UI overlay.
