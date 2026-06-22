import { createStore, StoreApi, useStore as useZustandStore } from 'zustand';
import { createContext, useContext, useRef, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Point, Zone, CadEditorOutput } from '../types';

interface HistoryState {
  zones: Zone[];
}

export interface EditorStore {
  // Data
  image: string;
  zones: Zone[];
  
  // UI State
  selectedZoneId: string | null;
  mode: 'select' | 'draw' | 'pan';
  currentPolygon: Point[];
  zoom: number;
  pan: Point;
  showLabels: boolean;
  
  // History
  past: HistoryState[];
  future: HistoryState[];

  // Actions
  setImage: (url: string) => void;
  setZones: (zones: Zone[]) => void;
  setMode: (mode: 'select' | 'draw' | 'pan') => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: Point) => void;
  toggleLabels: () => void;
  
  selectZone: (id: string | null) => void;
  updateZone: (id: string, updates: Partial<Zone>) => void;
  deleteZone: (id: string) => void;
  
  addPointToCurrent: (p: Point) => void;
  updateCurrentPoint: (index: number, p: Point) => void;
  finishPolygon: () => void;
  cancelPolygon: () => void;
  
  saveToHistory: () => void;
  undo: () => void;
  redo: () => void;
  
  loadData: (data: CadEditorOutput) => void;
}

export const createEditorStore = () => createStore<EditorStore>((set, get) => ({
  image: '',
  zones: [],
  selectedZoneId: null,
  mode: 'select',
  currentPolygon: [],
  zoom: 1,
  pan: { x: 0, y: 0 },
  showLabels: true,
  past: [],
  future: [],

  setImage: (image) => set({ image }),
  setZones: (zones) => set({ zones }),
  
  setMode: (mode) => set({ mode, currentPolygon: [] }),
  setZoom: (zoom) => set({ zoom }),
  setPan: (pan) => set({ pan }),
  toggleLabels: () => set((state) => ({ showLabels: !state.showLabels })),
  
  selectZone: (id) => set({ selectedZoneId: id }),
  
  saveToHistory: () => {
    const { zones, past } = get();
    set({
      past: [...past, { zones }],
      future: []
    });
  },

  updateZone: (id, updates) => {
    get().saveToHistory();
    set((state) => ({
      zones: state.zones.map((z) => (z.id === id ? { ...z, ...updates } : z))
    }));
  },
  
  deleteZone: (id) => {
    get().saveToHistory();
    set((state) => ({
      zones: state.zones.filter((z) => z.id !== id),
      selectedZoneId: state.selectedZoneId === id ? null : state.selectedZoneId
    }));
  },

  addPointToCurrent: (p) => {
    set((state) => ({ currentPolygon: [...state.currentPolygon, p] }));
  },
  
  updateCurrentPoint: (index, p) => {
    set((state) => {
      const newPoly = [...state.currentPolygon];
      newPoly[index] = p;
      return { currentPolygon: newPoly };
    });
  },

  finishPolygon: () => {
    const { currentPolygon, zones } = get();
    if (currentPolygon.length < 3) return; // ignore invalid polygons
    
    get().saveToHistory();
    const newZone: Zone = {
      id: `zone-${uuidv4().slice(0,8)}`,
      name: `New Zone ${zones.length + 1}`,
      polygon: currentPolygon,
      task: {
        id: `task-${uuidv4().slice(0,8)}`,
        title: 'New Task',
        status: 'todo'
      }
    };
    
    set({
      zones: [...zones, newZone],
      currentPolygon: [],
      mode: 'select',
      selectedZoneId: newZone.id
    });
  },
  
  cancelPolygon: () => set({ currentPolygon: [], mode: 'select' }),

  undo: () => {
    const { past, future, zones } = get();
    if (past.length === 0) return;
    
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    
    set({
      past: newPast,
      future: [{ zones }, ...future],
      zones: previous.zones,
      selectedZoneId: null
    });
  },
  
  redo: () => {
    const { past, future, zones } = get();
    if (future.length === 0) return;
    
    const next = future[0];
    const newFuture = future.slice(1);
    
    set({
      past: [...past, { zones }],
      future: newFuture,
      zones: next.zones,
      selectedZoneId: null
    });
  },
  
  loadData: (data) => set({
    image: data.image,
    zones: data.zones || [],
    past: [],
    future: [],
    selectedZoneId: null,
    mode: 'select'
  })
}));

const EditorContext = createContext<StoreApi<EditorStore> | null>(null);

interface EditorProviderProps {
  children: ReactNode;
}

export function EditorProvider({ children }: EditorProviderProps) {
  const storeRef = useRef<StoreApi<EditorStore>>(undefined);
  if (!storeRef.current) {
    storeRef.current = createEditorStore();
  }
  return (
    <EditorContext.Provider value={storeRef.current}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditorStore<T>(selector: (state: EditorStore) => T): T {
  const store = useContext(EditorContext);
  if (!store) {
    throw new Error('useEditorStore must be used within an EditorProvider');
  }
  return useZustandStore(store, selector);
}
