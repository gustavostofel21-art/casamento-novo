import React from 'react';
import { ArrowDown } from 'lucide-react';

const Hero: React.FC = () => {
    const scrollToRSVP = () => {
        const element = document.getElementById('rsvp');
        if (element) {
            const headerOffset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center text-center overflow-hidden bg-olive-900">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 transition-opacity duration-1000"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2000&auto=format&fit=crop")',
                    opacity: 0.8
                }}
            />

            {/* Soft gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/50 z-0"></div>

            {/* Content */}
            <div className="relative z-10 p-4 text-white animate-fade-in-up">
                <p className="text-lg md:text-xl tracking-widest mb-4 font-light uppercase text-olive-100">O Casamento de</p>
                <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl mb-6 drop-shadow-lg flex flex-col md:block items-center justify-center">
                    Gustavo <span className="text-olive-300 font-serif italic font-light mx-2 text-6xl md:text-8xl">&</span> Lívia
                </h1>
                <p className="text-xl md:text-2xl font-light italic mb-2 max-w-2xl mx-auto drop-shadow-md">
                    “Estamos muito felizes em compartilhar este momento tão especial com você!”
                </p>
                <p className="text-md md:text-lg mb-10 opacity-90 max-w-xl mx-auto drop-shadow-md">
                    Prepare-se para viver um dia leve, simples e cheio de amor ao nosso lado.
                </p>

                <button
                    onClick={scrollToRSVP}
                    className="bg-olive-600 hover:bg-olive-500 text-white font-medium py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl uppercase tracking-wide text-sm border border-olive-400/30 cursor-pointer"
                >
                    Confirmar Presença
                </button>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce text-white/80">
                <ArrowDown size={32} />
            </div>
        </div>
    );
};

export default Hero;
