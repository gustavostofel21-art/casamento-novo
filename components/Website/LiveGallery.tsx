import React, { useState, useEffect, useRef } from 'react';
import { Camera, Image as ImageIcon, Upload, Loader2, User, MessageSquareHeart } from 'lucide-react';
import Section from './Section';
import { supabase } from '../../services/supabaseClient';
import imageCompression from 'browser-image-compression';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from './cropImage';
import toast, { Toaster } from 'react-hot-toast';

export interface CasamentoFoto {
    id: string;
    url: string;
    nome?: string;
    mensagem?: string;
    created_at: string;
}

const LiveGallery: React.FC = () => {
    const [fotos, setFotos] = useState<CasamentoFoto[]>([]);
    const [uploading, setUploading] = useState(false);

    // Form state
    const [nome, setNome] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [rawImageUrl, setRawImageUrl] = useState<string | null>(null);
    const [showCropper, setShowCropper] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const fileInputRefCamera = useRef<HTMLInputElement>(null);
    const fileInputRefGallery = useRef<HTMLInputElement>(null);

    // Upload limit
    const MAX_UPLOADS = 8;
    const [uploadCount, setUploadCount] = useState(0);

    useEffect(() => {
        fetchFotos();

        const storedCount = localStorage.getItem('casamento_uploads_count');
        if (storedCount) {
            setUploadCount(parseInt(storedCount, 10));
        }

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

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Verifica se é imagem
        if (!file.type.startsWith('image/')) {
            toast.error('Por favor, selecione apenas imagens ou tire uma foto.');
            return;
        }

        // Em vez de selecionar direto, abre o cropper
        const objectUrl = URL.createObjectURL(file);
        setRawImageUrl(objectUrl);
        setShowCropper(true);

        // Limpa o input no DOM pra permitir o recarregamento do mesmo arquivo na recusa
        e.target.value = '';
    };

    const confirmCrop = async () => {
        if (!rawImageUrl || !croppedAreaPixels) return;
        try {
            const croppedFile = await getCroppedImg(rawImageUrl, croppedAreaPixels);
            if (croppedFile) {
                setSelectedFile(croppedFile);
                setPreviewUrl(URL.createObjectURL(croppedFile));
            }
            setShowCropper(false);
        } catch (e) {
            console.error(e);
            toast.error('Erro ao cortar imagem');
        }
    };

    const clearSelection = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRefCamera.current) fileInputRefCamera.current.value = '';
        if (fileInputRefGallery.current) fileInputRefGallery.current.value = '';
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (uploadCount >= MAX_UPLOADS) {
            toast.error(`Você já atingiu o limite de envio de fotos (${MAX_UPLOADS}). Muito obrigado por compartilhar!`);
            return;
        }

        if (!selectedFile && !mensagem.trim()) {
            toast.error('Por favor, adicione uma foto ou uma mensagem!');
            return;
        }

        setUploading(true);
        try {
            let publicUrl = null;

            if (selectedFile) {
                // Configuração da compressão: máx 1.3MB
                const options = {
                    maxSizeMB: 1.3,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true,
                };

                const compressedFile = await imageCompression(selectedFile, options);

                const fileExt = compressedFile.name.split('.').pop() || 'jpg';
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `fotos/${fileName}`;

                // Upload to Supabase Storage 'galeria_casamento' bucket
                const { error: uploadError } = await supabase.storage
                    .from('galeria_casamento')
                    .upload(filePath, compressedFile);

                if (uploadError) throw uploadError;

                // Get Public URL
                const { data } = supabase.storage
                    .from('galeria_casamento')
                    .getPublicUrl(filePath);

                publicUrl = data.publicUrl;
            }

            // Insert reference in Database 'casamento_fotos' table
            const { error: dbError } = await supabase
                .from('casamento_fotos')
                .insert([{
                    url: publicUrl || '',
                    nome: nome.trim() || null,
                    mensagem: mensagem.trim() || null
                }]);

            if (dbError) throw dbError;

            // Sucesso!
            const newCount = uploadCount + 1;
            setUploadCount(newCount);
            localStorage.setItem('casamento_uploads_count', newCount.toString());

            toast.success('Lembrança enviada com sucesso!');
            setNome('');
            setMensagem('');
            setSelectedFile(null);
            setPreviewUrl(null);
            setRawImageUrl(null);

        } catch (error) {
            console.error('Erro ao fazer upload da lembrança:', error);
            toast.error('Não foi possível enviar a lembrança. Tente novamente mais tarde.');
        } finally {
            setUploading(false);
            fetchFotos();
        }
    };

    return (
        <Section id="live-gallery" bgColor="white" className="text-center">
            {/* Adiciona o Toaster global para exibição dos alertas dessa seção */}
            <Toaster
                position="top-center"
                toastOptions={{
                    success: {
                        style: {
                            background: '#fff',
                            color: '#4a583c', // Verde oliva escuro
                            border: '1px solid #e2e8f0',
                            borderRadius: '16px',
                            padding: '16px 24px',
                            fontWeight: '600',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        },
                        iconTheme: {
                            primary: '#5c6b4b',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        style: {
                            background: '#fff',
                            color: '#b91c1c',
                            border: '1px solid #fecaca',
                            borderRadius: '16px',
                            padding: '16px 24px',
                            fontWeight: '600',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        },
                    }
                }}
            />

            <div className="flex flex-col items-center">
                <div className="text-olive-600 mb-4">
                    <Camera size={40} strokeWidth={1.5} />
                </div>
                <h2 className="text-3xl md:text-4xl font-simonetta text-gray-800 mb-4">
                    Mural de Fotos
                </h2>
                <p className="max-w-2xl text-gray-600 text-lg px-4 mb-10">
                    Compartilhe uma lembrança especial e deixe uma mensagem surpresa para alegrar o mural de recordações.
                </p>

                {uploadCount >= MAX_UPLOADS ? (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 mb-8 max-w-xl mx-auto flex items-center gap-3">
                        <ImageIcon size={24} className="text-amber-500 shrink-0" />
                        <p className="text-sm font-medium text-left">
                            <strong>Limite atingido!</strong> Você já enviou suas {MAX_UPLOADS} lembranças. Muito obrigado por participar deste momento especial conosco!
                        </p>
                    </div>
                ) : (
                    <div className="bg-[#f3efdf]/60 border border-olive-200/50 text-olive-800 rounded-xl p-4 mb-8 max-w-xl mx-auto flex items-center gap-3 shadow-sm">
                        <Camera size={24} className="text-olive-500 shrink-0" />
                        <p className="text-sm font-medium text-left leading-snug">
                            Cada convidado poderá enviar no <strong>máximo {MAX_UPLOADS} fotos</strong>!<br />
                            <span className="text-xs opacity-80 mt-1 block">A mensagem será exibida apenas para os noivos com muito carinho.</span>
                        </p>
                    </div>
                )}

                {/* Formulário Estilo Cartão Premium */}
                <div className="w-full max-w-xl mx-auto bg-[#F9F6ED] rounded-3xl p-6 md:p-8 shadow-sm border border-olive-100/50 mb-16 text-left relative overflow-hidden">
                    {/* Elementos decorativos de fundo */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-olive-100/50 rounded-bl-full -z-10 blur-xl"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#ece3cf] rounded-tr-full -z-10 blur-2xl opacity-50"></div>

                    <h3 className="text-2xl font-serif font-bold text-gray-800 mb-2">Deixe sua mensagem e foto <br />para os noivos</h3>
                    <p className="text-sm text-gray-600 mb-6">Compartilhe uma lembrança especial para alegrar o mural de recordações.</p>

                    <form onSubmit={handleFormSubmit} className="space-y-6">
                        {/* Bloco de Upload de Foto */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                            {previewUrl ? (
                                <div className="space-y-3">
                                    <div className="relative w-full h-48 rounded-xl overflow-hidden bg-gray-100">
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={clearSelection}
                                            className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm p-1.5 rounded-full text-gray-600 hover:text-red-500 hover:bg-white transition-all shadow-sm"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                        </button>
                                    </div>
                                    <p className="text-sm font-medium text-olive-600 text-center">Foto selecionada com sucesso!</p>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-[#f3efdf] rounded-xl p-4 mb-4">
                                        <p className="text-sm text-gray-600">Adicione uma foto do casamento (opcional).</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Input Ocultos (Apenas Imagens) */}
                                        <input
                                            type="file" accept="image/*" capture="environment"
                                            className="hidden" ref={fileInputRefCamera} onChange={handleFileSelect}
                                        />
                                        <input
                                            type="file" accept="image/*"
                                            className="hidden" ref={fileInputRefGallery} onChange={handleFileSelect}
                                        />

                                        <button
                                            type="button"
                                            onClick={() => fileInputRefCamera.current?.click()}
                                            className="bg-[#5c6b4b] text-white py-3 rounded-xl font-medium text-sm hover:bg-[#4a583c] transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Camera size={18} /> Tirar foto
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRefGallery.current?.click()}
                                            className="bg-[#5c6b4b] text-white py-3 rounded-xl font-medium text-sm hover:bg-[#4a583c] transition-colors flex items-center justify-center gap-2"
                                        >
                                            <ImageIcon size={18} /> Galeria
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Nome */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700 ml-1">Seu nome</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Digite seu nome"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-transparent border border-gray-300 rounded-xl focus:outline-none focus:border-olive-500 focus:ring-1 focus:ring-olive-500 transition-all font-medium placeholder-gray-400 text-gray-800"
                                />
                            </div>
                        </div>

                        {/* Mensagem */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700 ml-1">Mensagem para o casal</label>
                            <div className="relative">
                                <div className="absolute top-3.5 left-3.5 flex items-start pointer-events-none text-gray-400">
                                    <MessageSquareHeart size={18} />
                                </div>
                                <textarea
                                    rows={4}
                                    placeholder="Escreva algo especial..."
                                    value={mensagem}
                                    onChange={(e) => setMensagem(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-transparent border border-gray-300 rounded-xl focus:outline-none focus:border-olive-500 focus:ring-1 focus:ring-olive-500 transition-all font-medium placeholder-gray-400 text-gray-800 resize-none"
                                ></textarea>
                            </div>
                            <p className="text-xs text-gray-400 font-medium ml-1 mt-1">Apenas o casal consegue ver a sua mensagem.</p>
                        </div>

                        <div className="pt-2">
                            <p className="text-xs text-gray-500 mb-4 px-1 leading-relaxed">
                                Ao enviar, você autoriza o uso da foto no mural do casamento.
                            </p>
                            <button
                                type="submit"
                                disabled={uploading || (!selectedFile && !mensagem.trim()) || uploadCount >= MAX_UPLOADS}
                                className="w-full bg-[#5c6b4b] text-white py-4 rounded-xl font-bold hover:bg-[#4a583c] transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-olive-900/10 text-base"
                            >
                                {uploading ? (
                                    <><Loader2 className="animate-spin" size={20} /> Processando...</>
                                ) : uploadCount >= MAX_UPLOADS ? (
                                    'Limite Atingido'
                                ) : (
                                    'Enviar lembrança'
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Gallery Grid (Slider 2 rows) */}
                {fotos.filter(f => f.url).length > 0 ? (
                    <div className="w-full max-w-7xl mx-auto overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar">
                        <div className="grid grid-rows-2 grid-flow-col auto-cols-[75vw] sm:auto-cols-[300px] md:auto-cols-[350px] gap-4" style={{ WebkitOverflowScrolling: 'touch' }}>
                            {fotos.filter(f => f.url).map(foto => (
                                <div key={foto.id} className="snap-center break-inside-avoid overflow-hidden rounded-3xl shadow-md hover:shadow-xl transition-all duration-500 bg-white border border-gray-100 relative group aspect-[9/11]">
                                    <img
                                        src={foto.url}
                                        alt="Momento do Casamento"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        loading="lazy"
                                    />
                                    {/* Nome do Autor sobre a foto */}
                                    {foto.nome && (
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pb-5 pt-16 transform translate-y-2 group-hover:translate-y-0 transition-all">
                                            <p className="text-white text-sm font-bold flex items-center gap-2 opacity-90 group-hover:opacity-100 drop-shadow-md">
                                                <User size={14} className="text-olive-200" /> {foto.nome}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="w-full max-w-2xl mx-auto p-12 bg-white rounded-2xl border border-dashed border-gray-300 flex flex-col items-center">
                        <ImageIcon size={48} className="text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">Ainda não há fotos no álbum...</p>
                        <p className="text-gray-400">Seja o primeiro a compartilhar uma foto e testar a galeria!</p>
                    </div>
                )}
                {/* Cropper Modal */}
                {showCropper && (
                    <div className="fixed inset-0 z-[99999] bg-black bg-opacity-95 flex flex-col items-center justify-center animate-fade-in">
                        <div className="relative w-full max-w-md h-[70vh] m-4 bg-gray-900 rounded-3xl overflow-hidden shadow-2xl">
                            <Cropper
                                image={rawImageUrl!}
                                crop={crop}
                                zoom={zoom}
                                aspect={9 / 11}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={(_, croppedAreaPixels) => setCroppedAreaPixels(croppedAreaPixels as any)}
                            />
                        </div>
                        <div className="w-full max-w-md p-4 flex justify-between gap-4">
                            <button
                                onClick={() => setShowCropper(false)}
                                type="button"
                                className="flex-1 bg-gray-800 text-white rounded-2xl py-4 font-bold tracking-wide hover:bg-gray-700 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmCrop}
                                type="button"
                                className="flex-1 bg-olive-600 text-white rounded-2xl py-4 font-bold tracking-wide hover:bg-olive-700 transition"
                            >
                                Cortar Foto
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Section>
    );
};

export default LiveGallery;
