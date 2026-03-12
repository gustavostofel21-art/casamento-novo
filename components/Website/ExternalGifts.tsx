import React from 'react';
import { Gift, ExternalLink } from 'lucide-react';

const ExternalGifts: React.FC = () => {
    return (
        <section id="presentes" className="py-24 bg-olive-50 relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16 px-4">
                    <Gift className="mx-auto text-olive-500 mb-6" size={48} strokeWidth={1.5} />
                    <h2 className="text-4xl md:text-5xl font-serif text-olive-900 mb-8">Lista de Presentes</h2>
                    <p className="text-gray-600 text-lg md:text-xl leading-relaxed mb-10 font-serif italic">
                        Se você deseja nos presentear com algo especial ou apenas nos ajudar a pagar alguns boletos da vida de casados, escolha uma das opções abaixo!
                    </p>
                    
                    <a 
                        href="http://noivos.casar.com/gustavo-e-livia-2026-12-21" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-3 bg-olive-600 outline-none text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-olive-700 transition-all shadow-xl shadow-olive-200 hover:shadow-2xl hover:-translate-y-1 w-full sm:w-auto"
                    >
                        Acessar Lista de Presentes
                        <ExternalLink size={20} />
                    </a>
                </div>
            </div>

            {/* Elementos decorativos */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10">
                <svg width="200" height="200" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <path d="M50 0 C77.6142 0 100 22.3858 100 50 C100 77.6142 77.6142 100 50 100 C22.3858 100 0 77.6142 0 50 C0 22.3858 22.3858 0 50 0 Z" fill="#88b04b" />
                </svg>
            </div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 opacity-10">
                <svg width="150" height="150" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <path d="M50 0 L100 50 L50 100 L0 50 Z" fill="#88b04b" />
                </svg>
            </div>
        </section>
    );
};

export default ExternalGifts;
