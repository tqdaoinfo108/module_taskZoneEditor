import { useEditorStore } from '../store/useEditorStore';
import { TaskStatus } from '../types';
import { Trash2, Lock, Unlock } from 'lucide-react';

export const TaskPanel = () => {
  const { zones, selectedZoneId, selectZone, updateZone, deleteZone } = useEditorStore(state => state);

  const selectedZone = zones.find(z => z.id === selectedZoneId);

  if (!selectedZone) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-4 flex flex-col h-full overflow-y-auto">
        <h2 className="font-semibold text-gray-800 mb-4">Zones ({zones.length})</h2>
        <div className="space-y-2">
          {zones.length === 0 ? (
            <p className="text-sm text-gray-500">No zones yet. Select the draw tool to create one.</p>
          ) : (
            zones.map(z => (
              <div 
                key={z.id}
                onClick={() => selectZone(z.id)}
                className="p-3 bg-gray-50 rounded-md border border-gray-100 cursor-pointer hover:border-blue-300 transition-colors"
              >
                <div className="font-medium text-sm text-gray-800">{z.name}</div>
                <div className="text-xs text-gray-500 mt-1 flex items-center justify-between">
                  <span>{z.task?.title || 'No task'}</span>
                  <StatusBadge status={z.task?.status} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <button 
          onClick={() => selectZone(null)}
          className="text-sm text-blue-600 hover:text-blue-800 mb-3 block"
        >
          &larr; Back to all zones
        </button>
        <div className="flex items-center justify-between">
          <input 
            type="text" 
            value={selectedZone.name}
            onChange={(e) => updateZone(selectedZone.id, { name: e.target.value })}
            className="font-semibold text-lg text-gray-800 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-1 py-0.5 w-full mr-2"
          />
          <button 
            onClick={() => updateZone(selectedZone.id, { isLocked: !selectedZone.isLocked })}
            className="p-1.5 text-gray-500 hover:text-gray-800 rounded hover:bg-gray-100"
            title={selectedZone.isLocked ? "Unlock zone" : "Lock zone"}
          >
            {selectedZone.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1 px-1 font-mono">{selectedZone.id}</p>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Task Details</h3>
        
        {selectedZone.task ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
              <input 
                type="text" 
                value={selectedZone.task.title}
                onChange={(e) => updateZone(selectedZone.id, { 
                  task: { ...selectedZone.task!, title: e.target.value } 
                })}
                className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Task title..."
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Assignee</label>
              <input 
                type="text" 
                value={selectedZone.task.assignee || ''}
                onChange={(e) => updateZone(selectedZone.id, { 
                  task: { ...selectedZone.task!, assignee: e.target.value } 
                })}
                className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="e.g. user01"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <select
                value={selectedZone.task.status}
                onChange={(e) => updateZone(selectedZone.id, { 
                  task: { ...selectedZone.task!, status: e.target.value as TaskStatus } 
                })}
                className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="todo">To Do</option>
                <option value="doing">Doing</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>
        ) : (
          <button
            onClick={() => updateZone(selectedZone.id, {
              task: { id: `task-${Date.now()}`, title: 'New Task', status: 'todo' }
            })}
            className="text-sm px-3 py-2 border border-dashed border-gray-400 text-gray-600 rounded-md w-full hover:bg-gray-50 transition-colors"
          >
            + Add Task
          </button>
        )}
      </div>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => deleteZone(selectedZone.id)}
          className="flex items-center justify-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete Zone
        </button>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status?: string }) => {
  if (status === 'doing') return <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700">Doing</span>;
  if (status === 'done') return <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700">Done</span>;
  return <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-700">To Do</span>;
};
