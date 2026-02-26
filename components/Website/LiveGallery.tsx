import React, { useState, useEffect, useRef } from 'react';
import Section from './Section';
import { Camera, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

export interface CasamentoFoto {
    id: string;
    url: string;
    created_at: string;
}

const LiveGallery: React.FC = () => {
    const [fotos, setFotos] = useState<CasamentoFoto[]>([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchFotos();

        // Setup real-time updates for new photos
        const channel = supabase
            .channel('public:casamento_fotos')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'casamento_fotos' }, payload => {
                setFotos(prev => [payload.new as CasamentoFoto, ...prev]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchFotos = async () => {
        const { data, error } = await supabase
            .from('casamento_fotos')
            .select('*')
            .order('created_at', { ascending: false });

        if (data && !error) {
            setFotos(data);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `fotos/${fileName}`;

                // Upload to Supabase Storage 'galeria_casamento' bucket
                const { error: uploadError } = await supabase.storage
                    .from('galeria_casamento')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                // Get Public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('galeria_casamento')
                    .getPublicUrl(filePath);

                // Insert reference in Database 'casamento_fotos' table
                const { error: dbError } = await supabase
                    .from('casamento_fotos')
                    .insert([{ url: publicUrl }]);

                if (dbError) throw dbError;
            }
        } catch (error) {
            console.error('Erro ao fazer upload da foto:', error);
            alert('Não foi possível enviar a foto. Tente novamente mais tarde.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
            fetchFotos();
        }
    };

    return (
        <Section id="live-gallery" bgColor="white" className="text-center">
            <div className="flex flex-col items-center">
                <div className="text-olive-600 mb-4">
                    <Camera size={40} strokeWidth={1.5} />
                </div>
                <h2 className="text-3xl md:text-4xl font-simonetta text-gray-800 mb-4">
                    Momentos ao Vivo
                </h2>
                <p className="max-w-2xl text-gray-600 text-lg px-4 mb-8">
                    Seja nosso fotógrafo por um dia! Compartilhe aqui as fotos que você tirar durante o casamento para nosso álbum digital. As fotos vão aparecer aqui embaixo na mesma hora!
                </p>

                {/* Upload Button */}
                <div className="mb-12">
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                    // O 'capture' não está explícito aqui para que o navegador por padrão dê a opção de Escolher da Galeria *ou* Tirar a Foto na Câmera na maioria dos celulares.
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-2 bg-olive-600 hover:bg-olive-500 text-white font-medium py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
                    >
                        {uploading ? (
                            <><Loader2 className="animate-spin" size={20} /> Carregando...</>
                        ) : (
                            <><Upload size={20} /> Enviar Fotos</>
                        )}
                    </button>
                    {!uploading && (
                        <p className="text-sm text-gray-500 mt-3 flex items-center justify-center gap-1">
                            <ImageIcon size={14} /> Selecione da galeria ou use a câmera
                        </p>
                    )}
                </div>

                {/* Gallery Grid (Pinterest Style) */}
                {fotos.length > 0 ? (
                    <div className="w-full max-w-6xl mx-auto columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 px-4">
                        {fotos.map(foto => (
                            <div key={foto.id} className="break-inside-avoid overflow-hidden rounded-xl shadow-md bg-gray-200">
                                <img
                                    src={foto.url}
                                    alt="Momento do Casamento"
                                    className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
                                    loading="lazy"
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="w-full max-w-2xl mx-auto p-12 bg-white rounded-2xl border border-dashed border-gray-300 flex flex-col items-center">
                        <ImageIcon size={48} className="text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">Ainda não há fotos no álbum...</p>
                        <p className="text-gray-400">Seja o primeiro a compartilhar uma foto e testar a galeria!</p>
                    </div>
                )}
            </div>
        </Section>
    );
};

export default LiveGallery;
