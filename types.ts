export interface Pagamento {
  id: string;
  gasto_id: string;
  valor_pago: number;
  data_pagamento: string; // YYYY-MM-DD
  observacao?: string;
}

// Interface que espelha a View 'progresso_gastos' do Supabase
export interface GastoView {
  id: string;
  user_id: string;
  descricao: string;
  fornecedor: string;
  valor_total_devido: number;
  total_pago: number;
  restante: number;
}

export interface Fornecedor {
  id: string;
  user_id: string;
  nome_empresa: string;
  servico: string;
  responsavel: string;
  telefone: string;
}

export interface Convidado {
  id: string;
  user_id: string;
  nome: string;
  sobrenome: string;
  lado: 'Noivo' | 'Noiva' | 'Padrinho' | 'Madrinha' | 'Comum';
  acompanhantes: number;
  confirmado: boolean;
}

export interface Musica {
  id: string;
  user_id: string;
  nome: string;
  link: string;
}

export interface Profile {
  id: string;
  nome: string;
  titulo: string;
  permissoes: string[];
  role: 'admin' | 'user';
}

export interface Convite {
  id: string;
  token: string;
  email: string;
  nome: string;
  titulo: string;
  permissoes: string[];
  used: boolean;
  created_at: string;
}

export interface EventoRoteiro {
  id: string;
  user_id: string;
  hora: string; // HH:MM
  atividade: string;
  responsavel: string;
  musica_id?: string;
  musica?: Musica; // Para join
}

export type ViewState = 'dashboard' | 'gastos' | 'fornecedores' | 'convidados' | 'roteiro' | 'musicas' | 'configuracoes';

export interface DashboardStats {
  totalBudget: number;
  totalPaid: number;
  remaining: number;
  percentagePaid: number;
}