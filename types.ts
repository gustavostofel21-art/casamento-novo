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

export interface Acompanhante {
  id: string;
  convidado_id: string;
  nome: string;
  parentesco: string;
  is_crianca: boolean;
}

export interface Convidado {
  id: string;
  user_id: string;
  nome: string;
  sobrenome?: string; // Tornando opcional pois o novo form pede "nome completo"
  telefone?: string;
  tipo_convidado: string; // Renomeado de 'lado' para 'tipo_convidado', default 'Comum'
  acompanhantes: number; // Quantidade declarada
  confirmado: boolean;
  acompanhantes_lista?: Acompanhante[]; // Dados detalhados
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
  status?: 'active' | 'inactive';
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

export interface TimeLeft {
  months: number;
  days: number;
  hours: number;
  minutes: number;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface GuestDetail {
  name: string;
  kinship: string;
  isChild: boolean;
}

export interface FormData {
  name: string;
  guests: number;
  guestDetails: GuestDetail[];
  phone: string;
}