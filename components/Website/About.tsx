import React from 'react';
import Section from './Section';
import { Heart } from 'lucide-react';

const About: React.FC = () => {
    return (
        <Section id="about" className="text-center">
            <div className="flex flex-col items-center">
                <div className="text-olive-600 mb-6">
                    <Heart size={40} strokeWidth={1.5} />
                </div>
                <h2 className="text-3xl md:text-4xl font-serif text-gray-800 mb-8">
                    Nossa História
                </h2>
                <div className="max-w-2xl text-gray-600 leading-relaxed text-lg">
                    <p className="mb-4">
                        Somos Gustavo e Lívia. Nossa história é marcada por leveza, companheirismo e amor verdadeiro.
                        Construímos juntos uma vida cheia de aventuras, sonhos e muita parceria.
                    </p>
                    <p>
                        Este site é um pedacinho da nossa alegria em dividir com você esse momento tão especial.
                    </p>
                </div>

                {/* Image Carousel */}
                <div className="mt-12 w-full max-w-5xl overflow-hidden relative py-4">
                    <style>{`
                        @keyframes scroll {
                            0% { transform: translateX(0); }
                            100% { transform: translateX(-50%); }
                        }
                        .animate-scroll {
                            display: flex;
                            width: max-content;
                            animation: scroll 30s linear infinite;
                        }
                        .animate-scroll:hover {
                            animation-play-state: paused;
                        }
                    `}</style>
                    <div className="animate-scroll gap-4">
                        {[2, 3, 4, 5, 2, 3, 4, 5].map((num, idx) => (
                            <div key={idx} className="h-[380px] md:h-[450px] flex-shrink-0">
                                <img
                                    src={`/images/${num}.jpg`}
                                    alt={`Nossa História ${idx}`}
                                    className="h-full w-auto object-cover rounded-xl shadow-lg"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Section>
    );
};

export default About;
