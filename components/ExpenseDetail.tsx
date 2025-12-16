import React, { useState, useEffect } from 'react';
import { GastoView, Pagamento } from '../types';
import { X, Plus, DollarSign, FileText, Trash2, Edit2, Check } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface ExpenseDetailProps {
  expense: GastoView;
  onClose: () => void;
  onUpdate: () => void;
}

const ExpenseDetail: React.FC<ExpenseDetailProps> = ({ expense, onClose, onUpdate }) => {
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [payments, setPayments] = useState<Pagamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPayment, setNewPayment] = useState<Partial<Pagamento>>({
    valor_pago: 0,
    data_pagamento: new Date().toISOString().split('T')[0],
    observacao: ''
  });

  // Estado para edição do valor total
  const [isEditingTotal, setIsEditingTotal] = useState(false);
  const [newTotalValue, setNewTotalValue] = useState(expense.valor_total_devido);

  const fetchPayments = async () => {
    setLoading(true);
    const { data } = await supabase.from('pagamentos').select('*').eq('gasto_id', expense.id).order('data_pagamento', { ascending: false });
    setPayments(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchPayments(); }, [expense.id]);

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayment.valor_pago) return;

    const { error } = await supabase.from('pagamentos').insert({
      gasto_id: expense.id,
      valor_pago: Number(newPayment.valor_pago),
      data_pagamento: newPayment.data_pagamento,
      observacao: newPayment.observacao
    });

    if (error) alert('Erro: ' + error.message);
    else {
      setShowAddPayment(false);
      setNewPayment({ valor_pago: 0, data_pagamento: new Date().toISOString().split('T')[0], observacao: '' });
      fetchPayments();
      onUpdate();
    }
  };

  const handleDeletePayment = async (id: string) => {
    if (!confirm('Excluir parcela?')) return;
    const { error } = await supabase.from('pagamentos').delete().eq('id', id);
    if (!error) { fetchPayments(); onUpdate(); }
  };

  const handleUpdateTotal = async () => {
    if (newTotalValue < 0) return;

    const { error } = await supabase
      .from('gastos')
      .update({ valor_total_devido: newTotalValue })
      .eq('id', expense.id);

    if (error) {
      alert('Erro ao atualizar valor total: ' + error.message);
    } else {
      setIsEditingTotal(false);
      // Atualiza os dados locais/pai
      onUpdate();
      // Atualiza o objeto expense localmente para refletir na UI imediatamente se o onUpdate demorar
      expense.valor_total_devido = newTotalValue;
      expense.restante = newTotalValue - expense.total_pago;
    }
  };

  const percentPaid = Math.min(100, (expense.total_pago / expense.valor_total_devido) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">

        <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-olive-50">
          <div>
            <h2 className="text-2xl font-serif font-bold text-gray-900">{expense.fornecedor}</h2>
            <p className="text-olive-700 opacity-80">{expense.descricao}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors shadow-sm">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 relative group">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Devido</span>
              {isEditingTotal ? (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    value={newTotalValue}
                    onChange={(e) => setNewTotalValue(Number(e.target.value))}
                    className="w-full p-1 text-sm border border-gray-300 rounded focus:border-olive-500 focus:outline-none"
                    autoFocus
                  />
                  <button onClick={handleUpdateTotal} className="p-1 bg-olive-100 text-olive-700 rounded hover:bg-olive-200" title="Salvar">
                    <Check size={16} />
                  </button>
                  <button onClick={() => setIsEditingTotal(false)} className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200" title="Cancelar">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between mt-1">
                  <div className="text-xl font-bold text-slate-900">R$ {expense.valor_total_devido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                  <button
                    onClick={() => { setNewTotalValue(expense.valor_total_devido); setIsEditingTotal(true); }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-olive-600 hover:bg-white rounded-full transition-all"
                    title="Editar valor total"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              )}
            </div>
            <div className="bg-olive-50 p-4 rounded-xl border border-olive-100">
              <span className="text-xs font-bold uppercase tracking-wider text-olive-600">Pago</span>
              <div className="text-xl font-bold text-olive-700 mt-1">R$ {expense.total_pago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Restante</span>
              <div className="text-xl font-bold text-rose-700 mt-1">R$ {expense.restante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2 text-gray-600"><span>Progresso</span><span className="font-bold">{Math.round(percentPaid)}%</span></div>
            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-olive-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${percentPaid}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><FileText size={18} className="text-olive-600" /> Histórico</h3>
              <button onClick={() => setShowAddPayment(!showAddPayment)} className="text-sm bg-olive-100 text-olive-800 px-3 py-1.5 rounded-lg hover:bg-olive-200 font-bold transition-colors flex items-center gap-1">
                {showAddPayment ? <X size={14} /> : <Plus size={14} />} {showAddPayment ? 'Cancelar' : 'Add Parcela'}
              </button>
            </div>

            {showAddPayment && (
              <form onSubmit={handleAddPayment} className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200 animate-fade-in-down grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-gray-500">Valor (R$)</label><input type="number" required min="0" step="0.01" value={newPayment.valor_pago} onChange={(e) => setNewPayment({ ...newPayment, valor_pago: Number(e.target.value) })} className="w-full p-2 rounded-lg border border-gray-300" /></div>
                <div><label className="text-xs font-bold text-gray-500">Data</label><input type="date" required value={newPayment.data_pagamento} onChange={(e) => setNewPayment({ ...newPayment, data_pagamento: e.target.value })} className="w-full p-2 rounded-lg border border-gray-300" /></div>
                <div className="md:col-span-2"><label className="text-xs font-bold text-gray-500">Obs</label><input type="text" value={newPayment.observacao} onChange={(e) => setNewPayment({ ...newPayment, observacao: e.target.value })} className="w-full p-2 rounded-lg border border-gray-300" placeholder="Ex: Entrada" /></div>
                <div className="md:col-span-2 flex justify-end"><button type="submit" className="bg-olive-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Registrar</button></div>
              </form>
            )}

            <div className="space-y-3">
              {payments.map((p) => (
                <div key={p.id} className="group flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-olive-100 flex items-center justify-center text-olive-700 font-bold"><DollarSign size={18} /></div>
                    <div>
                      <div className="font-bold text-gray-900">R$ {p.valor_pago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                      <div className="text-xs text-gray-500">{p.observacao || 'Pagamento'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm font-medium text-gray-600">{new Date(p.data_pagamento + 'T00:00:00').toLocaleDateString('pt-BR')}</div>
                    <button onClick={() => handleDeletePayment(p.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
              {payments.length === 0 && !loading && <p className="text-center text-gray-400 py-4 text-sm">Nenhum pagamento registrado.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseDetail;