
import React, { useState } from 'react';
import { Member } from '../types';
import { AVATARS } from '../constants';

interface MemberManagerProps {
  members: Member[];
  onAddMember: (member: Omit<Member, 'id'>) => void;
  onRemoveMember: (id: string) => void;
}

export const MemberManager: React.FC<MemberManagerProps> = ({ members, onAddMember, onRemoveMember }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', phone: '', avatar: AVATARS[0] });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name || !newMember.email) return;
    onAddMember(newMember);
    setNewMember({ name: '', email: '', phone: '', avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)] });
    setIsAdding(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-slate-800">Membros do Grupo</h3>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md hover:bg-indigo-100 transition-colors font-medium"
        >
          {isAdding ? 'Cancelar' : '+ Adicionar'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
          <input 
            type="text" 
            placeholder="Nome Completo" 
            className="w-full text-sm p-2 rounded border border-slate-200 outline-none focus:border-indigo-500 text-black"
            value={newMember.name}
            onChange={e => setNewMember({...newMember, name: e.target.value})}
            required
          />
          <input 
            type="email" 
            placeholder="E-mail Gmail" 
            className="w-full text-sm p-2 rounded border border-slate-200 outline-none focus:border-indigo-500 text-black"
            value={newMember.email}
            onChange={e => setNewMember({...newMember, email: e.target.value})}
            required
          />
          <input 
            type="tel" 
            placeholder="WhatsApp (ex: 5511...)" 
            className="w-full text-sm p-2 rounded border border-slate-200 outline-none focus:border-indigo-500 text-black"
            value={newMember.phone}
            onChange={e => setNewMember({...newMember, phone: e.target.value})}
          />
          <button type="submit" className="w-full bg-indigo-600 text-white text-sm font-medium py-2 rounded shadow-sm hover:bg-indigo-700 transition-colors">
            Convidar Membro
          </button>
        </form>
      )}

      <div className="space-y-4">
        {members.map(member => (
          <div key={member.id} className="group flex items-center space-x-3">
            <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-100" />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-slate-800 truncate">{member.name}</p>
              <p className="text-xs text-slate-500 truncate">{member.email}</p>
            </div>
            <button 
              onClick={() => onRemoveMember(member.id)}
              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-1 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
