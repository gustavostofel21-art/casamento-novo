
import React from 'react';
import { X, Copy, Check } from 'lucide-react';

export const SQL_COMMANDS = `
-- =================================================================
-- SETUP COMPLETO DO WEDDING PLANNER
-- Copie e cole no SQL Editor do Supabase para criar todas as tabelas
-- IMPORTANTE: Certifique-se de que o tradutor do navegador está DESLIGADO.
-- =================================================================

-- 1. TABELA: GASTOS
CREATE TABLE IF NOT EXISTS public.gastos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL DEFAULT auth.uid(),
  descricao text NOT NULL,
  valor_total_devido numeric(10, 2) NOT NULL,
  fornecedor text NOT NULL,
  data_contrato date NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.gastos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gerenciar meus gastos" ON public.gastos FOR ALL USING (auth.uid() = user_id);

-- 2. TABELA: PAGAMENTOS
CREATE TABLE IF NOT EXISTS public.pagamentos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  gasto_id uuid REFERENCES public.gastos(id) ON DELETE CASCADE NOT NULL,
  valor_pago numeric(10, 2) NOT NULL,
  data_pagamento date NOT NULL,
  observacao text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gerenciar meus pagamentos" ON public.pagamentos FOR ALL USING (
  EXISTS (SELECT 1 FROM public.gastos WHERE public.gastos.id = gasto_id AND public.gastos.user_id = auth.uid())
);

-- 3. VIEW: PROGRESSO_GASTOS (Essencial para o Dashboard)
CREATE OR REPLACE VIEW public.progresso_gastos 
WITH (security_invoker = true)
AS
SELECT 
  g.id,
  g.user_id,
  g.fornecedor,
  g.descricao,
  g.valor_total_devido,
  COALESCE(SUM(p.valor_pago), 0) as total_pago,
  (g.valor_total_devido - COALESCE(SUM(p.valor_pago), 0)) as restante
FROM public.gastos g
LEFT JOIN public.pagamentos p ON g.id = p.gasto_id
GROUP BY g.id;

-- 4. TABELA: FORNECEDORES
CREATE TABLE IF NOT EXISTS public.fornecedores (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL DEFAULT auth.uid(),
  nome_empresa text NOT NULL,
  servico text NOT NULL,
  responsavel text,
  telefone text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gerenciar meus fornecedores" ON public.fornecedores FOR ALL USING (auth.uid() = user_id);

-- 5. TABELA: CONVIDADOS
CREATE TABLE IF NOT EXISTS public.convidados (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL DEFAULT auth.uid(),
  nome text NOT NULL,
  sobrenome text NOT NULL,
  lado text CHECK (lado IN ('Noivo', 'Noiva', 'Padrinho', 'Madrinha', 'Comum')),
  acompanhantes int DEFAULT 0,
  confirmado boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.convidados ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gerenciar meus convidados" ON public.convidados FOR ALL USING (auth.uid() = user_id);

-- 6. TABELA: ROTEIRO
CREATE TABLE IF NOT EXISTS public.roteiro (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL DEFAULT auth.uid(),
  hora time NOT NULL,
  atividade text NOT NULL,
  responsavel text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.roteiro ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gerenciar meu roteiro" ON public.roteiro FOR ALL USING (auth.uid() = user_id);

-- 7. TABELA: CONFIGURAÇÃO (DATA DO CASAMENTO)
CREATE TABLE IF NOT EXISTS public.configuracao_casamento (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL DEFAULT auth.uid(),
  data_casamento timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.configuracao_casamento ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Minha Config" ON public.configuracao_casamento FOR ALL USING (auth.uid() = user_id);
`;

interface SqlSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SqlSetupModal: React.FC<SqlSetupModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SQL_COMMANDS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-fade-in-up">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-olive-50">
          <div>
            <h2 className="text-2xl font-serif font-bold text-gray-900">Configuração do Banco de Dados</h2>
            <p className="text-sm text-gray-500 mt-1">Copie e execute estes comandos no SQL Editor do seu Supabase para habilitar todas as funções.</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-0 bg-slate-900">
          <pre className="p-6 text-sm font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap">
            {SQL_COMMANDS}
          </pre>
        </div>

        <div className="p-6 border-t border-gray-100 bg-white flex justify-end">
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all ${
              copied ? 'bg-green-600' : 'bg-olive-600 hover:bg-olive-700'
            }`}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? 'Copiado!' : 'Copiar SQL'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SqlSetupModal;
