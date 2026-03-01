import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Camera, Trash2, Loader2, Image as ImageIcon, Download } from 'lucide-react';
import { CasamentoFoto } from './Website/LiveGallery';

const GalleryAdmin: React.FC = () => {
    const [fotos, setFotos] = useState<CasamentoFoto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFotos();
    }, []);

    const fetchFotos = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('casamento_fotos')
            .select('*')
            .order('created_at', { ascending: false });

        if (data && !error) {
            setFotos(data);
        }
        setLoading(false);
    };

    const handleDelete = async (foto: CasamentoFoto) => {
        if (!window.confirm("Certeza que deseja apagar esta foto permanentemente?")) return;

        try {
            // Extrai as partes corretas da URL, especificamente o que vem após "galeria_casamento/"
            const urlString = new URL(foto.url);
            const pathParts = urlString.pathname.split('galeria_casamento/');
            if (pathParts.length > 1) {
                const filePath = pathParts[1]; // Ex: "fotos/arquivo.jpg"

                // Apaga do storage primeiro
                const { error: storageError } = await supabase.storage
                    .from('galeria_casamento')
                    .remove([filePath]);

                if (storageError) {
                    console.error("Erro no storage:", storageError.message);
                }
            }
        } catch (e) {
            console.error("Erro ao tentar apagar do storage", e);
        }

        // Apaga do banco
        const { error } = await supabase
            .from('casamento_fotos')
            .delete()
            .eq('id', foto.id);

        if (!error) {
            fetchFotos();
        } else {
            alert('Erro ao apagar registro: ' + error.message);
        }
    };

    const handleDownload = async (url: string, id: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `foto_casamento_${id}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Erro ao baixar:", error);
            alert("Não foi possível baixar a imagem. Apenas abra o link manualmente.");
        }
    };

    if (loading) {
        return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-olive-600" size={32} /></div>;
    }

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <Camera className="text-olive-600" size={24} />
                    <h2 className="text-xl font-bold text-gray-800">Moderação da Galeria</h2>
                </div>
                <p className="text-gray-500 text-sm">Gerencie as fotos enviadas pelos seus convidados. As fotos excluídas daqui sairão permanentemente do momento ao vivo no site.</p>
            </div>

            {fotos.length > 0 ? (
                <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                    {fotos.map((foto) => (
                        <div key={foto.id} className="relative group break-inside-avoid rounded-3xl overflow-hidden shadow-sm border border-gray-200 bg-white flex flex-col">
                            <div className="relative aspect-[9/11] w-full">
                                <img src={foto.url} className="w-full h-full object-cover" alt="Casamento log" loading="lazy" />

                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                    <button
                                        onClick={() => handleDownload(foto.url, foto.id.substring(0, 5))}
                                        className="bg-white hover:bg-gray-100 text-gray-800 p-3 rounded-full shadow-lg transform hover:scale-110 transition-transform"
                                        title="Baixar Foto"
                                    >
                                        <Download size={22} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(foto)}
                                        className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transform hover:scale-110 transition-transform"
                                        title="Excluir Foto"
                                    >
                                        <Trash2 size={22} />
                                    </button>
                                </div>
                            </div>

                            {/* Bloco de Mensagem */}
                            <div className="p-4 border-t border-gray-100">
                                {foto.nome ? (
                                    <p className="text-sm font-bold text-gray-800 mb-1">
                                        Enviado por: <span className="font-normal text-olive-600">{foto.nome}</span>
                                    </p>
                                ) : (
                                    <p className="text-xs font-bold text-gray-400 mb-1">Anônimo</p>
                                )}

                                {foto.mensagem ? (
                                    <div className="bg-gray-50 p-3 rounded-lg mt-2">
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Mensagem:</p>
                                        <p className="text-sm text-gray-700 italic">"{foto.mensagem}"</p>
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-300 italic mt-2">Sem mensagem anexada</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="w-full p-12 bg-white rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-center">
                    <ImageIcon size={48} className="text-gray-300 mb-4" />
                    <p className="font-bold text-gray-600 mb-1">Nenhuma foto recebida ainda.</p>
                    <p className="text-gray-400 text-sm">Quando os convidados começarem a subir fotos, elas aparecerão aqui para sua moderação.</p>
                </div>
            )}
        </div>
    );
};

export default GalleryAdmin;
