
import { Task, Member, TaskStatus } from '../types';

const STORAGE_KEYS = {
  TASKS: 'syncfamily_tasks',
  MEMBERS: 'syncfamily_members',
};

export const storageService = {
  getTasks: (): Task[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TASKS);
    return data ? JSON.parse(data) : [];
  },

  saveTasks: (tasks: Task[]) => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  },

  getMembers: (): Member[] => {
    const data = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    if (!data) {
      const defaultMembers: Member[] = [
        { id: '1', name: 'Alex Thompson', email: 'alex@gmail.com', phone: '5511999998888', avatar: 'https://picsum.photos/seed/alex/100/100' },
        { id: '2', name: 'Sarah Miller', email: 'sarah@gmail.com', phone: '5511988887777', avatar: 'https://picsum.photos/seed/sarah/100/100' },
      ];
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(defaultMembers));
      return defaultMembers;
    }
    return JSON.parse(data);
  },

  saveMembers: (members: Member[]) => {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  }
};
