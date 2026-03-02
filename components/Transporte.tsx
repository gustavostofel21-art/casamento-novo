import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Bus, Users, UserPlus, Trash2, X, AlertCircle, Save, Download } from 'lucide-react';
import { Convidado, Van, VanPassageiro, Acompanhante } from '../types';
import toast, { Toaster } from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type Person = {
    id: string; // Unique ID for list rendering (e.g. "c-xxx" or "a-xxx")
    nome: string;
    sobrenome?: string;
    tipo: string;
    convidado_id?: string;
    acompanhante_id?: string;
};

const Transporte: React.FC = () => {
    const [van, setVan] = useState<Van | null>(null);
    const [capacityInput, setCapacityInput] = useState<string>('');
    const [passengers, setPassengers] = useState<VanPassageiro[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal de adição
    const [showAddModal, setShowAddModal] = useState(false);
    const [availablePersons, setAvailablePersons] = useState<Person[]>([]);
    const [selectedPersonIds, setSelectedPersonIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchVanData();
    }, []);

    const fetchVanData = async () => {
        setLoading(true);
        // 1. Puxa a Van do usuário atual
        const { data: vanData } = await supabase
            .from('vans')
            .select('*')
            .limit(1)
            .single();

        if (vanData) {
            setVan(vanData);
            setCapacityInput(vanData.capacidade.toString());
            fetchPassengers(vanData.id);
        } else {
            setLoading(false);
        }
    };

    const fetchPassengers = async (vanId: string) => {
        const { data: passData } = await supabase
            .from('van_passageiros')
            .select('*, convidados(*), acompanhantes(*)')
            .eq('van_id', vanId);

        if (passData) {
            // Ordena alfabeticamente os passageiros atuais
            const sorted = passData.sort((a: any, b: any) => {
                const nomeA = a.convidados ? a.convidados.nome : (a.acompanhantes ? a.acompanhantes.nome : '');
                const nomeB = b.convidados ? b.convidados.nome : (b.acompanhantes ? b.acompanhantes.nome : '');
                return nomeA.localeCompare(nomeB);
            });
            setPassengers(sorted);
        }
        setLoading(false);
    };

    const handleSaveCapacity = async () => {
        const cap = parseInt(capacityInput, 10);
        if (isNaN(cap) || cap < 1) {
            toast.error('Informe uma capacidade válida.');
            return;
        }

        if (van) {
            // Atualiza
            const { error } = await supabase
                .from('vans')
                .update({ capacidade: cap })
                .eq('id', van.id);
            if (!error) {
                setVan({ ...van, capacidade: cap });
                toast.success("Capacidade atualizada com sucesso.");
            } else {
                toast.error("Erro ao atualizar: " + error.message);
            }
        } else {
            // Insere
            const { data: user } = await supabase.auth.getUser();
            if (!user.user) return;

            const { data, error } = await supabase
                .from('vans')
                .insert({ capacidade: cap, user_id: user.user.id })
                .select()
                .single();

            if (data && !error) {
                setVan(data);
                toast.success("Van cadastrada com sucesso!");
            } else {
                toast.error("Erro ao cadastrar van: " + (error?.message || ""));
            }
        }
    };

    const openAddModal = async () => {
        if (!van) {
            toast.error("Cadastre a capacidade da van primeiro.");
            return;
        }

        // Puxa todos os convidados CONFIRMADOS
        const { data: convData } = await supabase
            .from('convidados')
            .select('*, acompanhantes(*)')
            .eq('confirmado', true);

        if (convData) {
            let allPersons: Person[] = [];

            convData.forEach((c: any) => {
                allPersons.push({
                    id: `c-${c.id}`,
                    nome: c.nome,
                    sobrenome: c.sobrenome,
                    tipo: c.tipo_convidado || 'Confirmado',
                    convidado_id: c.id
                });

                if (c.acompanhantes && c.acompanhantes.length > 0) {
                    c.acompanhantes.forEach((ac: any) => {
                        allPersons.push({
                            id: `a-${ac.id}`,
                            nome: ac.nome,
                            tipo: ac.is_crianca ? 'Criança' : 'Acompanhante',
                            acompanhante_id: ac.id
                        });
                    });
                }
            });

            // Filtra pra tirar quem já tá na van
            const passengerIds = new Set(passengers.map(p =>
                p.convidado_id ? `c-${p.convidado_id}` : `a-${p.acompanhante_id}`
            ));

            const available = allPersons.filter(p => !passengerIds.has(p.id));

            // Ordena de A a Z
            available.sort((a, b) => a.nome.localeCompare(b.nome));

            setAvailablePersons(available);
            setSelectedPersonIds(new Set());
            setShowAddModal(true);
        }
    };

    const togglePersonSelect = (id: string) => {
        const newSet = new Set(selectedPersonIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedPersonIds(newSet);
    };

    const handleSavePassengers = async () => {
        if (!van) return;
        if (selectedPersonIds.size === 0) {
            setShowAddModal(false);
            return;
        }

        // Calcula se excede o limite
        const currentCount = passengers.length;
        const newCount = currentCount + selectedPersonIds.size;
        if (newCount > van.capacidade) {
            toast.error(`Você está tentando adicionar passageiros acima da capacidade (${van.capacidade} lugares).`);
            return;
        }

        const payload = Array.from(selectedPersonIds).map((pid: string) => {
            const isConvidado = pid.startsWith('c-');
            const idReal = pid.substring(2);

            return {
                van_id: van.id,
                convidado_id: isConvidado ? idReal : null,
                acompanhante_id: !isConvidado ? idReal : null
            };
        });

        const { error } = await supabase
            .from('van_passageiros')
            .insert(payload);

        if (!error) {
            setShowAddModal(false);
            toast.success("Passageiros adicionados com sucesso!");
            fetchPassengers(van.id);
        } else {
            toast.error("Erro ao adicionar passageiros: " + error.message);
        }
    };

    const handleRemovePassenger = async (passageiroId: string) => {
        toast((t) => (
            <div className="flex flex-col gap-3">
                <p className="font-medium text-gray-800">
                    Remover este passageiro da van?
                </p>
                <p className="text-xs text-gray-500">Ele voltará para a lista geral de convidados disponíveis.</p>
                <div className="flex gap-2 w-full justify-end mt-2">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            const { error } = await supabase
                                .from('van_passageiros')
                                .delete()
                                .eq('id', passageiroId);

                            if (!error) {
                                setPassengers(passengers.filter(p => p.id !== passageiroId));
                                toast.success("Passageiro removido com segurança!");
                            } else {
                                toast.error("Erro ao remover: " + error.message);
                            }
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition"
                    >
                        Remover
                    </button>
                </div>
            </div>
        ), { duration: 5000 });
    };

    const seatsTotal = van ? van.capacidade : 0;
    const seatsUsed = passengers.length;
    const seatsAvailable = Math.max(0, seatsTotal - seatsUsed);

    const downloadVanList = () => {
        const doc = new jsPDF();
        const tableColumn = ["#", "Nome", "Categoria", "Assinatura / Presença"];
        const tableRows: any[] = [];
        let count = 1;

        passengers.forEach(p => {
            const name = p.convidados ? `${p.convidados.nome} ${p.convidados.sobrenome || ''}`.trim() : `${p.acompanhantes?.nome}`;
            const tag = p.convidados ? 'Convidado' : (p.acompanhantes?.is_crianca ? 'Acompanhante (-14)' : 'Acompanhante');

            tableRows.push([count++, name, tag, '']);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 25,
            margin: { top: 25 }, // Avoid overlap with the title
            theme: 'grid',
            headStyles: { fillColor: [136, 176, 75] }, // Olive green matching the theme
            didDrawPage: (data) => {
                doc.setFontSize(14);
                doc.text("Lista de Chamada do Transporte (Van)", 14, 15);
            },
            styles: { cellPadding: 4 },
            columnStyles: {
                0: { cellWidth: 12 }, // '#'
                1: { cellWidth: 80 }, // 'Nome Completo'
                2: { cellWidth: 45 }, // 'Categoria'
                3: { cellWidth: 'auto' } // 'Assinatura'
            }
        });

        doc.save("lista_de_chamada_transporte.pdf");
    };

    if (loading) {
        return <div className="flex justify-center p-12"><div className="animate-spin h-8 w-8 border-b-2 border-olive-600 rounded-full"></div></div>;
    }

    return (
        <div className="space-y-6 animate-fade-in relative">
            <Toaster
                position="top-center"
                toastOptions={{
                    success: { style: { background: '#fff', color: '#4a583c', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px 24px', fontWeight: '600', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }, iconTheme: { primary: '#5c6b4b', secondary: '#fff' } },
                    error: { style: { background: '#fff', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '16px', padding: '16px 24px', fontWeight: '600', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' } }
                }}
            />
            {/* Top Cards: Dashboard Transporte */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-4 bg-olive-50 text-olive-600 rounded-xl"><Bus size={32} /></div>
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase">Capacidade Total</p>
                        <p className="text-3xl font-bold text-gray-800">{seatsTotal}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-4 bg-gray-50 text-gray-600 rounded-xl"><Users size={32} /></div>
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase">Lugares Ocupados</p>
                        <p className="text-3xl font-bold text-gray-800">{seatsUsed}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className={`p-4 rounded-xl ${seatsAvailable === 0 && seatsTotal > 0 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                        <AlertCircle size={32} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase">Lugares Disponíveis</p>
                        <p className={`text-3xl font-bold ${seatsAvailable === 0 && seatsTotal > 0 ? 'text-red-500' : 'text-green-600'}`}>{seatsAvailable}</p>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">

                {/* Configuração da Van */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                            <Settings className="w-5 h-5 text-gray-400" />
                            Configurar Van
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-bold text-gray-600">Quantidade de Lugares</label>
                                <input
                                    type="number"
                                    value={capacityInput}
                                    onChange={(e) => setCapacityInput(e.target.value)}
                                    placeholder="Ex: 15"
                                    className="w-full mt-1 p-3 border rounded-xl bg-gray-50 focus:bg-white transition-colors outline-olive-500"
                                />
                            </div>
                            <button
                                onClick={handleSaveCapacity}
                                className="w-full bg-olive-600 text-white font-bold py-3 rounded-xl hover:bg-olive-700 transition"
                            >
                                Salvar Capacidade
                            </button>
                        </div>
                    </div>
                </div>

                {/* Lista de Passageiros */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-0 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h3 className="font-bold text-xl text-gray-800">Lista de Passageiros</h3>
                                <p className="text-sm text-gray-500 mt-1">Configure quem vai no transporte.</p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
                                <button
                                    onClick={downloadVanList}
                                    disabled={passengers.length === 0}
                                    className="bg-white text-olive-700 border border-olive-200 px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-olive-50 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Download size={18} /> Baixar PDF
                                </button>
                                <button
                                    onClick={openAddModal}
                                    disabled={!van || seatsAvailable === 0}
                                    className="bg-olive-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-olive-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-olive-200"
                                >
                                    <UserPlus size={18} /> Adicionar Passageiro
                                </button>
                            </div>
                        </div>

                        <div className="divide-y divide-gray-100 min-h-[300px]">
                            {passengers.length > 0 ? passengers.map((p, idx) => {
                                const name = p.convidados ? `${p.convidados.nome} ${p.convidados.sobrenome || ''}` : `${p.acompanhantes?.nome}`;
                                const tag = p.convidados ? (p.convidados.tipo_convidado || 'Confirmado') : (p.acompanhantes?.is_crianca ? 'Criança' : 'Acompanhante');

                                return (
                                    <div key={p.id} className="p-4 px-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-full bg-olive-100 text-olive-700 flex items-center justify-center font-bold text-xs">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">{name}</p>
                                                <p className="text-xs text-gray-500 capitalize">{tag}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemovePassenger(p.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                            title="Remover da Van"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                );
                            }) : (
                                <div className="p-12 text-center text-gray-400">
                                    <Bus size={48} className="mx-auto mb-3 opacity-20" />
                                    <p>A van ainda está vazia.</p>
                                    <p className="text-sm">Clique em Adicionar Passageiro para começar a preencher os lugares.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            {/* Modal Adicionar Convidados/Acompanhantes */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col h-[80vh] max-h-[600px] animate-slide-in">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h3 className="font-bold text-xl text-gray-900">Selecionar Passageiros</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Selecionados: <strong>{selectedPersonIds.size}</strong> de {seatsAvailable} lugares disponíveis
                                </p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="p-2 bg-white text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition shadow-sm border border-gray-200">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1 p-2">
                            {availablePersons.length > 0 ? (
                                <div className="space-y-1">
                                    {availablePersons.map(p => {
                                        const isSelected = selectedPersonIds.has(p.id);
                                        const isFull = !isSelected && selectedPersonIds.size >= seatsAvailable;

                                        return (
                                            <div
                                                key={p.id}
                                                onClick={() => !isFull && togglePersonSelect(p.id)}
                                                className={`p-3 mx-2 rounded-xl flex items-center gap-3 cursor-pointer transition ${isSelected ? 'bg-olive-50 border border-olive-200' : isFull ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:bg-gray-50 border border-transparent'} `}
                                            >
                                                <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${isSelected ? 'bg-olive-600 border-olive-600 text-white' : 'bg-white border-gray-300'}`}>
                                                    {isSelected && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800">{p.nome} {p.sobrenome || ''}</p>
                                                    <span className="text-xs text-olive-600 font-semibold">{p.tipo}</span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="p-10 text-center text-gray-500 text-sm">
                                    Todos já estão na van!
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-white">
                            <button
                                onClick={handleSavePassengers}
                                disabled={selectedPersonIds.size === 0}
                                className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-black transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
                            >
                                <Save size={20} />
                                Adicionar {selectedPersonIds.size} à Van
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

const Settings = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>

export default Transporte;
