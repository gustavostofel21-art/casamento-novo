import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Convidado } from '../types';
import { Plus, Trash2, Users, CheckCircle, XCircle } from 'lucide-react';

const Guests: React.FC = () => {
  const [guests, setGuests] = useState<Convidado[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newGuest, setNewGuest] = useState<Partial<Convidado>>({
    nome: '', sobrenome: '', lado: 'Comum', acompanhantes: 0
  });

  const fetchGuests = async () => {
    const { data, error } = await supabase.from('convidados').select('*').order('nome');
    if (!error) setGuests(data || []);
  };

  useEffect(() => { fetchGuests(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('convidados').insert(newGuest);
    if (!error) {
      setShowAdd(false);
      setNewGuest({ nome: '', sobrenome: '', lado: 'Comum', acompanhantes: 0 });
      fetchGuests();
    }
  };

  const toggleConfirm = async (guest: Convidado) => {
    const { error } = await supabase.from('convidados').update({ confirmado: !guest.confirmado }).eq('id', guest.id);
    if (!error) fetchGuests();
  };

  const deleteGuest = async (id: string) => {
    if(confirm('Remover convidado?')) {
      const { error } = await supabase.from('convidados').delete().eq('id', id);
      if (!error) fetchGuests();
    }
  };

  const totalGuests = guests.reduce((acc, curr) => acc + 1 + curr.acompanhantes, 0);
  const confirmedGuests = guests.filter(g => g.confirmado).reduce((acc, curr) => acc + 1 + curr.acompanhantes, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <h2 className="text-xl font-serif font-bold text-gray-800">Lista de Convidados</h2>
        <div className="flex gap-4">
          <div className="text-right">
             <p className="text-xs text-gray-500 uppercase">Total Estimado</p>
             <p className="text-xl font-bold text-gray-900">{totalGuests}</p>
          </div>
          <div className="text-right border-l pl-4 border-gray-200">
             <p className="text-xs text-gray-500 uppercase">Confirmados</p>
             <p className="text-xl font-bold text-olive-600">{confirmedGuests}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={() => setShowAdd(!showAdd)} className="bg-olive-600 text-white px-4 py-2 rounded-xl hover:bg-olive-700 flex items-center gap-2 shadow-lg shadow-olive-200">
          <Plus size={18} /> Adicionar Convidado
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-1"><label className="text-xs font-bold text-gray-500">Nome</label><input required className="w-full p-2 border rounded-lg" value={newGuest.nome} onChange={e => setNewGuest({...newGuest, nome: e.target.value})} /></div>
          <div className="md:col-span-1"><label className="text-xs font-bold text-gray-500">Sobrenome</label><input required className="w-full p-2 border rounded-lg" value={newGuest.sobrenome} onChange={e => setNewGuest({...newGuest, sobrenome: e.target.value})} /></div>
          <div><label className="text-xs font-bold text-gray-500">Lado</label>
            <select className="w-full p-2 border rounded-lg bg-white" value={newGuest.lado} onChange={e => setNewGuest({...newGuest, lado: e.target.value as any})}>
              <option>Noivo</option><option>Noiva</option><option>Padrinho</option><option>Madrinha</option><option>Comum</option>
            </select>
          </div>
          <div><label className="text-xs font-bold text-gray-500">Acompanhantes</label><input type="number" min="0" className="w-full p-2 border rounded-lg" value={newGuest.acompanhantes} onChange={e => setNewGuest({...newGuest, acompanhantes: Number(e.target.value)})} /></div>
          <button type="submit" className="bg-gray-900 text-white p-2 rounded-lg h-[42px]">Salvar</button>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-olive-50 text-olive-800 text-xs uppercase font-bold">
            <tr>
              <th className="p-4 text-left">Convidado</th>
              <th className="p-4 text-center">Lado</th>
              <th className="p-4 text-center">Acomp.</th>
              <th className="p-4 text-center">RSVP</th>
              <th className="p-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {guests.map(g => (
              <tr key={g.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-gray-900">{g.nome} {g.sobrenome}</td>
                <td className="p-4 text-center text-sm text-gray-500">{g.lado}</td>
                <td className="p-4 text-center text-sm font-bold">{g.acompanhantes > 0 ? `+${g.acompanhantes}` : '-'}</td>
                <td className="p-4 flex justify-center">
                  <button 
                    onClick={() => toggleConfirm(g)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-all ${g.confirmado ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                  >
                    {g.confirmado ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    {g.confirmado ? 'Confirmado' : 'Pendente'}
                  </button>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => deleteGuest(g.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
            {guests.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-400">Nenhum convidado na lista.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Guests;