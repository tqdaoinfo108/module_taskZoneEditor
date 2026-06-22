import { useEditorStore } from '../store/useEditorStore';
import { 
  Hand, 
  MousePointer2, 
  PenTool, 
  Undo, 
  Redo, 
  ZoomIn, 
  ZoomOut,
  Maximize,
  Tag
} from 'lucide-react';
import { CadEditorOutput } from '../types';

interface ToolbarProps {
  onExport: (data: CadEditorOutput) => void;
}

export const Toolbar = ({ onExport }: ToolbarProps) => {
  const { 
    mode, 
    setMode, 
    undo, 
    redo, 
    zoom, 
    setZoom,
    setPan,
    showLabels,
    toggleLabels,
    image,
    zones,
    past,
    future,
    currentPolygon,
    finishPolygon,
    cancelPolygon
  } = useEditorStore(state => state);

  return (
    <div className="flex items-center justify-between p-2 bg-white border-b border-gray-200">
      <div className="flex items-center gap-1">
        <div className="flex items-center bg-gray-100 rounded-md p-1 mr-2">
          <button
            onClick={() => setMode('select')}
            className={`p-1.5 rounded ${mode === 'select' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'} text-gray-700`}
            title="Select tool"
          >
            <MousePointer2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMode('pan')}
            className={`p-1.5 rounded ${mode === 'pan' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'} text-gray-700`}
            title="Pan tool"
          >
            <Hand className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMode('draw')}
            className={`p-1.5 rounded ${mode === 'draw' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'} text-gray-700`}
            title="Draw Polygon tool"
          >
            <PenTool className="w-4 h-4" />
          </button>
        </div>

        {mode === 'draw' && currentPolygon.length > 0 && (
          <div className="flex items-center gap-2 mr-2">
            <span className="text-xs text-gray-500">{currentPolygon.length} pts</span>
            <button
              onClick={finishPolygon}
              disabled={currentPolygon.length < 3}
              className="text-xs px-2 py-1 bg-green-500 text-white rounded disabled:opacity-50"
            >
              Finish
            </button>
            <button
              onClick={cancelPolygon}
              className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        <button
          onClick={undo}
          disabled={past.length === 0}
          className="p-1.5 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-30"
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          onClick={redo}
          disabled={future.length === 0}
          className="p-1.5 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-30"
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        <button
          onClick={() => setZoom(zoom * 1.2)}
          className="p-1.5 rounded text-gray-600 hover:bg-gray-100"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(zoom / 1.2)}
          className="p-1.5 rounded text-gray-600 hover:bg-gray-100"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          className="p-1.5 rounded text-gray-600 hover:bg-gray-100"
          title="Fit to Screen"
        >
          <Maximize className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        <button
          onClick={toggleLabels}
          className={`p-1.5 rounded ${showLabels ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
          title={showLabels ? "Hide Labels" : "Show Labels"}
        >
          <Tag className="w-4 h-4" />
        </button>
      </div>
      
      <div>
        <button 
          onClick={() => onExport({ image, zones })}
          className="text-sm px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition-colors"
        >
          Export JSON
        </button>
      </div>
    </div>
  );
};
