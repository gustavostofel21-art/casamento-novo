import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Camera, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
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

        // Try to extraxt filename from URL (assumes standard supabase storage public url structure)
        try {
            const urlParts = foto.url.split('/');
            const fileName = urlParts[urlParts.length - 1];

            // Apaga do storage primeiro
            if (fileName) {
                await supabase.storage
                    .from('galeria_casamento')
                    .remove([`fotos/${fileName}`]);
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
            alert('Erro ao apagar foto: ' + error.message);
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
                        <div key={foto.id} className="relative group break-inside-avoid rounded-xl overflow-hidden shadow-sm border border-gray-200">
                            <img src={foto.url} className="w-full h-auto object-cover" alt="Casamento log" loading="lazy" />

                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    onClick={() => handleDelete(foto)}
                                    className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transform hover:scale-110 transition-transform"
                                    title="Excluir Foto"
                                >
                                    <Trash2 size={24} />
                                </button>
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
