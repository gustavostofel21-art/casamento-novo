import React, { useState, useEffect } from 'react';
import { GastoView } from '../types';
import { supabase } from '../services/supabaseClient';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';

interface DashboardProps {
  expenses: GastoView[];
}

const COLORS = ['#88b04b', '#adca81', '#fbbf24', '#f472b6', '#60a5fa', '#818cf8', '#a78bfa', '#f87171'];

const Dashboard: React.FC<DashboardProps> = ({ expenses }) => {
  // Data padrão inicial
  const [targetDate, setTargetDate] = useState<string>('2025-12-15T16:00');
  const [timeLeft, setTimeLeft] = useState<{months: number, days: number, hours: number}>({ months: 0, days: 0, hours: 0 });
  const [loadingDate, setLoadingDate] = useState(true);

  const totalBudget = expenses.reduce((acc, curr) => acc + curr.valor_total_devido, 0);
  const totalPaid = expenses.reduce((acc, curr) => acc + curr.total_pago, 0);
  const remaining = totalBudget - totalPaid;
  const percentGlobal = totalBudget > 0 ? (totalPaid / totalBudget) * 100 : 0;

  // AGRUPAMENTO DE DADOS PARA O GRÁFICO
  // Soma os valores de gastos com o mesmo fornecedor para evitar fatias repetidas
  const groupedData = expenses.reduce((acc, curr) => {
    if (acc[curr.fornecedor]) {
      acc[curr.fornecedor] += curr.valor_total_devido;
    } else {
      acc[curr.fornecedor] = curr.valor_total_devido;
    }
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(groupedData)
    .map(([name, value]) => ({ name, value }))
    .filter(item => item.value > 0) // Remove itens zerados
    .sort((a, b) => b.value - a.value); // Ordena do maior para o menor

  // Buscar data do Supabase
  useEffect(() => {
    const fetchDate = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('configuracao_casamento')
        .select('data_casamento')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (data?.data_casamento) {
        // Formata para o input datetime-local (YYYY-MM-DDTHH:mm)
        const dateObj = new Date(data.data_casamento);
        const formatted = dateObj.toISOString().slice(0, 16);
        setTargetDate(formatted);
      }
      setLoadingDate(false);
    };

    fetchDate();
  }, []);

  // Salvar data no Supabase quando alterada
  const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setTargetDate(newDate);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Verificar se já existe registro
    const { data: existing } = await supabase
      .from('configuracao_casamento')
      .select('id')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (existing) {
      await supabase.from('configuracao_casamento').update({ data_casamento: newDate }).eq('id', existing.id);
    } else {
      await supabase.from('configuracao_casamento').insert({ user_id: session.user.id, data_casamento: newDate });
    }
  };

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const target = new Date(targetDate);
      const diff = target.getTime() - now.getTime();

      if (diff > 0) {
        const daysTotal = Math.floor(diff / (1000 * 60 * 60 * 24));
        const months = Math.floor(daysTotal / 30.44); // Média de dias no mês
        const days = Math.floor(daysTotal % 30.44);
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        setTimeLeft({ months, days, hours });
      } else {
        setTimeLeft({ months: 0, days: 0, hours: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); // Atualiza a cada minuto
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* Contagem Regressiva */}
      <div className="bg-olive-600 rounded-2xl shadow-xl border border-olive-500 overflow-hidden relative">
         <div className="absolute top-0 right-0 p-8 opacity-10">
            <HeartPattern />
         </div>

         <div className="p-6 flex flex-col items-center justify-center text-center relative z-10">
            <h2 className="text-olive-100 font-serif text-[10px] uppercase tracking-[0.3em] mb-4">Contagem Regressiva</h2>
            
            <div className="flex items-end justify-center gap-6 md:gap-12 mb-4 w-full">
              <div className="flex flex-col items-center">
                <span className="text-4xl md:text-6xl font-serif font-bold text-white leading-none filter drop-shadow-md">
                  {timeLeft.months}
                </span>
                <span className="text-[10px] text-olive-100 font-bold uppercase tracking-widest mt-1">Meses</span>
              </div>
              
              <div className="h-10 w-px bg-olive-400/50 mb-2"></div> 
              
              <div className="flex flex-col items-center">
                <span className="text-4xl md:text-6xl font-serif font-bold text-white leading-none filter drop-shadow-md">
                  {timeLeft.days}
                </span>
                <span className="text-[10px] text-olive-100 font-bold uppercase tracking-widest mt-1">Dias</span>
              </div>
              
              <div className="h-10 w-px bg-olive-400/50 mb-2"></div> 
              
              <div className="flex flex-col items-center">
                <span className="text-4xl md:text-6xl font-serif font-bold text-white leading-none filter drop-shadow-md">
                  {timeLeft.hours}
                </span>
                <span className="text-[10px] text-olive-100 font-bold uppercase tracking-widest mt-1">Horas</span>
              </div>
            </div>

            {/* Input integrado de forma compacta */}
            <div className="flex items-center justify-center gap-2 mt-2 opacity-80 hover:opacity-100 transition-opacity">
               <Calendar size={12} className="text-olive-200" />
               <input 
                 type="datetime-local" 
                 value={targetDate} 
                 onChange={handleDateChange}
                 disabled={loadingDate}
                 className="bg-transparent text-xs text-olive-100 border-none outline-none p-0 cursor-pointer w-auto text-center font-medium focus:ring-0"
               />
            </div>
         </div>
      </div>

      {/* Progresso Geral */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100/50">
        <div className="flex justify-between items-end mb-3">
          <h3 className="font-bold text-gray-800 text-lg">Progresso Financeiro Geral</h3>
          <span className="text-olive-600 font-bold text-2xl">{Math.round(percentGlobal)}%</span>
        </div>
        <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-olive-400 to-olive-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(136,176,75,0.6)] relative"
            style={{ width: `${percentGlobal}%` }}
          >
             <div className="absolute top-0 right-0 h-full w-full bg-white opacity-20 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-olive-50 rounded-2xl text-olive-600 shadow-sm">
              <DollarSign size={24} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Contratado</p>
              <h3 className="text-2xl font-bold text-gray-900">R$ {totalBudget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600 shadow-sm">
              <TrendingUp size={24} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Pago</p>
              <h3 className="text-2xl font-bold text-emerald-600">R$ {totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md border border-rose-50 border-l-4 border-l-rose-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-rose-50 rounded-2xl text-rose-600 shadow-sm">
              <TrendingDown size={24} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Falta Pagar</p>
              <h3 className="text-2xl font-bold text-rose-600">R$ {remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Distribuição */}
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 min-h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-serif font-bold text-gray-900">Distribuição do Orçamento</h3>
            <div className="bg-olive-50 px-3 py-1 rounded-full text-xs font-bold text-olive-700">POR FORNECEDOR</div>
          </div>
          <div className="flex-1 w-full flex justify-center items-center">
             {categoryData.length > 0 ? (
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="outline-none drop-shadow-md hover:opacity-80 transition-opacity" />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.95)' }}
                        itemStyle={{ color: '#374151', fontWeight: 'bold' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
             ) : (
               <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200 w-full p-10">
                 <p className="font-medium">Sem dados suficientes para o gráfico</p>
                 <p className="text-sm opacity-60">Cadastre seus gastos na aba lateral.</p>
               </div>
             )}
          </div>
      </div>
    </div>
  );
};

const HeartPattern = () => (
  <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
)

export default Dashboard;