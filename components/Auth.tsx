
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Heart, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (err: any) {
      console.error(err);
      let msg = err.message;
      
      // Tratamento genérico de erro
      if (msg === 'Failed to fetch') {
        msg = 'Erro de conexão. Verifique sua internet.';
      } else if (msg.includes('Invalid login')) {
        msg = 'Email ou senha incorretos.';
      }
      
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-olive-50 p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
        
        {/* Header Elegante Verde Oliva */}
        <div className="bg-olive-600 p-10 text-center relative overflow-hidden">
          {/* Círculos decorativos de fundo */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full translate-x-1/3 translate-y-1/3"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 shadow-inner">
              <Heart className="text-white fill-white" size={32} />
            </div>
            <h1 className="text-2xl font-serif font-bold text-white mb-1 tracking-wide">Planejamento de Casamento</h1>
            <p className="text-olive-100 text-lg font-serif italic tracking-wide opacity-90">
              Gustavo & Lívia
            </p>
          </div>
        </div>

        {/* Formulário */}
        <div className="p-8 pt-10">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
            Área Restrita
          </h2>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Email</label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-olive-600 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-olive-500 focus:ring-4 focus:ring-olive-100 outline-none transition-all bg-gray-50 focus:bg-white"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Senha</label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-olive-600 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-olive-500 focus:ring-4 focus:ring-olive-100 outline-none transition-all bg-gray-50 focus:bg-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center justify-center text-center animate-pulse">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-black text-white py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all transform active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Acessar
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center pt-4">
             <p className="text-xs text-gray-400">Acesso exclusivo para convidados.</p>
          </div>
        </div>
      </div>
      
      <div className="fixed bottom-4 text-center w-full text-xs text-olive-400 opacity-60 pointer-events-none">
        &copy; 2025 Gustavo & Lívia
      </div>
    </div>
  );
};

export default Auth;
