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

                {/* User Photo */}
                <div className="mt-12 w-full max-w-2xl overflow-hidden rounded-lg shadow-xl bg-gray-100">
                    <img
                        src="https://i.ibb.co/HTRjdZft/Whats-App-Image-2025-12-08-at-11-56-38.jpg"
                        alt="Gustavo e Lívia"
                        className="w-full h-auto max-h-[600px] object-cover hover:scale-105 transition-transform duration-700"
                        style={{ objectPosition: 'center top' }}
                    />
                </div>
            </div>
        </Section>
    );
};

export default About;
