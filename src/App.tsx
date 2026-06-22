import { useState } from 'react';
import { CadTaskEditor } from './cad-task-zone-editor';
import { CadEditorOutput, Zone } from './cad-task-zone-editor/types';

// Demo initial data
const initialZones: Zone[] = [
  {
    id: "zone-01",
    name: "Khu A - Lắp ráp",
    polygon: [
      { x: 100, y: 100 },
      { x: 300, y: 100 },
      { x: 300, y: 250 },
      { x: 100, y: 250 }
    ],
    task: {
      id: "task-01",
      title: "Lắp đặt đường ống",
      status: "doing",
      assignee: "user01"
    }
  },
  {
    id: "zone-02",
    name: "Khu B - Test",
    polygon: [
      { x: 350, y: 100 },
      { x: 500, y: 100 },
      { x: 500, y: 250 },
      { x: 350, y: 250 }
    ],
    task: {
      id: "task-02",
      title: "Kiểm tra rò rỉ",
      status: "todo",
      assignee: "user02"
    }
  }
];

export default function App() {
  const [outputData, setOutputData] = useState<CadEditorOutput | null>(null);
  const [currentImage, setCurrentImage] = useState<string>('https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCurrentImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 p-8 font-sans text-gray-900">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">CAD Task Zone Editor</h1>
            <p className="text-sm text-gray-500 mt-1">
              Draw polygons on the blueprint, assign tasks, and export to JSON.
              Scroll to zoom, drag to pan. Click "Add Polygon" tool to draw.
            </p>
          </div>
          <div>
            <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-md shadow-sm transition-colors inline-block">
              Upload Blueprint (PNG/JPG)
              <input 
                type="file" 
                accept="image/png, image/jpeg, image/jpg" 
                className="hidden" 
                onChange={handleImageUpload} 
              />
            </label>
          </div>
        </div>
        
        <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200">
          <CadTaskEditor 
            key={currentImage} // Force re-mount when image changes so hook dependencies update correctly
            image={currentImage}
            zones={initialZones}
            onChange={(data) => setOutputData(data)}
            className="h-[650px] w-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">Integration Output Data</h2>
            <pre className="text-xs bg-gray-50 p-4 rounded border border-gray-200 overflow-auto h-64 font-mono text-gray-600">
              {outputData ? JSON.stringify(outputData, null, 2) : 'Make some changes to see export data...'}
            </pre>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">Module Usage</h2>
            <pre className="text-xs bg-gray-900 text-gray-100 p-4 rounded border border-gray-200 overflow-auto font-mono">
{`import { CadTaskEditor } from "cad-task-zone-editor";

function MyProject() {
  return (
    <CadTaskEditor
      image="/floor-plan.png"
      zones={zones}
      onChange={(data) => console.log(data)}
      readonly={false}
    />
  );
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
