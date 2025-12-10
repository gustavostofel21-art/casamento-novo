
import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import { GastoView, ViewState, Profile } from './types';
import Dashboard from './components/Dashboard';
import ExpenseDetail from './components/ExpenseDetail';
import SqlSetupModal from './components/SqlSetupModal';
import Vendors from './components/Vendors';
import Guests from './components/Guests';
import Timeline from './components/Timeline';
import Musics from './components/Musics';
import Settings from './components/Settings';
import InviteLanding from './components/InviteLanding';
import Auth from './components/Auth';
import LandingPage from './components/LandingPage';
import {
  Heart,
  LayoutDashboard,
  Wallet,
  Plus,
  Database,
  Trash2,
  LogOut,
  Users,
  Briefcase,
  CalendarClock,
  Music,
  Settings as SettingsIcon,
  Menu,
  X
} from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [view, setView] = useState<ViewState>('dashboard');
  const [expenses, setExpenses] = useState<GastoView[]>([]);
  const [selectedExpense, setSelectedExpense] = useState<GastoView | null>(null);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false); // Controls visibility of login screen

  // Verifica se é um acesso via link de convite
  const [inviteToken, setInviteToken] = useState<string | null>(null);

  // Estado para formulário de novos gastos
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({
    fornecedor: '',
    descricao: '',
    valor_total_devido: '',
    data_contrato: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    // Checa URL por token de convite
    const params = new URLSearchParams(window.location.search);
    const token = params.get('invite');
    if (token) {
      // Se tiver token, faz logout preventivo para garantir que o cadastro seja limpo
      supabase.auth.signOut().then(() => {
        setSession(null);
        setUserProfile(null);
        setInviteToken(token);
        setLoading(false);
      });
      return;
    }

    // Verifica sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
      else setLoading(false);
    }).catch(err => {
      console.error("Erro ao verificar sessão:", err);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchUserProfile(session.user.id);
        setShowAuth(false); // Esconde login ao autenticar
      } else {
        setUserProfile(null); // Limpa o perfil ao deslogar
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      if (data.status === 'inactive') {
        await supabase.auth.signOut();
        alert('Seu acesso foi desativado pelo administrador.');
        setSession(null);
        return;
      }
      setUserProfile(data);
    } else {
      // REDE DE SEGURANÇA:
      // Se não tem perfil, verificamos se é um usuário convidado que ficou "preso" (tem token nos metadados mas sem perfil)
      const { data: { session } } = await supabase.auth.getSession();
      const inviteToken = session?.user?.user_metadata?.invite_token;

      if (inviteToken) {
        console.log("Tentando recuperar perfil via token de convite...", inviteToken);
        // Tenta criar o perfil usando o token salvo nos metadados
        const { error: rpcError } = await supabase.rpc('register_profile_from_invite', {
          invite_token: inviteToken
        });

        if (!rpcError) {
          // Se deu certo, busca o perfil novamente
          const { data: newData } = await supabase.from('profiles').select('*').eq('id', userId).single();
          if (newData) {
            setUserProfile(newData);
            setLoading(false);
            return;
          }
        } else {
          console.error("Erro ao tentar recuperar perfil:", rpcError);
        }
      }

      // Se não for convite (ou falhar), tenta reivindicar acesso de proprietário (primeiro usuário)
      const { data: claimed } = await supabase.rpc('claim_owner_access');

      if (claimed) {
        const { data: newData } = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (newData) setUserProfile(newData);
      } else {
        setUserProfile(null);
      }
    }
    setLoading(false);
  };

  const fetchExpenses = async () => {
    if (!session) return;
    const { data, error } = await supabase.from('progresso_gastos').select('*').order('id', { ascending: false });
    if (!error) setExpenses(data || []);
  };

  useEffect(() => {
    if (session) fetchExpenses();
  }, [session, view]);

  // Atualiza detalhe se houver mudança externa (ex: pagamento adicionado)
  useEffect(() => {
    if (selectedExpense) {
      const updated = expenses.find(e => e.id === selectedExpense.id);
      if (updated) setSelectedExpense(updated);
    }
  }, [expenses]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.fornecedor || !newExpense.valor_total_devido) return;

    const { error } = await supabase.from('gastos').insert({
      user_id: session.user.id,
      fornecedor: newExpense.fornecedor,
      descricao: newExpense.descricao,
      valor_total_devido: Number(newExpense.valor_total_devido),
      data_contrato: newExpense.data_contrato
    });

    if (error) {
      alert('Erro ao criar: ' + error.message);
    } else {
      setNewExpense({
        fornecedor: '',
        descricao: '',
        valor_total_devido: '',
        data_contrato: new Date().toISOString().split('T')[0]
      });
      setShowAddExpense(false);
      fetchExpenses();
    }
  };

  const handleDeleteExpense = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();

    if (window.confirm("ATENÇÃO: Deseja excluir este contrato e todos os pagamentos vinculados?")) {
      const { error } = await supabase.from('gastos').delete().eq('id', id);
      if (!error) {
        if (selectedExpense?.id === id) setSelectedExpense(null);
        fetchExpenses();
      } else {
        alert("Erro ao excluir: " + error.message);
      }
    }
  };

  // Se tiver token de convite, mostra a landing page de convite (Fluxo legado ou específico)
  if (inviteToken) {
    return <InviteLanding token={inviteToken} onSuccess={() => {
      setInviteToken(null);
      window.history.replaceState({}, document.title, "/");
      window.location.reload();
    }} />;
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-olive-50"><div className="animate-spin h-10 w-10 border-b-2 border-olive-600 rounded-full"></div></div>;
  }

  // LOGIC CHANGE: 
  // If no session...
  if (!session) {
    // ...check if user wants to see Login screen
    if (showAuth) {
      return (
        <div className="relative">
          <button
            onClick={() => setShowAuth(false)}
            className="absolute top-4 left-4 p-2 text-olive-600 hover:text-olive-800 transition-colors z-50 flex items-center gap-2 font-bold"
          >
            ← Voltar para o Site
          </button>
          <Auth />
        </div>
      );
    }
    // ...otherwise show Public Landing Page
    return <LandingPage onLoginClick={() => setShowAuth(true)} />;
  }

  // Se tem sessão, mostra o DASHBOARD (código original mantido)

  // Lógica de Permissões
  // Se não tiver profile, assume admin (acesso total)
  // Se for admin, acesso total
  // Se for user, filtra pelo array de permissoes
  const hasPermission = (tabId: string) => {
    if (!userProfile) return false;
    if (userProfile.role === 'admin') return true;
    return userProfile.permissoes.includes(tabId);
  };

  const NavItem = ({ id, icon: Icon, label, mobile = false }: { id: ViewState; icon: any; label: string; mobile?: boolean }) => {
    if (!hasPermission(id)) return null;

    const isActive = view === id;

    // Estilo Mobile (Sidebar Verde)
    if (mobile) {
      return (
        <button
          onClick={() => {
            setView(id);
            setIsMobileMenuOpen(false);
          }}
          className={`flex items-center gap-4 px-6 py-4 w-full transition-all duration-200 ${isActive
            ? 'bg-white/20 text-white font-bold border-r-4 border-white'
            : 'text-olive-100 hover:bg-white/10 hover:text-white'
            }`}
        >
          <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
          <span className="text-lg">{label}</span>
        </button>
      );
    }

    // Estilo Desktop (Sidebar Verde)
    return (
      <button
        onClick={() => setView(id)}
        className={`flex flex-col md:flex-row items-center md:gap-3 px-2 md:px-4 py-2 md:py-3 rounded-xl transition-all duration-200 group w-full ${isActive
          ? 'bg-white text-olive-700 font-bold shadow-md'
          : 'text-olive-100 hover:bg-white/10 hover:text-white'
          }`}
      >
        <Icon size={24} className={isActive ? 'text-olive-600 fill-olive-100' : 'text-olive-200 group-hover:text-white'} strokeWidth={isActive ? 2.5 : 2} />
        <span className="text-[10px] md:text-sm mt-1 md:mt-0">{label}</span>
      </button>
    );
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#e8f5e9]">

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-2 text-olive-600">
          <span className="font-serif text-2xl font-bold">G</span>
          <Heart size={20} fill="#88b04b" stroke="none" className="mt-1" />
          <span className="font-serif text-2xl font-bold">L</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
          <Menu size={28} />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fade-in" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Mobile Sidebar Drawer */}
      <div className={`fixed inset-y-0 right-0 w-[80%] max-w-xs bg-olive-600 z-50 transform transition-transform duration-300 md:hidden shadow-2xl ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 flex justify-between items-center border-b border-white/10">
          <div className="text-white">
            <p className="font-bold text-lg">{userProfile?.nome || 'Menu'}</p>
            <p className="text-xs text-olive-200 uppercase tracking-widest">{userProfile?.titulo || 'Convidado'}</p>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-white hover:bg-white/20 rounded-full">
            <X size={24} />
          </button>
        </div>

        <nav className="py-4">
          <NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" mobile />
          <NavItem id="gastos" icon={Wallet} label="Gastos" mobile />
          <NavItem id="fornecedores" icon={Briefcase} label="Fornecedores" mobile />
          <NavItem id="convidados" icon={Users} label="Convidados" mobile />
          <NavItem id="roteiro" icon={CalendarClock} label="Roteiro" mobile />
          <NavItem id="musicas" icon={Music} label="Músicas" mobile />

          {(!userProfile || userProfile.role === 'admin') && (
            <NavItem id="configuracoes" icon={SettingsIcon} label="Configurações" mobile />
          )}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10 bg-olive-700">
          <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-3 text-white/80 hover:text-white w-full">
            <LogOut size={20} />
            <span>Sair do App</span>
          </button>
        </div>
      </div>

      {/* Sidebar Desktop */}
      <aside className="w-64 bg-olive-600 border-r border-olive-500 hidden md:flex flex-col fixed h-full z-20 shadow-[4px_0_24px_rgba(0,0,0,0.1)]">
        <div className="p-8">
          {/* LOGO PERSONALIZADO */}
          <div className="flex items-center justify-center gap-3 text-white mb-10 bg-olive-700/50 p-4 rounded-2xl border border-olive-500/30">
            <span className="font-serif text-3xl font-bold">G</span>
            <Heart size={24} fill="#ffffff" stroke="none" className="mt-1 animate-pulse" />
            <span className="font-serif text-3xl font-bold">L</span>
          </div>

          <nav className="space-y-2">
            <NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem id="gastos" icon={Wallet} label="Gastos" />
            <NavItem id="fornecedores" icon={Briefcase} label="Fornecedores" />
            <NavItem id="convidados" icon={Users} label="Convidados" />
            <NavItem id="roteiro" icon={CalendarClock} label="Roteiro" />
            <NavItem id="musicas" icon={Music} label="Músicas" />

            {/* Configurações só aparece para admins ou quem não tem perfil (primeiro user) */}
            {(!userProfile || userProfile.role === 'admin') && (
              <NavItem id="configuracoes" icon={SettingsIcon} label="Configurações" />
            )}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-olive-500/30 space-y-2">
          <button onClick={() => setShowSqlModal(true)} className="flex items-center gap-2 text-xs font-semibold text-olive-200 hover:text-white transition-colors w-full p-2">
            <Database size={14} /> <span>DB SETUP</span>
          </button>
          <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-2 text-xs font-semibold text-red-200 hover:text-red-100 transition-colors w-full p-2">
            <LogOut size={14} /> <span>SAIR</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-10 overflow-y-auto mb-20 md:mb-0">
        <header className="hidden md:flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-800 capitalize">
            {view === 'configuracoes' ? 'Configurações' : view}
          </h2>
          <div className="flex items-center gap-4">
            {/* HEADER PERSONALIZADO GUSTAVO E LIVIA */}
            <div className="hidden md:block text-right">
              <p className="text-lg font-serif font-bold text-gray-900 leading-tight">
                {userProfile ? userProfile.nome : 'Gustavo & Lívia'}
              </p>
              <p className="text-xs text-olive-600 font-bold uppercase tracking-widest">
                {userProfile ? userProfile.titulo : 'Noivos'}
              </p>
              {session?.user?.email && <p className="text-[10px] text-gray-400">{session.user.email}</p>}
            </div>
            <div className="w-12 h-12 rounded-full bg-olive-100 flex items-center justify-center text-olive-700 font-serif font-bold text-lg border-2 border-white shadow-md">
              {userProfile ? userProfile.nome.charAt(0) : 'GL'}
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-b-2 border-olive-600 rounded-full"></div></div>
        ) : (
          <>
            {view === 'dashboard' && hasPermission('dashboard') && <Dashboard expenses={expenses} />}
            {view === 'fornecedores' && hasPermission('fornecedores') && <Vendors />}
            {view === 'convidados' && hasPermission('convidados') && <Guests />}
            {view === 'roteiro' && hasPermission('roteiro') && <Timeline />}
            {view === 'musicas' && hasPermission('musicas') && <Musics />}
            {view === 'configuracoes' && (!userProfile || userProfile.role === 'admin') && <Settings />}

            {view === 'gastos' && hasPermission('gastos') && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowAddExpense(!showAddExpense)}
                    className="flex items-center gap-2 bg-olive-600 text-white px-5 py-2.5 rounded-xl hover:bg-olive-700 shadow-lg shadow-olive-200 transition-all active:scale-95 font-medium"
                  >
                    {showAddExpense ? 'Cancelar' : 'Novo Gasto'}
                    {!showAddExpense && <Plus size={18} />}
                  </button>
                </div>

                {showAddExpense && (
                  <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 animate-slide-in">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Novo Contrato</h3>
                    <form onSubmit={handleAddExpense} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div><label className="text-xs font-bold text-gray-500">FORNECEDOR</label><input required className="w-full p-2 border rounded-lg bg-gray-50 focus:bg-white transition-colors outline-olive-500" value={newExpense.fornecedor} onChange={e => setNewExpense({ ...newExpense, fornecedor: e.target.value })} placeholder="Ex: Buffet" /></div>
                      <div className="md:col-span-2"><label className="text-xs font-bold text-gray-500">DESCRIÇÃO</label><input required className="w-full p-2 border rounded-lg bg-gray-50 focus:bg-white transition-colors outline-olive-500" value={newExpense.descricao} onChange={e => setNewExpense({ ...newExpense, descricao: e.target.value })} placeholder="Detalhes..." /></div>
                      <div><label className="text-xs font-bold text-gray-500">TOTAL (R$)</label><input type="number" required className="w-full p-2 border rounded-lg bg-gray-50 focus:bg-white transition-colors outline-olive-500" value={newExpense.valor_total_devido} onChange={e => setNewExpense({ ...newExpense, valor_total_devido: e.target.value })} /></div>
                      <div className="md:col-span-4 text-right mt-2"><button type="submit" className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-black transition-colors shadow-md">Salvar Contrato</button></div>
                    </form>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {expenses.map(expense => (
                    <div
                      key={expense.id}
                      onClick={() => setSelectedExpense(expense)}
                      className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-olive-300 hover:shadow-xl hover:shadow-olive-100 transition-all cursor-pointer relative overflow-hidden"
                    >
                      {/* Botão de Excluir REFORÇADO com z-index alto e fundo branco para clique */}
                      <button
                        onClick={(e) => handleDeleteExpense(expense.id, e)}
                        className="absolute top-4 right-4 z-20 p-2 bg-white rounded-lg shadow-sm border border-gray-100 text-gray-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-all"
                        title="Excluir Gasto"
                      >
                        <Trash2 size={18} />
                      </button>

                      <h3 className="font-bold text-gray-900 text-lg mb-1 pr-10">{expense.fornecedor}</h3>
                      <p className="text-sm text-gray-500 mb-4">{expense.descricao}</p>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm"><span className="text-gray-400">Pago</span><span className="font-bold text-olive-600">R$ {expense.total_pago.toLocaleString('pt-BR')}</span></div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden"><div className="bg-olive-500 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(136,176,75,0.4)]" style={{ width: `${Math.min(100, (expense.total_pago / expense.valor_total_devido) * 100)}%` }}></div></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-400">Total</span><span className="font-medium">R$ {expense.valor_total_devido.toLocaleString('pt-BR')}</span></div>
                        {expense.restante > 0 && <div className="text-right text-xs text-rose-500 font-bold mt-1">Falta: R$ {expense.restante.toLocaleString('pt-BR')}</div>}
                      </div>
                    </div>
                  ))}
                  {expenses.length === 0 && <p className="text-gray-400 col-span-full text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">Nenhum gasto registrado.</p>}
                </div>
              </div>
            )}
          </>
        )}

        {selectedExpense && <ExpenseDetail expense={selectedExpense} onClose={() => setSelectedExpense(null)} onUpdate={fetchExpenses} />}
        <SqlSetupModal isOpen={showSqlModal} onClose={() => setShowSqlModal(false)} />
      </main>
    </div>
  );
};

export default App;
