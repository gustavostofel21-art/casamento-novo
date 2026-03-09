import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Presente, PresenteRecebido } from '../types';
import toast, { Toaster } from 'react-hot-toast';
import { Gift, Edit3, Trash2, Plus, MessageSquare, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

const PresentesAdmin: React.FC = () => {
    const [presentes, setPresentes] = useState<Presente[]>([]);
    const [recebidos, setRecebidos] = useState<PresenteRecebido[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        id: '',
        titulo: '',
        descricao: '',
        valor: '',
        imagem_url: '',
    });

    const fetchDados = async () => {
        setLoading(true);
        // Busca presentes
        const { data: pData, error: pError } = await supabase
            .from('presentes')
            .select('*')
            .order('created_at', { ascending: false });

        if (pData) setPresentes(pData);
        if (pError) toast.error('Erro ao buscar presentes');

        // Busca recebidos com JOIN no presente
        const { data: rData, error: rError } = await supabase
            .from('presentes_recebidos')
            .select('*, presente:presentes(*)')
            .order('created_at', { ascending: false });

        if (rData) setRecebidos(rData as any[]);
        if (rError) toast.error('Erro ao buscar recebimentos');

        setLoading(false);
    };

    useEffect(() => {
        fetchDados();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            titulo: formData.titulo,
            descricao: formData.descricao,
            valor: Number(String(formData.valor).replace(/\./g, '').replace(',', '.')),
            imagem_url: formData.imagem_url || null
        };

        if (formData.id) {
            // Update
            const { error } = await supabase.from('presentes').update(payload).eq('id', formData.id);
            if (error) { toast.error('Erro ao atualizar presente'); }
            else { toast.success('Presente atualizado!'); }
        } else {
            // Insert
            const { error } = await supabase.from('presentes').insert(payload);
            if (error) { toast.error('Erro ao criar presente'); }
            else { toast.success('Presente criado com sucesso!'); }
        }

        setFormData({ id: '', titulo: '', descricao: '', valor: '', imagem_url: '' });
        setShowForm(false);
        fetchDados();
    };

    const handleEdit = (p: Presente) => {
        setFormData({
            id: p.id,
            titulo: p.titulo,
            descricao: p.descricao || '',
            valor: Number(p.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            imagem_url: p.imagem_url || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Excluir este presente? O histórico de quem já pagou será mantido sem vincular a ele.')) return;

        const { error } = await supabase.from('presentes').delete().eq('id', id);
        if (error) toast.error('Erro ao excluir');
        else {
            toast.success('Excluído');
            fetchDados();
        }
    };

    const totalArrecadado = recebidos
        .filter(r => r.status === 'pago')
        .reduce((acc, curr) => acc + Number(curr.valor_pago), 0);

    if (loading) {
        return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-b-2 border-olive-600 rounded-full"></div></div>;
    }

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-20">
            <Toaster position="top-right" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Gift className="text-olive-600" /> Administração de Presentes
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Gerencie a lista de presentes e veja quem contribuiu.</p>
                </div>
                <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flexitems-center gap-4">
                    <div>
                        <p className="text-xs text-olive-600 font-bold uppercase tracking-wider">Total Arrecadado</p>
                        <p className="text-2xl font-bold text-gray-900">R$ {totalArrecadado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                </div>
            </div>

            {/* TABELA DE CONTRIBUIÇÕES RECEBIDAS */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <CheckCircle className="text-olive-600" size={20} /> Histórico de Presentes Recebidos
                </h3>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-olive-50/50 text-olive-800 text-xs uppercase font-bold">
                            <tr>
                                <th className="px-4 py-3 rounded-l-xl">Doador</th>
                                <th className="px-4 py-3">Presente Escolhido</th>
                                <th className="px-4 py-3">Valor Pago</th>
                                <th className="px-4 py-3">Data</th>
                                <th className="px-4 py-3 rounded-r-xl">Mensagem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {recebidos.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-400">Nenhum presente recebido ainda.</td>
                                </tr>
                            ) : (
                                recebidos.map((r) => (
                                    <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-4 font-medium text-gray-900">{r.nome_doador}</td>
                                        <td className="px-4 py-4 text-gray-600">
                                            {r.presente ? r.presente.titulo : <span className="text-red-400 italic">Presente excluído/sem vínculo</span>}
                                        </td>
                                        <td className="px-4 py-4 font-bold text-olive-700">R$ {Number(r.valor_pago).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                        <td className="px-4 py-4 text-gray-500 text-xs">
                                            {new Date(r.created_at || '').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-4 py-4 text-gray-600 max-w-xs truncate" title={r.mensagem}>
                                            {r.mensagem ? (
                                                <div className="flex items-start gap-2 text-xs bg-gray-100 p-2 rounded-lg italic">
                                                    <MessageSquare size={14} className="mt-0.5 text-gray-400 shrink-0" /> "{r.mensagem}"
                                                </div>
                                            ) : '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <hr className="border-gray-100" />

            {/* SEÇÃO DE CADASTRO DE PRESENTES */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Catálogo de Presentes no Site</h3>
                <button
                    onClick={() => {
                        setFormData({ id: '', titulo: '', descricao: '', valor: '', imagem_url: '' });
                        setShowForm(!showForm);
                    }}
                    className="flex items-center gap-2 bg-olive-600 text-white px-5 py-2 rounded-xl hover:bg-olive-700 transition"
                >
                    {showForm ? 'Fechar Formulário' : 'Novo Presente no Site'} {showForm ? <ChevronUp size={18} /> : <Plus size={18} />}
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 animate-slide-in">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Título Engraçado / Produto</label>
                                <input required className="w-full mt-1 p-3 border rounded-xl bg-gray-50 focus:bg-white outline-olive-500"
                                    value={formData.titulo} onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                                    placeholder="Ex: Ajude o noivo a matar a hpilory" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Valor (R$)</label>
                                <input type="text" required className="w-full mt-1 p-3 border rounded-xl bg-gray-50 focus:bg-white outline-olive-500"
                                    value={formData.valor}
                                    onChange={e => {
                                        let digits = e.target.value.replace(/\D/g, '');
                                        if (digits === '') {
                                            setFormData({ ...formData, valor: '' });
                                            return;
                                        }
                                        const amount = Number(digits) / 100;
                                        const formatted = amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                                        setFormData({ ...formData, valor: formatted });
                                    }}
                                    placeholder="Ex: 50,00" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">URL da Imagem (Opcional)</label>
                                <input className="w-full mt-1 p-3 border rounded-xl bg-gray-50 focus:bg-white outline-olive-500"
                                    value={formData.imagem_url} onChange={e => setFormData({ ...formData, imagem_url: e.target.value })}
                                    placeholder="https://suaimagem.com/foto.jpg" />
                            </div>
                        </div>
                        <div className="space-y-4 flex flex-col justify-between">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Descrição Opcional</label>
                                <textarea className="w-full mt-1 p-3 border rounded-xl bg-gray-50 focus:bg-white outline-olive-500 min-h-[120px]"
                                    value={formData.descricao} onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                                    placeholder="Uma breve explicação para os convidados darem risada..." />
                            </div>
                            <div className="text-right">
                                <button type="submit" className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black w-full md:w-auto">
                                    {formData.id ? 'Salvar Alterações' : 'Cadastrar Presente'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {presentes.map(p => (
                    <div key={p.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all group flex flex-col">
                        <div className="h-40 bg-olive-50 flex items-center justify-center relative">
                            {p.imagem_url ? (
                                <img src={p.imagem_url} alt={p.titulo} className="w-full h-full object-cover" />
                            ) : (
                                <Gift className="text-olive-200" size={48} />
                            )}
                            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(p)} className="p-2 bg-white rounded-lg shadow text-olive-600 hover:text-olive-800"><Edit3 size={16} /></button>
                                <button onClick={() => handleDelete(p.id)} className="p-2 bg-white rounded-lg shadow text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                            </div>
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                            <h4 className="font-bold text-lg text-gray-900 line-clamp-2 leading-tight">{p.titulo}</h4>
                            <p className="text-sm text-gray-500 line-clamp-2 mt-2">{p.descricao || 'Sem descrição'}</p>
                            <div className="mt-auto pt-4 flex items-center justify-between">
                                <span className="font-bold text-olive-700 text-xl">R$ {Number(p.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                <span className={`text-xs px-2 py-1 rounded-full font-bold ${p.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {p.ativo ? 'Ativo no Site' : 'Pausado'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {presentes.length === 0 && (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <Gift className="mx-auto text-gray-300 mb-4" size={48} />
                    <p className="text-gray-500">Nenhum presente cadastrado no catálogo.</p>
                </div>
            )}
        </div>
    );
};

export default PresentesAdmin;
