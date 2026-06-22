import { useEffect, useRef } from 'react';
import { EditorProvider, useEditorStore } from './store/useEditorStore';
import { CanvasViewer } from './components/CanvasViewer';
import { Toolbar } from './components/Toolbar';
import { TaskPanel } from './components/TaskPanel';
import { CadEditorOutput, Zone } from './types';

export interface CadTaskEditorProps {
  image?: string;
  zones?: Zone[];
  readonly?: boolean;
  onChange?: (data: CadEditorOutput) => void;
  className?: string;
}

// Inner component to consume Context
const EditorInner = ({ image, zones, onChange, readonly }: CadTaskEditorProps) => {
  const { loadData, image: currentImage, zones: currentZones } = useEditorStore(state => state);

  // Initialization only
  const isInitialized = useRef(false);
  useEffect(() => {
    if (!isInitialized.current) {
      loadData({
        image: image || '',
        zones: zones || []
      });
      isInitialized.current = true;
    }
  }, [image, zones, loadData]);

  // Handle onChange
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  
  // We can call onChangeRef from the Toolbar Export button or subscribe to Zustand changes manually.
  // Using a useEffect on [currentImage, currentZones] can cause a React render cascade.
  useEffect(() => {
    if (isInitialized.current && onChangeRef.current) {
      // For immediate feedback in the demo, we safely call it without causing a tight infinite loop.
      const ms = setTimeout(() => {
        onChangeRef.current?.({ image: currentImage, zones: currentZones });
      }, 0);
      return () => clearTimeout(ms);
    }
  }, [currentImage, currentZones]);

  return (
    <div className="flex flex-col h-full w-full bg-gray-100">
      {!readonly && <Toolbar onExport={(data) => onChange?.(data)} />}
      <div className="flex flex-1 overflow-hidden relative">
        <div className="flex-1 relative h-full">
          <CanvasViewer />
        </div>
        {!readonly && <TaskPanel />}
      </div>
    </div>
  );
};

export const CadTaskEditor = (props: CadTaskEditorProps) => {
  return (
    <div className={`cad-task-editor-root border border-gray-300 rounded-lg overflow-hidden flex flex-col bg-white shadow-sm ${props.className || 'h-[600px] w-full'}`}>
      <EditorProvider>
        <EditorInner {...props} />
      </EditorProvider>
    </div>
  );
};
