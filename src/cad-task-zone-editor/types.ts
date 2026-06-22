export type Point = { x: number; y: number };

export type TaskStatus = 'todo' | 'doing' | 'done';

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  assignee?: string;
};

export type Zone = {
  id: string;
  name: string;
  polygon: Point[];
  task?: Task;
  isLocked?: boolean;
};

export type CadEditorOutput = {
  image: string;
  zones: Zone[];
};
