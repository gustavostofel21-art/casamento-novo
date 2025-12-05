import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Musica } from '../types';
import { Plus, Trash2, Music, ExternalLink, Play, Pencil, X } from 'lucide-react';

const Musics: React.FC = () => {
    const [musics, setMusics] = useState<Musica[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingMusic, setEditingMusic] = useState<Musica | null>(null);
    const [formData, setFormData] = useState({ nome: '', link: '' });
    const [playingMusic, setPlayingMusic] = useState<string | null>(null);

    const fetchMusics = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('musicas')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar músicas:', error);
        } else {
            setMusics(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchMusics();
    }, []);

    const handleOpenModal = (music?: Musica) => {
        if (music) {
            setEditingMusic(music);
            setFormData({ nome: music.nome, link: music.link });
        } else {
            setEditingMusic(null);
            setFormData({ nome: '', link: '' });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingMusic(null);
        setFormData({ nome: '', link: '' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.nome || !formData.link) return;

        if (editingMusic) {
            // Update
            const { error } = await supabase
                .from('musicas')
                .update({ nome: formData.nome, link: formData.link })
                .eq('id', editingMusic.id);

            if (error) {
                alert('Erro ao atualizar música: ' + error.message);
            } else {
                handleCloseModal();
                fetchMusics();
            }
        } else {
            // Insert
            const { error } = await supabase.from('musicas').insert({
                nome: formData.nome,
                link: formData.link
            });

            if (error) {
                alert('Erro ao adicionar música: ' + error.message);
            } else {
                handleCloseModal();
                fetchMusics();
            }
        }
    };

    const handleDeleteMusic = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta música?')) {
            const { error } = await supabase.from('musicas').delete().eq('id', id);
            if (error) {
                alert('Erro ao excluir: ' + error.message);
            } else {
                fetchMusics();
            }
        }
    };

    const getYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-serif font-bold text-gray-800">Músicas do Casamento</h2>
                    <p className="text-gray-500">Organize a trilha sonora do seu grande dia</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-olive-600 text-white px-5 py-2.5 rounded-xl hover:bg-olive-700 shadow-lg shadow-olive-200 transition-all active:scale-95 font-medium"
                >
                    <Plus size={18} />
                    Nova Música
                </button>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-scale-in relative">
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={20} />
                        </button>
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Music className="text-olive-600" /> {editingMusic ? 'Editar Música' : 'Adicionar Música'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Música</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-olive-200 outline-none transition-all"
                                    placeholder="Ex: Entrada da Noiva - Marcha Nupcial"
                                    value={formData.nome}
                                    onChange={e => setFormData({ ...formData, nome: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Link do YouTube</label>
                                <input
                                    type="url"
                                    required
                                    className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-olive-200 outline-none transition-all"
                                    placeholder="https://youtube.com/watch?v=..."
                                    value={formData.link}
                                    onChange={e => setFormData({ ...formData, link: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-olive-600 text-white font-medium rounded-xl hover:bg-olive-700 shadow-lg shadow-olive-200 transition-all"
                                >
                                    Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin h-8 w-8 border-b-2 border-olive-600 rounded-full"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {musics.map((music) => {
                        const videoId = getYoutubeId(music.link);
                        const thumbnailUrl = videoId
                            ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
                            : null;

                        return (
                            <div
                                key={music.id}
                                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-olive-200 transition-all group"
                            >
                                <div className="relative aspect-video bg-gray-100 group-hover:brightness-95 transition-all">
                                    {playingMusic === music.id && videoId ? (
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                                            title={music.nome}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        ></iframe>
                                    ) : (
                                        <>
                                            {thumbnailUrl ? (
                                                <img
                                                    src={thumbnailUrl}
                                                    alt={music.nome}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <Music size={48} />
                                                </div>
                                            )}

                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
                                                <button
                                                    onClick={() => setPlayingMusic(music.id)}
                                                    className="bg-olive-600 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transform scale-90 group-hover:scale-100 transition-all hover:bg-olive-700 hover:scale-110 border-4 border-white"
                                                >
                                                    <Play size={32} fill="currentColor" className="ml-1" />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="p-4">
                                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-1" title={music.nome}>
                                        {music.nome}
                                    </h3>
                                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
                                        <a
                                            href={music.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs font-medium text-olive-600 hover:text-olive-700 flex items-center gap-1"
                                        >
                                            <ExternalLink size={12} /> YouTube
                                        </a>

                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleOpenModal(music)}
                                                className="text-gray-400 hover:text-olive-600 hover:bg-olive-50 transition-all p-2 rounded-lg"
                                                title="Editar"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteMusic(music.id)}
                                                className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all p-2 rounded-lg"
                                                title="Excluir"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {musics.length === 0 && (
                        <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                            <div className="w-16 h-16 bg-olive-50 text-olive-300 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Music size={32} />
                            </div>
                            <p className="text-gray-500 font-medium">Nenhuma música adicionada ainda.</p>
                            <p className="text-sm text-gray-400 mt-1">Comece adicionando as músicas do seu casamento.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Musics;
