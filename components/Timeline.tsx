import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import { EventoRoteiro, Musica } from '../types';
import { Plus, Trash2, Clock, Pencil, X, Music, Play, ChevronUp } from 'lucide-react';

const Timeline: React.FC = () => {
  const [events, setEvents] = useState<EventoRoteiro[]>([]);
  const [musics, setMusics] = useState<Musica[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [playingEventId, setPlayingEventId] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState({
    hora: '',
    atividade: '',
    responsavel: '',
    musica_id: ''
  });

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('roteiro')
      .select('*, musica:musicas(*)')
      .order('hora');

    if (error) {
      console.error('Erro ao buscar eventos:', error);
    } else {
      setEvents(data || []);
    }
  };

  const fetchMusics = async () => {
    const { data } = await supabase.from('musicas').select('*').order('nome');
    setMusics(data || []);
  };

  useEffect(() => {
    fetchEvents();
    fetchMusics();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      hora: formData.hora,
      atividade: formData.atividade,
      responsavel: formData.responsavel,
      musica_id: formData.musica_id || null
    };

    if (editingId) {
      // UPDATE
      const { error } = await supabase.from('roteiro').update(payload).eq('id', editingId);

      if (error) alert('Erro ao atualizar: ' + error.message);
      else {
        resetForm();
        fetchEvents();
      }
    } else {
      // INSERT
      const { error } = await supabase.from('roteiro').insert(payload);

      if (error) alert('Erro ao adicionar: ' + error.message);
      else {
        resetForm();
        fetchEvents();
      }
    }
  };

  const handleEdit = (evt: EventoRoteiro) => {
    setEditingId(evt.id);
    setFormData({
      hora: evt.hora,
      atividade: evt.atividade,
      responsavel: evt.responsavel,
      musica_id: evt.musica_id || ''
    });
    setShowForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const deleteEvent = async (id: string) => {
    if (confirm('Remover evento?')) {
      await supabase.from('roteiro').delete().eq('id', id);
      fetchEvents();
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ hora: '', atividade: '', responsavel: '', musica_id: '' });
  };

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const toggleMusic = (eventId: string) => {
    if (playingEventId === eventId) {
      setPlayingEventId(null);
    } else {
      setPlayingEventId(eventId);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-serif font-bold text-gray-800">Cronograma do Dia</h2>
        <button
          onClick={() => {
            if (showForm && !editingId) setShowForm(false);
            else { resetForm(); setShowForm(true); }
          }}
          className="bg-olive-600 text-white px-4 py-2 rounded-xl hover:bg-olive-700 shadow-lg shadow-olive-200 flex gap-2 items-center"
        >
          {showForm && !editingId ? <X size={18} /> : <Plus size={18} />}
          {showForm && !editingId ? 'Cancelar' : 'Add Evento'}
        </button>
      </div>

      {showForm && (
        <form ref={formRef} onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col gap-4 mb-8 animate-slide-in relative">
          <div className="flex justify-between items-center md:hidden">
            <span className="font-bold text-gray-700">{editingId ? 'Editar Evento' : 'Novo Evento'}</span>
            {editingId && <button type="button" onClick={resetForm}><X size={16} /></button>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-500">Hora</label>
              <input type="time" required className="w-full p-2 border rounded-lg focus:outline-olive-500" value={formData.hora} onChange={e => setFormData({ ...formData, hora: e.target.value })} />
            </div>
            <div className="md:col-span-4">
              <label className="text-xs font-bold text-gray-500">Atividade</label>
              <input required className="w-full p-2 border rounded-lg focus:outline-olive-500" value={formData.atividade} onChange={e => setFormData({ ...formData, atividade: e.target.value })} placeholder="Ex: Entrada da Noiva" />
            </div>
            <div className="md:col-span-3">
              <label className="text-xs font-bold text-gray-500">Responsável</label>
              <input className="w-full p-2 border rounded-lg focus:outline-olive-500" value={formData.responsavel} onChange={e => setFormData({ ...formData, responsavel: e.target.value })} placeholder="Ex: Cerimonialista" />
            </div>
            <div className="md:col-span-3">
              <label className="text-xs font-bold text-gray-500">Música (Opcional)</label>
              <select
                className="w-full p-2 border rounded-lg focus:outline-olive-500 bg-white"
                value={formData.musica_id}
                onChange={e => setFormData({ ...formData, musica_id: e.target.value })}
              >
                <option value="">Selecione...</option>
                {musics.map(m => (
                  <option key={m.id} value={m.id}>{m.nome}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-12 flex gap-2 justify-end mt-2">
              {editingId && (
                <button type="button" onClick={resetForm} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200">
                  Cancelar
                </button>
              )}
              <button type="submit" className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-black font-medium shadow-md">
                {editingId ? 'Salvar' : 'Adicionar'}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="relative border-l-2 border-olive-200 ml-4 md:ml-6 space-y-8 pb-8">
        {events.map((evt) => (
          <div key={evt.id} className="relative pl-8 md:pl-12 group">
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-olive-500 border-4 border-white shadow-sm"></div>

            <div className="flex flex-col md:flex-row gap-2 md:gap-8 items-start group-hover:-translate-y-1 transition-transform duration-300">
              <div className="bg-olive-50 text-olive-700 font-bold px-3 py-1 rounded-lg text-sm flex items-center gap-2 min-w-[90px] justify-center shadow-sm">
                <Clock size={14} /> {evt.hora.slice(0, 5)}
              </div>

              <div className={`flex-1 bg-white p-4 rounded-xl border border-gray-100 shadow-sm w-full relative pr-20 transition-all duration-500 ${playingEventId === evt.id ? 'ring-2 ring-olive-200 shadow-lg' : ''}`}>
                {/* Botões de Ação com Z-Index e fundo */}
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                  <button
                    onClick={() => handleEdit(evt)}
                    className="bg-gray-50 text-gray-500 hover:text-olive-600 hover:bg-olive-50 transition-colors p-2 rounded-lg shadow-sm border border-gray-100"
                    title="Editar"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => deleteEvent(evt.id)}
                    className="bg-gray-50 text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors p-2 rounded-lg shadow-sm border border-gray-100"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <h3 className="font-bold text-gray-900 text-lg">{evt.atividade}</h3>

                <div className="flex flex-col gap-1 mt-2">
                  {evt.responsavel && (
                    <p className="text-sm text-gray-500">
                      Responsável: <span className="font-medium text-olive-600">{evt.responsavel}</span>
                    </p>
                  )}

                  {evt.musica && (
                    <div className="w-full">
                      <button
                        onClick={() => toggleMusic(evt.id)}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all w-full md:w-auto group/btn ${playingEventId === evt.id
                          ? 'bg-olive-600 text-white border-olive-600 shadow-md'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-olive-300 hover:bg-olive-50'
                          }`}
                      >
                        <div className={`p-1.5 rounded-full ${playingEventId === evt.id ? 'bg-white/20' : 'bg-olive-100 text-olive-600'}`}>
                          {playingEventId === evt.id ? <ChevronUp size={16} /> : <Play size={16} fill="currentColor" />}
                        </div>
                        <div className="flex flex-col items-start text-left">
                          <span className="text-xs font-normal opacity-80">Música Selecionada</span>
                          <span className="font-bold text-sm line-clamp-1">{evt.musica.nome}</span>
                        </div>
                      </button>

                      {/* Video Player Expandido */}
                      {playingEventId === evt.id && evt.musica.link && (
                        <div className="mt-4 rounded-xl overflow-hidden shadow-inner bg-black animate-slide-down">
                          <div className="aspect-video w-full">
                            <iframe
                              width="100%"
                              height="100%"
                              src={`https://www.youtube.com/embed/${getYoutubeId(evt.musica.link)}?autoplay=1`}
                              title={evt.musica.nome}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {events.length === 0 && <div className="pl-8 text-gray-400">Nenhum evento no roteiro.</div>}
      </div>
    </div>
  );
};

export default Timeline;
