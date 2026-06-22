import { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Line, Circle, Group, Text } from 'react-konva';
import useImage from 'use-image';
import { useEditorStore } from '../store/useEditorStore';
import { Point } from '../types';
import { KonvaEventObject } from 'konva/lib/Node';

interface CanvasViewerProps {
  readonly?: boolean;
}

export const CanvasViewer = ({ readonly }: CanvasViewerProps) => {
  const { 
    image: imageUrl,  
    zones, 
    mode, 
    zoom, 
    pan,
    showLabels,
    setZoom, 
    setPan,
    currentPolygon,
    addPointToCurrent,
    updateCurrentPoint,
    selectedZoneId,
    selectZone,
    updateZone
  } = useEditorStore(state => state);

  const [image, status] = useImage(imageUrl, 'anonymous');
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          setDimensions({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          });
        }
      }
    });
    observer.observe(containerRef.current);
    
    // Initial size
    setDimensions({
      width: containerRef.current.offsetWidth,
      height: containerRef.current.offsetHeight,
    });
    
    return () => observer.disconnect();
  }, []);

  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    if (!stageRef.current) return;

    const scaleBy = 1.1;
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    setZoom(newScale);

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    setPan(newPos);
  };

  const handleStageClick = (e: KonvaEventObject<MouseEvent>) => {
    if (mode === 'pan') return;

    const stage = stageRef.current;
    if (!stage) return;
    
    const pos = stage.getPointerPosition();
    if (!pos) return;
    
    // adjust for scale and pan
    const scale = stage.scaleX();
    const relativePos = {
      x: (pos.x - stage.x()) / scale,
      y: (pos.y - stage.y()) / scale
    };

    if (readonly) return;

    if (mode === 'draw') {
      addPointToCurrent(relativePos);
    } else if (mode === 'select') {
      // Check if clicked exactly on background (not on a zone)
      if (e.target === stage || e.target.attrs.id === 'bg-image') {
        selectZone(null);
      }
    }
  };

  const getStatusColor = (status?: string) => {
    if (status === 'todo') return 'rgba(156, 163, 175, 0.4)'; // gray
    if (status === 'doing') return 'rgba(59, 130, 246, 0.4)'; // blue
    if (status === 'done') return 'rgba(34, 197, 94, 0.4)'; // green
    return 'rgba(156, 163, 175, 0.4)';
  };

  const getStatusStrokeColor = (status?: string) => {
    if (status === 'todo') return 'rgb(107, 114, 128)';
    if (status === 'doing') return 'rgb(37, 99, 235)';
    if (status === 'done') return 'rgb(22, 163, 74)';
    return 'rgb(107, 114, 128)';
  };

  return (
    <div ref={containerRef} className="absolute inset-0 bg-gray-200 overflow-hidden outline-none flex items-center justify-center">
      {status === 'loading' && <div className="absolute inset-0 flex items-center justify-center text-gray-500 font-medium z-10 w-full h-full pointer-events-none">Loading image...</div>}
      {status === 'failed' && <div className="absolute inset-0 flex items-center justify-center text-red-500 font-medium z-10 w-full h-full pointer-events-none">Failed to load image</div>}
      
      {dimensions.width > 0 && dimensions.height > 0 && (
        <Stage
          ref={stageRef}
          width={dimensions.width}
          height={dimensions.height}
          onWheel={handleWheel}
          scaleX={zoom}
          scaleY={zoom}
          x={pan.x}
          y={pan.y}
          draggable={mode === 'pan'}
          onDragEnd={(e) => {
            if (e.target === stageRef.current) {
              setPan({ x: e.target.x(), y: e.target.y() });
            }
          }}
          onClick={handleStageClick}
          style={{ cursor: mode === 'pan' ? 'grab' : mode === 'draw' ? 'crosshair' : 'default' }}
        >
          <Layer>
            {image && (
              <KonvaImage 
                image={image} 
                id="bg-image"
              />
            )}
          </Layer>
          
          <Layer>
            {/* Render existing zones */}
          {zones.map((zone) => {
            const isSelected = selectedZoneId === zone.id;
            const pointsArray = zone.polygon.flatMap(p => [p.x, p.y]);
            
            const minX = Math.min(...zone.polygon.map(p => p.x));
            const maxX = Math.max(...zone.polygon.map(p => p.x));
            const minY = Math.min(...zone.polygon.map(p => p.y));
            const maxY = Math.max(...zone.polygon.map(p => p.y));
            const width = maxX - minX;
            const height = maxY - minY;

            return (
              <Group key={zone.id}>
                <Line
                  points={pointsArray}
                  fill={getStatusColor(zone.task?.status)}
                  stroke={isSelected && !readonly ? '#f59e0b' : getStatusStrokeColor(zone.task?.status)} // amber if selected
                  strokeWidth={isSelected && !readonly ? 3 / zoom : 2 / zoom}
                  closed
                  draggable={!readonly && !zone.isLocked && isSelected && mode === 'select'}
                  onDragEnd={(e) => {
                    e.cancelBubble = true;
                    if (readonly) return;
                    const shape = e.target;
                    const deltaX = shape.x();
                    const deltaY = shape.y();
                    // apply delta to all polygon points and reset position
                    const newPolygon = zone.polygon.map(p => ({
                      x: p.x + deltaX,
                      y: p.y + deltaY
                    }));
                    shape.position({ x: 0, y: 0 }); // reset
                    updateZone(zone.id, { polygon: newPolygon });
                  }}
                  onClick={() => {
                    if (mode === 'select' && !readonly) {
                      selectZone(zone.id);
                    }
                  }}
                  onTap={() => {
                    if (mode === 'select' && !readonly) {
                      selectZone(zone.id);
                    }
                  }}
                />

                {showLabels && width > 0 && height > 0 && (
                  <Group
                    clipFunc={(ctx) => {
                      if (zone.polygon.length < 3) return;
                      ctx.beginPath();
                      ctx.moveTo(zone.polygon[0].x, zone.polygon[0].y);
                      for (let i = 1; i < zone.polygon.length; i++) {
                        ctx.lineTo(zone.polygon[i].x, zone.polygon[i].y);
                      }
                      ctx.closePath();
                    }}
                  >
                    <Text
                      x={minX}
                      y={minY}
                      width={width}
                      height={height}
                      text={zone.name}
                      align="center"
                      verticalAlign="middle"
                      fill="#1f2937"
                      fontSize={Math.max(12, 16 / zoom)}
                      fontStyle="bold"
                      listening={false}
                    />
                  </Group>
                )}
                
                {/* Render handles if selected and not locked */}
                {!readonly && isSelected && !zone.isLocked && mode === 'select' && zone.polygon.map((p, idx) => (
                  <Circle
                    key={idx}
                    x={p.x}
                    y={p.y}
                    radius={5 / zoom}
                    fill="#fff"
                    stroke="#f59e0b"
                    strokeWidth={2 / zoom}
                    draggable
                    onDragMove={(e) => {
                      // Optionally update local state for fast UI 
                      // (We'll just rely on Zustand for simplicity in demo)
                    }}
                    onDragEnd={(e) => {
                      e.cancelBubble = true;
                      const newPoly = [...zone.polygon];
                      newPoly[idx] = { x: e.target.x(), y: e.target.y() };
                      updateZone(zone.id, { polygon: newPoly });
                    }}
                    onDblClick={(e) => {
                      e.cancelBubble = true;
                      if (zone.polygon.length > 3) {
                        const newPoly = zone.polygon.filter((_, i) => i !== idx);
                        updateZone(zone.id, { polygon: newPoly });
                      }
                    }}
                  />
                ))}
              </Group>
            );
          })}

          {/* Render polygon currently being drawn */}
          {mode === 'draw' && currentPolygon.length > 0 && (
            <>
              <Line
                points={currentPolygon.flatMap(p => [p.x, p.y])}
                stroke="#f59e0b"
                strokeWidth={2 / zoom}
                closed={false}
              />
              {currentPolygon.map((p, idx) => (
                <Circle
                  key={`cur-${idx}`}
                  x={p.x}
                  y={p.y}
                  radius={4 / zoom}
                  fill="#f59e0b"
                />
              ))}
            </>
          )}
        </Layer>
      </Stage>
      )}
    </div>
  );
};
