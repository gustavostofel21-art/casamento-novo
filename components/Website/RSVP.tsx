import React, { useState } from 'react';
import Section from './Section';
import { FormData, GuestDetail } from '../../types'; // Corrected path
import { Send, CheckCircle, UserPlus, Baby } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

const RSVP: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        guests: 0,
        guestDetails: [],
        phone: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleMainChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'guests') {
            const count = parseInt(value);
            setFormData(prev => {
                // Adjust the guestDetails array length based on selection
                const currentDetails = [...prev.guestDetails];
                let newDetails: GuestDetail[] = [];

                if (count > currentDetails.length) {
                    // Add new empty slots
                    const toAdd = count - currentDetails.length;
                    const newSlots = Array(toAdd).fill({ name: '', kinship: '', isChild: false });
                    newDetails = [...currentDetails, ...newSlots];
                } else {
                    // Trim array
                    newDetails = currentDetails.slice(0, count);
                }

                return {
                    ...prev,
                    guests: count,
                    guestDetails: newDetails
                };
            });
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleGuestChange = (index: number, field: keyof GuestDetail, value: any) => {
        setFormData(prev => {
            const newDetails = [...prev.guestDetails];
            newDetails[index] = {
                ...newDetails[index],
                [field]: value
            };
            return { ...prev, guestDetails: newDetails };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMsg(null);

        try {
            // 1. Prepare Data
            const nameParts = formData.name.trim().split(' ');
            const nome = nameParts[0];
            const sobrenome = nameParts.slice(1).join(' ') || '-';

            // 2. Insert Main Guest
            const { data: guestData, error: guestError } = await supabase
                .from('convidados')
                .insert({
                    nome,
                    sobrenome,
                    telefone: formData.phone,
                    tipo_convidado: 'Site', // Marking as Site to differentiate
                    acompanhantes: formData.guests,
                    confirmado: true
                })
                .select()
                .single();

            if (guestError) throw new Error(`Erro ao salvar convidado: ${guestError.message || guestError.code}`);

            // 3. Insert Companions
            if (formData.guests > 0 && guestData && formData.guestDetails.length > 0) {
                const companionsToInsert = formData.guestDetails.map(g => ({
                    convidado_id: guestData.id,
                    nome: g.name,
                    parentesco: g.kinship,
                    is_crianca: g.isChild
                }));

                const { error: compError } = await supabase
                    .from('acompanhantes')
                    .insert(companionsToInsert);

                if (compError) throw new Error(`Erro ao salvar acompanhantes: ${compError.message || compError.code}`);
            }

            // Success
            setIsSent(true);
            setFormData({ name: '', guests: 0, guestDetails: [], phone: '' });

        } catch (err: any) {
            console.error('Error submitting RSVP:', err);
            setErrorMsg(err.message || 'Ocorreu um erro desconhecido.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Section id="rsvp" bgColor="olive" className="relative">
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden border border-olive-100">
                <div className="bg-olive-800 py-8 text-center text-white relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <h2 className="text-3xl md:text-4xl font-serif relative z-10">Confirmar Presença</h2>
                    <p className="text-olive-200 text-sm mt-2 uppercase tracking-widest relative z-10">Responda até 20/03/2026</p>
                </div>

                <div className="p-6 md:p-10">
                    {isSent ? (
                        <div className="text-center py-12 animate-fade-in">
                            <div className="flex justify-center mb-6 text-olive-600">
                                <CheckCircle size={80} strokeWidth={1} />
                            </div>
                            <h3 className="text-3xl font-serif text-gray-800 mb-4">Presença Confirmada!</h3>
                            <p className="text-gray-600 text-lg">Obrigado!<br />Sua confirmação foi enviada com sucesso no banco de dados.</p>
                            <button
                                onClick={() => setIsSent(false)}
                                className="mt-8 text-olive-700 hover:text-olive-900 underline text-sm"
                            >
                                Enviar outra resposta
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Main Guest Info */}
                            <div className="space-y-5">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Seu Nome Completo</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleMainChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-olive-500 outline-none transition-all placeholder-gray-400"
                                        placeholder="Digite seu nome"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Telefone / WhatsApp</label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            required
                                            value={formData.phone}
                                            onChange={handleMainChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-olive-500 outline-none transition-all placeholder-gray-400"
                                            placeholder="(DD) 99999-9999"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="guests" className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Quantos acompanhantes?</label>
                                        <select
                                            id="guests"
                                            name="guests"
                                            value={formData.guests}
                                            onChange={handleMainChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-olive-500 outline-none transition-all cursor-pointer"
                                        >
                                            <option value={0}>Somente eu</option>
                                            <option value={1}>Eu + 1 pessoa</option>
                                            <option value={2}>Eu + 2 pessoas</option>
                                            <option value={3}>Eu + 3 pessoas</option>
                                            <option value={4}>Eu + 4 pessoas</option>
                                            <option value={5}>Eu + 5 pessoas</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Dynamic Guest Fields */}
                            {formData.guests > 0 && (
                                <div className="space-y-4 animate-fade-in-up">
                                    <div className="flex items-center space-x-2 text-olive-800 border-b border-olive-100 pb-2">
                                        <UserPlus size={20} />
                                        <h3 className="font-serif text-lg font-bold">Dados dos Acompanhantes</h3>
                                    </div>

                                    {formData.guestDetails.map((guest, index) => (
                                        <div key={index} className="bg-olive-50/50 p-5 rounded-xl border border-olive-100 shadow-sm transition-all hover:shadow-md">
                                            <p className="text-xs font-bold text-olive-400 uppercase tracking-wider mb-3">Acompanhante {index + 1}</p>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Name Input */}
                                                <div className="col-span-1 md:col-span-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Nome completo do acompanhante"
                                                        value={guest.name}
                                                        required
                                                        onChange={(e) => handleGuestChange(index, 'name', e.target.value)}
                                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-md focus:ring-1 focus:ring-olive-500 outline-none text-sm"
                                                    />
                                                </div>

                                                {/* Kinship Select */}
                                                <div>
                                                    <select
                                                        value={guest.kinship}
                                                        required
                                                        onChange={(e) => handleGuestChange(index, 'kinship', e.target.value)}
                                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-md focus:ring-1 focus:ring-olive-500 outline-none text-sm text-gray-600"
                                                    >
                                                        <option value="" disabled>Selecione o parentesco</option>
                                                        <option value="Esposo(a)">Esposo(a)</option>
                                                        <option value="Namorado(a)">Namorado(a)</option>
                                                        <option value="Filho(a)">Filho(a)</option>
                                                        <option value="Pai/Mãe">Pai / Mãe</option>
                                                        <option value="Avô(ó)">Avô(ó)</option>
                                                        <option value="Tio(a)">Tio(a)</option>
                                                        <option value="Primo(a)">Primo(a)</option>
                                                        <option value="Amigo(a)">Amigo(a)</option>
                                                        <option value="Outro">Outro</option>
                                                    </select>
                                                </div>

                                                {/* Child Checkbox */}
                                                <div className="flex items-center">
                                                    <label className="flex items-center space-x-3 cursor-pointer group">
                                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${guest.isChild ? 'bg-olive-600 border-olive-600' : 'bg-white border-gray-300 group-hover:border-olive-400'}`}>
                                                            {guest.isChild && <CheckCircle size={14} className="text-white" />}
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            checked={guest.isChild}
                                                            onChange={(e) => handleGuestChange(index, 'isChild', e.target.checked)}
                                                            className="hidden"
                                                        />
                                                        <span className="text-sm text-gray-600 flex items-center">
                                                            <Baby size={16} className="mr-1 text-olive-500" />
                                                            Criança (abaixo de 14 anos)
                                                        </span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {errorMsg && (
                                <div className="p-3 bg-red-100 text-red-700 text-sm rounded-lg text-center animate-pulse">
                                    {errorMsg}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-olive-700 hover:bg-olive-800 text-white font-bold py-4 rounded-full shadow-lg hover:shadow-xl transform transition-all active:scale-95 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {isSubmitting ? (
                                    <span className="animate-pulse">Enviando confirmação...</span>
                                ) : (
                                    <>
                                        <span>Confirmar Presença</span>
                                        <Send size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </Section>
    );
};

export default RSVP;
