
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import { Fornecedor } from '../types';
import { Plus, Trash2, Phone, User, Briefcase, MessageCircle, Pencil, X } from 'lucide-react';

const Vendors: React.FC = () => {
  const [vendors, setVendors] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
  const [formData, setFormData] = useState({
    nome_empresa: '',
    servico: '',
    responsavel: '',
    telefone: ''
  });

  const fetchVendors = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('fornecedores').select('*').order('nome_empresa');
    if (error) console.error(error);
    else setVendors(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      // UPDATE
      const { error } = await supabase.from('fornecedores').update({
        nome_empresa: formData.nome_empresa,
        servico: formData.servico,
        responsavel: formData.responsavel,
        telefone: formData.telefone
      }).eq('id', editingId);

      if (error) alert('Erro ao atualizar: ' + error.message);
      else {
        resetForm();
        fetchVendors();
      }
    } else {
      // INSERT
      const { error } = await supabase.from('fornecedores').insert({
        nome_empresa: formData.nome_empresa,
        servico: formData.servico,
        responsavel: formData.responsavel,
        telefone: formData.telefone
      });

      if (error) alert('Erro ao adicionar: ' + error.message);
      else {
        resetForm();
        fetchVendors();
      }
    }
  };

  const handleEdit = (vendor: Fornecedor) => {
    setEditingId(vendor.id);
    setFormData({
      nome_empresa: vendor.nome_empresa,
      servico: vendor.servico,
      responsavel: vendor.responsavel,
      telefone: vendor.telefone
    });
    setShowForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este fornecedor?')) return;
    const { error } = await supabase.from('fornecedores').delete().eq('id', id);
    if (!error) fetchVendors();
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ nome_empresa: '', servico: '', responsavel: '', telefone: '' });
  };

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return `https://wa.me/55${cleaned}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-serif font-bold text-gray-800">Fornecedores & Contatos</h2>
        <button 
          onClick={() => {
            if (showForm && !editingId) {
                setShowForm(false);
            } else {
                resetForm();
                setShowForm(true);
            }
          }}
          className="bg-olive-600 text-white px-4 py-2 rounded-xl hover:bg-olive-700 flex items-center gap-2 transition-all shadow-lg shadow-olive-200"
        >
          {showForm && !editingId ? <X size={18} /> : <Plus size={18} />} 
          {showForm && !editingId ? 'Cancelar' : 'Novo Fornecedor'}
        </button>
      </div>

      {showForm && (
        <form ref={formRef} onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 animate-slide-in grid grid-cols-1 md:grid-cols-2 gap-4 relative">
          <div className="md:col-span-2 flex justify-between items-center mb-2">
            <h3 className="font-bold text-gray-700">{editingId ? 'Editar Fornecedor' : 'Adicionar Novo'}</h3>
            {editingId && <button type="button" onClick={resetForm} className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1"><X size={14}/> Cancelar Edição</button>}
          </div>
          
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Empresa</label>
            <input required className="w-full p-2 border border-gray-200 rounded-lg outline-olive-400" value={formData.nome_empresa} onChange={e => setFormData({...formData, nome_empresa: e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Serviço</label>
            <input required className="w-full p-2 border border-gray-200 rounded-lg outline-olive-400" value={formData.servico} onChange={e => setFormData({...formData, servico: e.target.value})} placeholder="Ex: Fotografia" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Responsável</label>
            <input className="w-full p-2 border border-gray-200 rounded-lg outline-olive-400" value={formData.responsavel} onChange={e => setFormData({...formData, responsavel: e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">WhatsApp (DDD + Número)</label>
            <input required className="w-full p-2 border border-gray-200 rounded-lg outline-olive-400" value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})} placeholder="11999998888" />
          </div>
          <div className="md:col-span-2 flex justify-end gap-3 mt-2">
             <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Cancelar</button>
             <button type="submit" className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-black font-medium shadow-md">{editingId ? 'Atualizar' : 'Salvar'}</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map(v => (
          <div key={v.id} className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-xl transition-all relative group flex flex-col h-full">
            {/* Botões de Ação com Z-Index e fundo para clique garantido */}
            <div className="absolute top-4 right-4 flex gap-2 z-10">
                <button 
                  onClick={() => handleEdit(v)} 
                  className="bg-gray-50 text-gray-500 hover:text-olive-600 hover:bg-olive-50 transition-colors p-2 rounded-lg shadow-sm border border-gray-100" 
                  title="Editar"
                >
                  <Pencil size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(v.id)} 
                  className="bg-gray-50 text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors p-2 rounded-lg shadow-sm border border-gray-100" 
                  title="Excluir"
                >
                  <Trash2 size={16} />
                </button>
            </div>
            
            <div className="flex items-center gap-3 mb-4 pr-24">
              <div className="w-10 h-10 rounded-full bg-olive-50 flex items-center justify-center text-olive-600 shrink-0">
                <Briefcase size={20} />
              </div>
              <div className="overflow-hidden">
                <h3 className="font-bold text-gray-900 truncate">{v.nome_empresa}</h3>
                <p className="text-xs text-olive-600 font-semibold uppercase tracking-wide truncate">{v.servico}</p>
              </div>
            </div>

            <div className="space-y-3 mt-auto">
              <div className="flex items-center gap-3 text-gray-600 text-sm">
                <User size={16} className="shrink-0" />
                <span className="truncate">{v.responsavel || 'Não informado'}</span>
              </div>
              <a 
                href={formatPhone(v.telefone)} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-3 text-emerald-600 text-sm font-medium hover:underline p-2 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors w-full"
              >
                <MessageCircle size={16} className="shrink-0" />
                <span className="truncate">{v.telefone}</span>
              </a>
            </div>
          </div>
        ))}
        {vendors.length === 0 && !loading && <p className="text-gray-400 col-span-full text-center py-8">Nenhum fornecedor cadastrado.</p>}
      </div>
    </div>
  );
};

export default Vendors;
