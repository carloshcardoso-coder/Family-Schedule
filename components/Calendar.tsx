
import React from 'react';
import { Task, TaskStatus } from '../types';

interface CalendarProps {
  currentDate: Date;
  tasks: Task[];
  onDateClick: (date: Date) => void;
  onTaskClick: (task: Task) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ currentDate, tasks, onDateClick, onTaskClick }) => {
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonthDays = getDaysInMonth(year, month - 1);
  const calendarDays = [];

  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarDays.push({
      date: new Date(year, month - 1, prevMonthDays - i),
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      date: new Date(year, month, i),
      isCurrentMonth: true,
    });
  }

  // Next month leading days
  const remainingCells = 42 - calendarDays.length;
  for (let i = 1; i <= remainingCells; i++) {
    calendarDays.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false,
    });
  }

  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      const d = new Date(task.dueDate);
      return d.getDate() === date.getDate() && 
             d.getMonth() === date.getMonth() && 
             d.getFullYear() === date.getFullYear();
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="grid grid-cols-7 border-b border-slate-100">
        {weekdays.map(day => (
          <div key={day} className="py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {calendarDays.map((day, idx) => {
          const dateTasks = getTasksForDate(day.date);
          const isToday = day.date.toDateString() === new Date().toDateString();
          
          return (
            <div 
              key={idx} 
              onClick={() => onDateClick(day.date)}
              className={`min-h-[140px] p-2 border-b border-r border-slate-50 transition-colors hover:bg-slate-50 cursor-pointer ${!day.isCurrentMonth ? 'opacity-40' : ''}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}>
                  {day.date.getDate()}
                </span>
                {dateTasks.length > 0 && (
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-bold">
                    {dateTasks.length}
                  </span>
                )}
              </div>
              <div className="space-y-1 overflow-hidden">
                {dateTasks.slice(0, 3).map(task => (
                  <div 
                    key={task.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTaskClick(task);
                    }}
                    className={`text-[10px] px-2 py-1 rounded truncate flex items-center space-x-1 ${
                      task.status === TaskStatus.COMPLETED 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 line-through opacity-70' 
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                    }`}
                  >
                    <div className={`w-1 h-1 rounded-full ${task.status === TaskStatus.COMPLETED ? 'bg-emerald-400' : 'bg-indigo-400'}`} />
                    <span>{task.title}</span>
                  </div>
                ))}
                {dateTasks.length > 3 && (
                  <div className="text-[10px] text-slate-400 pl-1 font-medium italic">
                    + mais {dateTasks.length - 3}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
