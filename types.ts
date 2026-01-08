
export enum TaskStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string; // ISO string
  assignedTo: string; // Member ID
  status: TaskStatus;
  createdAt: string;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: Task[];
}
