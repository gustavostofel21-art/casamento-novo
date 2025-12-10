import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Convidado, Acompanhante } from '../types';
import {
  Plus, Trash2, Users, CheckCircle, XCircle, User, Phone,
  ChevronDown, Smile, X, Baby
} from 'lucide-react';

const Guests: React.FC = () => {
  const [guests, setGuests] = useState<Convidado[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    whatsapp: '',
    tipo_convidado: 'Comum',
    quantidadeAcompanhantes: 0 // 0 = Somente eu
  });

  const [acompanhantes, setAcompanhantes] = useState<Partial<Acompanhante>[]>([]);

  const fetchGuests = async () => {
    const { data, error } = await supabase
      .from('convidados')
      .select('*, acompanhantes_lista:acompanhantes(*)')
      .order('nome');

    if (!error && data) {
      setGuests(data);
    }
  };

  useEffect(() => { fetchGuests(); }, []);

  // Sync acompanhantes slots with quantity
  useEffect(() => {
    const currentCount = acompanhantes.length;
    const newCount = formData.quantidadeAcompanhantes;

    if (newCount > currentCount) {
      const toAdd = newCount - currentCount;
      const newSlots = Array(toAdd).fill({ nome: '', parentesco: '', is_crianca: false });
      setAcompanhantes([...acompanhantes, ...newSlots]);
    } else if (newCount < currentCount) {
      setAcompanhantes(acompanhantes.slice(0, newCount));
    }
  }, [formData.quantidadeAcompanhantes]);

  const updateAcompanhante = (index: number, field: keyof Acompanhante, value: any) => {
    const updated = [...acompanhantes];
    updated[index] = { ...updated[index], [field]: value };
    setAcompanhantes(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const nomeSplit = formData.nomeCompleto.trim().split(' ');
      const nome = nomeSplit[0];
      const sobrenome = nomeSplit.slice(1).join(' ') || '';

      // 1. Inserir Convidado Principal
      const { data: guestData, error: guestError } = await supabase
        .from('convidados')
        .insert({
          nome,
          sobrenome,
          telefone: formData.whatsapp,
          tipo_convidado: formData.tipo_convidado,
          acompanhantes: formData.quantidadeAcompanhantes,
          confirmado: true
        })
        .select()
        .single();

      if (guestError) throw guestError;

      // 2. Inserir Acompanhantes
      if (formData.quantidadeAcompanhantes > 0 && guestData) {
        const acompanhantesToInsert = acompanhantes.map(a => ({
          convidado_id: guestData.id,
          nome: a.nome,
          parentesco: a.parentesco,
          is_crianca: a.is_crianca
        }));

        const { error: acompError } = await supabase
          .from('acompanhantes')
          .insert(acompanhantesToInsert);

        if (acompError) throw acompError;
      }

      alert('Cadastrado com sucesso!');
      setShowAdd(false);
      // Reset Form
      setFormData({ nomeCompleto: '', whatsapp: '', tipo_convidado: 'Comum', quantidadeAcompanhantes: 0 });
      setAcompanhantes([]);
      fetchGuests();
    } catch (err: any) {
      alert('Erro ao salvar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Excluir FAMÍLIA inteira
  const deleteGuestGroup = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta família inteira da lista?')) {
      const { error } = await supabase.from('convidados').delete().eq('id', id);
      if (!error) fetchGuests();
      else alert('Erro ao excluir: ' + error.message);
    }
  };

  // Excluir UM acompanhante
  const deleteCompanion = async (companionId: string) => {
    if (confirm('Remover apenas este acompanhante?')) {
      const { error } = await supabase.from('acompanhantes').delete().eq('id', companionId);
      if (!error) {
        fetchGuests(); // Atualiza a lista para refletir a remoção
      } else {
        alert('Erro ao excluir acompanhante: ' + error.message);
      }
    }
  };

  const toggleConfirm = async (guest: Convidado) => {
    const { error } = await supabase.from('convidados').update({ confirmado: !guest.confirmado }).eq('id', guest.id);
    if (!error) fetchGuests();
  };

  // Cálculos de totais
  const stats = React.useMemo(() => {
    let total = 0;
    let confirmed = 0;
    let adults = 0;
    let children = 0;

    guests.forEach(g => {
      // Main guest (always counts as adult)
      total += 1;
      adults += 1;
      if (g.confirmado) confirmed += 1;

      // Companions
      if (g.acompanhantes_lista) {
        g.acompanhantes_lista.forEach(a => {
          total += 1;
          if (g.confirmado) confirmed += 1;

          if (a.is_crianca) children += 1;
          else adults += 1;
        });
      } else {
        // Fallback legacy (assume adults)
        const count = g.acompanhantes || 0;
        total += count;
        adults += count;
        if (g.confirmado) confirmed += count;
      }
    });

    return { total, confirmed, adults, children };
  }, [guests]);

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-20">

      {/* Header Stats */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-gray-800">Gerenciador de Convidados</h2>
          <p className="text-gray-500 text-sm">Controle de Lista e RSVP</p>
        </div>
        <div className="flex gap-4 md:gap-8 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
          <div className="text-center min-w-[80px]">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Pessoas</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="text-center pl-4 md:pl-8 border-l border-gray-100 min-w-[80px]">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Confirmados</p>
            <p className="text-3xl font-bold text-olive-600">{stats.confirmed}</p>
          </div>
          <div className="text-center pl-4 md:pl-8 border-l border-gray-100 min-w-[80px]">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide text-blue-600">Adultos</p>
            <p className="text-3xl font-bold text-gray-700">{stats.adults}</p>
          </div>
          <div className="text-center pl-4 md:pl-8 border-l border-gray-100 min-w-[80px]">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide text-pink-500">Crianças</p>
            <p className="text-3xl font-bold text-gray-700">{stats.children}</p>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center bg-olive-50/50 p-4 rounded-xl border border-olive-100">
        <p className="text-olive-700 font-bold ml-2">Famílias/Grupos: {guests.length}</p>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="bg-olive-600 text-white px-5 py-2.5 rounded-xl hover:bg-olive-700 flex items-center gap-3 shadow-lg shadow-olive-200 transition-all active:scale-95 font-bold"
        >
          {showAdd ? <X size={20} /> : <Plus size={20} />}
          {showAdd ? 'Cancelar' : 'Adicionar Manualmente'}
        </button>
      </div>

      {/* RESTORED PREMIUM FORM DESIGN */}
      {showAdd && (
        <div className="bg-white rounded-3xl shadow-xl border border-olive-100 overflow-hidden animate-slide-in relative mb-10">
          <div className="bg-olive-700 p-8 text-center pattern-bg">
            <h3 className="text-3xl font-serif text-white font-bold mb-2">Novo Cadastro</h3>
            <p className="text-olive-100 uppercase tracking-widest text-xs">Preencha os dados do convidado</p>
          </div>

          <form onSubmit={handleSave} className="p-8 md:p-10 space-y-8">

            {/* Dados Pessoais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <User size={14} /> Nome Completo
                </label>
                <input
                  required
                  placeholder="Digite o nome do convidado"
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-olive-500 transition-all outline-none text-lg"
                  value={formData.nomeCompleto}
                  onChange={e => setFormData({ ...formData, nomeCompleto: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <Phone size={14} /> Telefone / WhatsApp
                </label>
                <input
                  required
                  placeholder="(DD) 99999-9999"
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-olive-500 transition-all outline-none"
                  value={formData.whatsapp}
                  onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <Users size={14} /> Tipo de Convidado
                </label>
                <div className="relative">
                  <select
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-olive-500 outline-none appearance-none"
                    value={formData.tipo_convidado}
                    onChange={e => setFormData({ ...formData, tipo_convidado: e.target.value })}
                  >
                    <option value="Comum">Comum</option>
                    <option value="Padrinho">Padrinho</option>
                    <option value="Madrinha">Madrinha</option>
                    <option value="Noivo">Família do Noivo</option>
                    <option value="Noiva">Família da Noiva</option>
                    <option value="VIP">VIP</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <Plus size={14} /> Quantos Acompanhantes?
                </label>
                <div className="relative">
                  <select
                    className="w-full p-4 bg-olive-50 border border-olive-500 rounded-xl focus:bg-white outline-none appearance-none font-bold text-gray-800 border-2"
                    value={formData.quantidadeAcompanhantes}
                    onChange={e => setFormData({ ...formData, quantidadeAcompanhantes: Number(e.target.value) })}
                  >
                    <option value={0}>Somente o convidado</option>
                    <option value={1}>+ 1 pessoa</option>
                    <option value={2}>+ 2 pessoas</option>
                    <option value={3}>+ 3 pessoas</option>
                    <option value={4}>+ 4 pessoas</option>
                    <option value={5}>+ 5 pessoas</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                </div>
              </div>
            </div>

            {/* Acompanhantes */}
            {formData.quantidadeAcompanhantes > 0 && (
              <div className="space-y-6 animate-fade-in pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <Users size={20} className="text-olive-600" />
                  <h4 className="font-serif text-xl font-bold text-gray-800">Dados dos Acompanhantes</h4>
                </div>

                <div className="space-y-4">
                  {acompanhantes.map((acompanhante, idx) => (
                    <div key={idx} className="bg-olive-50/50 p-6 rounded-2xl border border-olive-100 space-y-4 relative">
                      <span className="absolute -top-3 left-6 bg-olive-100 text-olive-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                        Acompanhante {idx + 1}
                      </span>

                      <div className="space-y-2">
                        <input
                          placeholder="Nome completo do acompanhante"
                          className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:border-olive-400 outline-none"
                          value={acompanhante.nome}
                          onChange={(e) => updateAcompanhante(idx, 'nome', e.target.value)}
                          required
                        />
                      </div>

                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <select
                            className="w-full p-3 bg-white border border-gray-200 rounded-lg outline-none text-gray-600"
                            value={acompanhante.parentesco}
                            onChange={(e) => updateAcompanhante(idx, 'parentesco', e.target.value)}
                            required
                          >
                            <option value="">Selecione o parentesco</option>
                            <option value="Esposo(a)">Esposo(a)</option>
                            <option value="Namorado(a)">Namorado(a)</option>
                            <option value="Filho(a)">Filho(a)</option>
                            <option value="Pai/Mãe">Pai / Mãe</option>
                            <option value="Avô(ó)">Avô(ó)</option>
                            <option value="Tio(a)">Tio(a)</option>
                            <option value="Primo(a)">Primo(a)</option>
                            <option value="Amigo(a)">Amigo(a)</option>
                            <option value="Outro">Outro</option>
                          </select>
                        </div>

                        <label className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer md:w-auto hover:bg-gray-50 transition-colors">
                          <input
                            type="checkbox"
                            className="w-5 h-5 accent-olive-600 rounded"
                            checked={acompanhante.is_crianca}
                            onChange={(e) => updateAcompanhante(idx, 'is_crianca', e.target.checked)}
                          />
                          <span className="text-sm text-gray-600 flex items-center gap-2">
                            <Smile size={16} className="text-olive-500" />
                            Criança (abaixo de 10 anos)
                          </span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-olive-700 text-white font-bold text-lg py-4 rounded-xl hover:bg-olive-800 transition-all shadow-xl shadow-olive-200 flex items-center justify-center gap-3"
            >
              {loading ? 'Salvando...' : (
                <>
                  Salvar na Lista <div className="-rotate-12"><CheckCircle size={24} /></div>
                </>
              )}
            </button>

          </form>
        </div>
      )}

      {/* GRID DE CARDS DAS FAMÍLIAS (MANTIDO INTACTO) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {guests.map(guest => (
          <div key={guest.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-olive-300 transition-all duration-300 flex flex-col overflow-hidden group relative">

            {/* Header do Card (Convidado Principal) */}
            <div className="p-5 border-b border-gray-100 bg-gradient-to-br from-white to-gray-50">
              <div className="flex justify-between items-start mb-2">
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${guest.tipo_convidado === 'VIP' ? 'bg-amber-100 text-amber-700' :
                  guest.tipo_convidado?.includes('Noiv') ? 'bg-rose-100 text-rose-700' :
                    guest.tipo_convidado === 'Padrinho' || guest.tipo_convidado === 'Madrinha' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-600'
                  }`}>
                  {guest.tipo_convidado || 'Comum'}
                </span>

                <button
                  onClick={() => toggleConfirm(guest)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border ${guest.confirmado
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                    }`}
                >
                  {guest.confirmado ? <CheckCircle size={14} /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300"></div>}
                  {guest.confirmado ? 'Confirmado' : 'Pendente'}
                </button>
              </div>

              <h3 className="text-xl font-serif font-bold text-gray-800 leading-tight">
                {guest.nome} <span className="text-gray-600">{guest.sobrenome}</span>
              </h3>

              {guest.telefone && (
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                  <Phone size={14} className="text-olive-500" />
                  <span>{guest.telefone}</span>
                </div>
              )}
            </div>

            {/* Corpo do Card (Lista de Acompanhantes) */}
            <div className="flex-1 p-5 bg-white">
              {guest.acompanhantes_lista && guest.acompanhantes_lista.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-2">
                    <Users size={12} /> Acompanhantes ({guest.acompanhantes_lista.length})
                  </p>

                  {guest.acompanhantes_lista.map(acomp => (
                    <div key={acomp.id} className="flex justify-between items-center group/acomp p-2 hover:bg-gray-50 rounded-lg -mx-2 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${acomp.is_crianca ? 'bg-pink-100 text-pink-600' : 'bg-blue-50 text-blue-600'}`}>
                          {acomp.is_crianca ? <Baby size={16} /> : <User size={14} />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-700 leading-none">{acomp.nome}</p>
                          <p className="text-[10px] text-gray-500 mt-1">{acomp.parentesco} {acomp.is_crianca && '• Criança'}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteCompanion(acomp.id)}
                        className="text-gray-300 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-md transition-all opacity-0 group-hover/acomp:opacity-100"
                        title="Remover pessoa"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-300 py-4 gap-2 border-2 border-dashed border-gray-50 rounded-xl">
                  <User size={24} className="opacity-20" />
                  <span className="text-xs font-medium">Sem acompanhantes</span>
                </div>
              )}
            </div>

            {/* Footer do Card */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
              <span className="text-[10px] text-gray-400 font-medium">
                Cadastrado em {new Date().toLocaleDateString()}
              </span>
              <button
                onClick={() => deleteGuestGroup(guest.id)}
                className="flex items-center gap-2 text-rose-500 hover:bg-rose-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
              >
                <Trash2 size={14} /> Excluir Família
              </button>
            </div>

          </div>
        ))}
      </div>

      {guests.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <Users size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-400 font-medium">Nenhum convidado na lista ainda.</p>
          <p className="text-sm text-gray-300 mt-2">Clique em "Adicionar Manualmente" para começar.</p>
        </div>
      )}

    </div>
  );
};

export default Guests;