import React, { useState, useEffect } from 'react';
import Section from './Section';
import { supabase } from '../../services/supabaseClient';
import { Presente } from '../../types';
import { Gift, Heart } from 'lucide-react';

const Gifts: React.FC = () => {
    const [presentes, setPresentes] = useState<Presente[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedGift, setSelectedGift] = useState<Presente | null>(null);
    const [donorName, setDonorName] = useState('');
    const [message, setMessage] = useState('');
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    useEffect(() => {
        const fetchPresentes = async () => {
            const { data, error } = await supabase
                .from('presentes')
                .select('*')
                .eq('ativo', true)
                .order('valor', { ascending: true });

            if (!error && data) {
                setPresentes(data);
            }
            setLoading(false);
        };
        fetchPresentes();
    }, []);

    const handlePresentear = (gift: Presente) => {
        setSelectedGift(gift);
    };

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedGift || !donorName) return;

        setIsCheckingOut(true);

        try {
            // Chamamos a Edge Function do Supabase para criar o Checkout Session no Stripe
            const { data, error } = await supabase.functions.invoke('create-checkout-session', {
                body: {
                    presente_id: selectedGift.id,
                    titulo: selectedGift.titulo,
                    valor: selectedGift.valor,
                    nome_doador: donorName,
                    mensagem: message
                }
            });

            if (error) {
                throw new Error('Erro ao conectar com o pagamento: ' + error.message);
            }

            if (data?.url) {
                // Redireciona o usuário para o Stripe
                window.location.href = data.url;
            } else {
                throw new Error('URL de pagamento não retornada.');
            }
        } catch (error: any) {
            alert(error.message);
            setIsCheckingOut(false);
        }
    };

    if (loading || presentes.length === 0) return null;

    return (
        <Section id="presentes" bgColor="olive-50">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <Heart className="mx-auto text-olive-500 mb-4" size={32} />
                <h2 className="text-3xl md:text-5xl font-serif text-olive-900 mb-6">Lista de Presentes</h2>
                <p className="text-gray-600 text-lg">
                    Se você deseja nos presentear com algo especial ou apenas nos ajudar a pagar uns boletos da vida de casados, escolha uma das opções abaixo!
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {presentes.map((p) => (
                    <div key={p.id} className="bg-white rounded-3xl shadow-lg border border-olive-100 overflow-hidden hover:shadow-xl transition-all flex flex-col transform hover:-translate-y-1">
                        <div className="h-48 bg-olive-100 flex justify-center items-center relative">
                            {p.imagem_url ? (
                                <img src={p.imagem_url} alt={p.titulo} className="w-full h-full object-cover" />
                            ) : (
                                <Gift className="text-olive-300" size={64} />
                            )}
                            <div className="absolute bottom-[-20px] bg-white text-olive-700 px-6 py-2 rounded-full font-bold shadow-md border border-olive-100 text-lg">
                                R$ {Number(p.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                        <div className="p-8 pt-10 flex flex-col flex-1 text-center">
                            <h3 className="font-bold text-xl text-gray-900 mb-3 font-serif">{p.titulo}</h3>
                            {p.descricao && <p className="text-gray-600 text-sm mb-6">{p.descricao}</p>}

                            <button
                                onClick={() => handlePresentear(p)}
                                className="mt-auto bg-olive-600 text-white w-full py-4 rounded-xl font-bold hover:bg-olive-700 transition shadow-lg shadow-olive-200 active:scale-95 flex justify-center items-center gap-2"
                            >
                                <Gift size={20} /> Presentear
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal de Presentear */}
            {selectedGift && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full animate-slide-in shadow-2xl relative">
                        <button
                            onClick={() => setSelectedGift(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>

                        <div className="text-center mb-6">
                            <Gift className="mx-auto text-olive-500 mb-2" size={32} />
                            <h3 className="text-2xl font-serif text-olive-900 font-bold">{selectedGift.titulo}</h3>
                            <p className="text-olive-600 font-bold text-lg mt-1">R$ {Number(selectedGift.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>

                        <form onSubmit={handleCheckout} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Seu Nome (ou da família) *</label>
                                <input
                                    required
                                    type="text"
                                    value={donorName}
                                    onChange={(e) => setDonorName(e.target.value)}
                                    placeholder="Ex: João e Maria"
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-olive-500 transition-all font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Mensagem para os Noivos (Opcional)</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Deixe um recadinho carinhoso (ou uma piada)..."
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-olive-500 transition-all min-h-[100px] resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isCheckingOut}
                                className="w-full bg-olive-900 text-white font-bold text-lg py-4 rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isCheckingOut ? (
                                    <>
                                        <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></div>
                                        Conectando...
                                    </>
                                ) : (
                                    'Ir para Pagamento Seguro'
                                )}
                            </button>
                            <p className="text-center text-xs text-olive-600 font-medium mt-3 bg-olive-50 p-2 rounded-lg">
                                💳 Na sua fatura aparecerá como: <br />
                                <span className="font-bold text-olive-800">GUSTAVO-LIVIA-CASAMENT</span>
                            </p>
                            <p className="text-center text-xs text-gray-400 mt-2">
                                Pagamento processado com segurança via Stripe.
                            </p>
                        </form>
                    </div>
                </div>
            )}
        </Section>
    );
};

export default Gifts;
