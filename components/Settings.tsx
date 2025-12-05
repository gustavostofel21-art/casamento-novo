import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Convite, Profile } from '../types';
import { Plus, Copy, Check, Trash2, UserPlus, Shield, Mail } from 'lucide-react';

const Settings: React.FC = () => {
    const [invites, setInvites] = useState<Convite[]>([]);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [showInviteForm, setShowInviteForm] = useState(false);
    const [copiedToken, setCopiedToken] = useState<string | null>(null);

    const [newInvite, setNewInvite] = useState({
        email: '',
        nome: '',
        titulo: 'Padrinho',
        permissoes: ['roteiro', 'musicas'] as string[]
    });

    const availableTabs = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'gastos', label: 'Gastos' },
        { id: 'fornecedores', label: 'Fornecedores' },
        { id: 'convidados', label: 'Lista de Convidados' },
        { id: 'roteiro', label: 'Roteiro' },
        { id: 'musicas', label: 'Músicas' }
    ];

    const titulos = ['Noivo', 'Noiva', 'Padrinho', 'Madrinha', 'Cerimonialista', 'Pai/Mãe', 'Outro'];

    const fetchData = async () => {
        setLoading(true);
        const { data: invitesData } = await supabase.from('convites').select('*').order('created_at', { ascending: false });
        const { data: profilesData } = await supabase.from('profiles').select('*');

        setInvites(invitesData || []);
        setProfiles(profilesData || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateInvite = async (e: React.FormEvent) => {
        e.preventDefault();

        const { data, error } = await supabase.from('convites').insert({
            email: newInvite.email,
            nome: newInvite.nome,
            titulo: newInvite.titulo,
            permissoes: newInvite.permissoes
        }).select();

        if (error) {
            alert('Erro ao criar convite: ' + error.message);
        } else {
            setNewInvite({
                email: '',
                nome: '',
                titulo: 'Padrinho',
                permissoes: ['roteiro', 'musicas']
            });
            setShowInviteForm(false);
            fetchData();
        }
    };

    const deleteInvite = async (id: string) => {
        if (confirm('Cancelar este convite?')) {
            await supabase.from('convites').delete().eq('id', id);
            fetchData();
        }
    };

    const copyLink = (token: string) => {
        const link = `${window.location.origin}/?invite=${token}`;
        navigator.clipboard.writeText(link);
        setCopiedToken(token);
        setTimeout(() => setCopiedToken(null), 2000);
    };

    const togglePermission = (tabId: string) => {
        setNewInvite(prev => {
            const exists = prev.permissoes.includes(tabId);
            if (exists) return { ...prev, permissoes: prev.permissoes.filter(p => p !== tabId) };
            return { ...prev, permissoes: [...prev.permissoes, tabId] };
        });
    };

    return (
        <div className="animate-fade-in space-y-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-serif font-bold text-gray-800">Configurações & Equipe</h2>
                    <p className="text-gray-500">Gerencie quem tem acesso ao planejamento do casamento</p>
                </div>
                <button
                    onClick={() => setShowInviteForm(true)}
                    className="flex items-center gap-2 bg-olive-600 text-white px-5 py-2.5 rounded-xl hover:bg-olive-700 shadow-lg shadow-olive-200 transition-all active:scale-95 font-medium"
                >
                    <UserPlus size={18} />
                    Novo Convite
                </button>
            </div>

            {showInviteForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl animate-scale-in">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Mail className="text-olive-600" /> Enviar Convite de Acesso
                        </h3>

                        <form onSubmit={handleCreateInvite} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Nome da Pessoa</label>
                                    <input
                                        required
                                        className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-olive-200 outline-none"
                                        value={newInvite.nome}
                                        onChange={e => setNewInvite({ ...newInvite, nome: e.target.value })}
                                        placeholder="Ex: Maria Silva"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">E-mail</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-olive-200 outline-none"
                                        value={newInvite.email}
                                        onChange={e => setNewInvite({ ...newInvite, email: e.target.value })}
                                        placeholder="maria@email.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Título / Função</label>
                                    <select
                                        className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-olive-200 outline-none"
                                        value={newInvite.titulo}
                                        onChange={e => setNewInvite({ ...newInvite, titulo: e.target.value })}
                                    >
                                        {titulos.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3">Permissões de Acesso</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {availableTabs.map(tab => (
                                        <label key={tab.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${newInvite.permissoes.includes(tab.id) ? 'bg-olive-50 border-olive-200 text-olive-800' : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'}`}>
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-olive-600 rounded focus:ring-olive-500"
                                                checked={newInvite.permissoes.includes(tab.id)}
                                                onChange={() => togglePermission(tab.id)}
                                            />
                                            <span className="font-medium text-sm">{tab.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowInviteForm(false)}
                                    className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-olive-600 text-white font-medium rounded-xl hover:bg-olive-700 shadow-lg shadow-olive-200 transition-all"
                                >
                                    Gerar Convite
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Convites Pendentes */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Mail size={20} className="text-olive-500" /> Convites Pendentes
                    </h3>

                    <div className="space-y-4">
                        {invites.filter(i => !i.used).map(invite => (
                            <div key={invite.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-gray-900">{invite.nome}</h4>
                                        <p className="text-sm text-gray-500">{invite.titulo} • {invite.email}</p>
                                    </div>
                                    <button onClick={() => deleteInvite(invite.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={16} /></button>
                                </div>

                                <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200">
                                    <code className="text-xs text-gray-500 flex-1 truncate">
                                        {window.location.origin}/?invite={invite.token}
                                    </code>
                                    <button
                                        onClick={() => copyLink(invite.token)}
                                        className={`p-2 rounded-lg transition-colors ${copiedToken === invite.token ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                        title="Copiar Link"
                                    >
                                        {copiedToken === invite.token ? <Check size={16} /> : <Copy size={16} />}
                                    </button>
                                </div>

                                <div className="flex gap-2 flex-wrap">
                                    {invite.permissoes.map(p => (
                                        <span key={p} className="text-[10px] uppercase tracking-wider font-bold bg-olive-100 text-olive-700 px-2 py-1 rounded-md">
                                            {p}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {invites.filter(i => !i.used).length === 0 && (
                            <p className="text-center text-gray-400 py-8">Nenhum convite pendente.</p>
                        )}
                    </div>
                </div>

                {/* Equipe Ativa */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Shield size={20} className="text-olive-500" /> Equipe Ativa
                    </h3>

                    <div className="space-y-4">
                        {profiles.map(profile => (
                            <div key={profile.id} className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 hover:border-olive-200 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-olive-100 flex items-center justify-center text-olive-700 font-bold">
                                    {profile.nome.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900">{profile.nome}</h4>
                                    <p className="text-sm text-gray-500">{profile.titulo} • <span className="capitalize">{profile.role}</span></p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-gray-400 block">{profile.permissoes.length} acessos</span>
                                </div>
                            </div>
                        ))}
                        {profiles.length === 0 && (
                            <p className="text-center text-gray-400 py-8">Nenhum usuário ativo encontrado.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
