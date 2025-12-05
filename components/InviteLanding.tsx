import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Convite } from '../types';
import { Heart, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

interface InviteLandingProps {
    token: string;
    onSuccess: () => void;
}

const InviteLanding: React.FC<InviteLandingProps> = ({ token, onSuccess }) => {
    const [invite, setInvite] = useState<Convite | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const checkInvite = async () => {
            const { data, error } = await supabase
                .from('convites')
                .select('*')
                .eq('token', token)
                .single();

            if (error || !data) {
                setError('Convite inválido ou não encontrado.');
            } else if (data.used) {
                setError('Este convite já foi utilizado.');
            } else {
                setInvite(data);
            }
            setLoading(false);
        };

        checkInvite();
    }, [token]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!invite) return;
        if (password !== confirmPassword) {
            alert('As senhas não coincidem.');
            return;
        }
        if (password.length < 6) {
            alert('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setProcessing(true);

        try {
            // 1. Criar usuário no Auth com metadados do token
            // O Trigger no banco de dados (handle_new_user_invite) vai detectar o token
            // e criar o perfil automaticamente na tabela 'profiles'.
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: invite.email,
                password: password,
                options: {
                    data: {
                        full_name: invite.nome,
                        invite_token: invite.token
                    }
                }
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error('Erro ao criar usuário.');

            // Sucesso!
            if (authData.session) {
                onSuccess();
            } else {
                alert('Cadastro realizado! Se você não for redirecionado automaticamente, verifique seu e-mail para confirmar a conta.');
                // Se não tem sessão, provavelmente requer confirmação de e-mail.
                // O perfil JÁ FOI CRIADO pelo trigger, então quando ele confirmar e logar, vai funcionar.
                window.location.href = '/';
            }

        } catch (err: any) {
            console.error(err);
            alert('Erro ao registrar: ' + (err.message || 'Erro desconhecido'));
        } finally {
            setProcessing(false);
        }


    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-olive-50">
                <div className="animate-spin h-10 w-10 border-b-2 border-olive-600 rounded-full"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-olive-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Ops! Algo deu errado</h2>
                    <p className="text-gray-600">{error}</p>
                    <a href="/" className="mt-6 inline-block text-olive-600 font-bold hover:underline">Voltar ao início</a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-olive-50 p-4">
            <div className="mb-8 text-center">
                <div className="flex items-center justify-center gap-3 text-olive-600 mb-4">
                    <span className="font-serif text-4xl font-bold">G</span>
                    <Heart size={32} fill="#88b04b" stroke="none" className="mt-1 animate-pulse" />
                    <span className="font-serif text-4xl font-bold">L</span>
                </div>
                <p className="text-olive-800 font-serif italic">Gustavo & Lívia</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full animate-scale-in border border-white/50">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Olá, {invite?.nome}!</h2>
                    <p className="text-gray-500 mt-2">Você foi convidado(a) para acessar o painel do casamento como <strong className="text-olive-600">{invite?.titulo}</strong>.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Seu E-mail (Confirmado)</label>
                        <input
                            type="email"
                            disabled
                            value={invite?.email}
                            className="w-full p-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Crie uma Senha</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-olive-200 outline-none transition-all"
                            placeholder="Mínimo 6 caracteres"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Confirme a Senha</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-olive-200 outline-none transition-all"
                            placeholder="Repita a senha"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-olive-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-olive-700 shadow-lg shadow-olive-200 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
                    >
                        {processing ? (
                            <div className="animate-spin h-6 w-6 border-b-2 border-white rounded-full"></div>
                        ) : (
                            <>
                                Acessar Painel <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default InviteLanding;
