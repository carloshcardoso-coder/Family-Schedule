
import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { MemberManager } from './components/MemberManager';
import { Calendar } from './components/Calendar';
import { Task, Member, TaskStatus } from './types';
import { storageService } from './services/storageService';
import { parseNaturalLanguageTask } from './services/geminiService';
import { AVATARS } from './constants';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [smartInput, setSmartInput] = useState('');
  
  // Estado do formulário de Nova Tarefa
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0] + 'T12:00',
    assignedTo: '',
  });

  useEffect(() => {
    setTasks(storageService.getTasks());
    const existingMembers = storageService.getMembers();
    setMembers(existingMembers);
    if (existingMembers.length > 0) {
      setNewTask(prev => ({ ...prev, assignedTo: existingMembers[0].id }));
    }
  }, []);

  const saveTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    storageService.saveTasks(newTasks);
  };

  const saveMembers = (newMembers: Member[]) => {
    setMembers(newMembers);
    storageService.saveMembers(newMembers);
  };

  const handleAddMember = (memberData: Omit<Member, 'id'>) => {
    const member: Member = {
      ...memberData,
      id: Math.random().toString(36).substr(2, 9),
    };
    saveMembers([...members, member]);
  };

  const handleRemoveMember = (id: string) => {
    saveMembers(members.filter(m => m.id !== id));
  };

  const handleSmartParse = async () => {
    if (!smartInput.trim()) return;
    setIsAiLoading(true);
    const parsed = await parseNaturalLanguageTask(smartInput);
    if (parsed) {
      setNewTask({
        ...newTask,
        title: parsed.title,
        description: parsed.description,
        dueDate: parsed.dueDate.slice(0, 16), // Ajuste para input datetime-local
      });
      setSmartInput('');
    }
    setIsAiLoading(false);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const task: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTask.title,
      description: newTask.description,
      dueDate: new Date(newTask.dueDate).toISOString(),
      assignedTo: newTask.assignedTo,
      status: TaskStatus.PENDING,
      createdAt: new Date().toISOString(),
    };
    
    const updatedTasks = [...tasks, task];
    saveTasks(updatedTasks);
    setIsModalOpen(false);
    
    // Resetar formulário
    setNewTask({
      title: '',
      description: '',
      dueDate: new Date().toISOString().split('T')[0] + 'T12:00',
      assignedTo: members[0]?.id || '',
    });

    // Lógica de Notificação via WhatsApp
    const assignee = members.find(m => m.id === task.assignedTo);
    if (assignee?.phone) {
      const formattedDate = new Date(task.dueDate).toLocaleString('pt-BR');
      const message = encodeURIComponent(`Olá ${assignee.name}! Uma nova atividade foi atribuída a você: "${task.title}". Prazo: ${formattedDate}. Por favor, verifique o calendário da família!`);
      const waLink = `https://wa.me/${assignee.phone}?text=${message}`;
      window.open(waLink, '_blank');
    }
  };

  const toggleTaskStatus = (id: string) => {
    const updated = tasks.map(t => 
      t.id === id ? { ...t, status: t.status === TaskStatus.PENDING ? TaskStatus.COMPLETED : TaskStatus.PENDING } : t
    );
    saveTasks(updated);
    setActiveTask(updated.find(t => t.id === id) || null);
  };

  const deleteTask = (id: string) => {
    saveTasks(tasks.filter(t => t.id !== id));
    setActiveTask(null);
  };

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));

  const monthName = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <Layout 
      sidebar={
        <MemberManager 
          members={members} 
          onAddMember={handleAddMember} 
          onRemoveMember={handleRemoveMember} 
        />
      }
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 capitalize">{monthName}</h2>
          <div className="flex space-x-2 mt-2">
            <button onClick={prevMonth} className="p-2 rounded-full hover:bg-slate-200 transition-colors bg-slate-100 text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <button onClick={nextMonth} className="p-2 rounded-full hover:bg-slate-200 transition-colors bg-slate-100 text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          <span>Nova Atividade</span>
        </button>
      </div>

      <Calendar 
        currentDate={currentDate} 
        tasks={tasks} 
        onDateClick={(date) => {
          setNewTask({ ...newTask, dueDate: date.toISOString().split('T')[0] + 'T12:00' });
          setIsModalOpen(true);
        }}
        onTaskClick={(task) => setActiveTask(task)}
      />

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-sm font-medium">Tarefas Pendentes</p>
          <h4 className="text-4xl font-bold text-slate-800 mt-2">{tasks.filter(t => t.status === TaskStatus.PENDING).length}</h4>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-sm font-medium">Concluídas</p>
          <h4 className="text-4xl font-bold text-emerald-500 mt-2">{tasks.filter(t => t.status === TaskStatus.COMPLETED).length}</h4>
        </div>
        <div className="bg-indigo-600 p-6 rounded-2xl shadow-lg shadow-indigo-100 text-white">
          <p className="text-indigo-200 text-sm font-medium">Próximo Compromisso</p>
          <h4 className="text-xl font-bold mt-2 truncate">
            {tasks.filter(t => t.status === TaskStatus.PENDING).sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]?.title || "Tudo em dia!"}
          </h4>
        </div>
      </div>

      {/* Modal de Criação de Tarefa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Nova Atividade</h3>
                <p className="text-slate-500 text-sm">Atribua tarefas para membros da família</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Entrada Inteligente com IA */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tarefa Inteligente (IA)</label>
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    placeholder="ex: Comprar leite amanhã às 17h" 
                    className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-black"
                    value={smartInput}
                    onChange={e => setSmartInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSmartParse()}
                  />
                  <button 
                    onClick={handleSmartParse}
                    disabled={isAiLoading}
                    className="bg-indigo-50 text-indigo-600 p-3 rounded-xl hover:bg-indigo-100 transition-colors disabled:opacity-50"
                  >
                    {isAiLoading ? (
                      <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Título</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Nome da atividade"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-black"
                      value={newTask.title}
                      onChange={e => setNewTask({...newTask, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Atribuir a</label>
                    <select 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-black"
                      value={newTask.assignedTo}
                      onChange={e => setNewTask({...newTask, assignedTo: e.target.value})}
                      required
                    >
                      <option value="">Selecionar Membro</option>
                      {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Data e Hora</label>
                  <input 
                    type="datetime-local" 
                    required
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-black"
                    value={newTask.dueDate}
                    onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Descrição</label>
                  <textarea 
                    rows={3}
                    placeholder="Adicione detalhes sobre a atividade..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm resize-none text-black"
                    value={newTask.description}
                    onChange={e => setNewTask({...newTask, description: e.target.value})}
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                >
                  Criar e Notificar via WhatsApp
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Detalhes da Tarefa */}
      {activeTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white h-full w-full max-w-md rounded-l-3xl shadow-2xl overflow-hidden animate-in slide-in-from-right-full duration-500">
            <div className="p-8 flex justify-between items-center border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">Detalhes da Tarefa</h3>
              <button onClick={() => setActiveTask(null)} className="text-slate-400 hover:text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="space-y-2">
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase ${
                  activeTask.status === TaskStatus.COMPLETED ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {activeTask.status === TaskStatus.PENDING ? 'PENDENTE' : 'CONCLUÍDO'}
                </div>
                <h4 className="text-2xl font-bold text-slate-800">{activeTask.title}</h4>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-indigo-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Data de Entrega</p>
                    <p className="text-slate-700 font-medium">{new Date(activeTask.dueDate).toLocaleString('pt-BR')}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-indigo-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Atribuído a</p>
                    <p className="text-slate-700 font-medium">
                      {members.find(m => m.id === activeTask.assignedTo)?.name || 'Não atribuído'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase">Descrição</p>
                <div className="bg-slate-50 p-4 rounded-2xl text-slate-600 text-sm leading-relaxed">
                  {activeTask.description || 'Nenhuma descrição fornecida.'}
                </div>
              </div>

              <div className="pt-8 space-y-3">
                <button 
                  onClick={() => toggleTaskStatus(activeTask.id)}
                  className={`w-full font-bold py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center space-x-2 ${
                    activeTask.status === TaskStatus.COMPLETED 
                      ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                      : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-100'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>{activeTask.status === TaskStatus.COMPLETED ? 'Marcar como Pendente' : 'Marcar como Concluída'}</span>
                </button>
                <button 
                  onClick={() => deleteTask(activeTask.id)}
                  className="w-full text-slate-400 font-medium py-3 rounded-2xl hover:text-red-500 hover:bg-red-50 transition-all"
                >
                  Excluir Tarefa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
