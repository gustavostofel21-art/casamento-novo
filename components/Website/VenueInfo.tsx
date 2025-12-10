import React from 'react';
import Section from './Section';
import { LOCATION_NAME } from '../../constants';
import { Utensils, Camera, Sun, Leaf } from 'lucide-react';

const VenueInfo: React.FC = () => {
    const highlights = [
        { icon: <Utensils />, text: "Self-service mineiro" },
        { icon: <Leaf />, text: "Ambiente de sítio aberto" },
        { icon: <Camera />, text: "Espaço amplo e fotogênico" },
        { icon: <Sun />, text: "Clima leve e familiar" },
    ];

    return (
        <Section id="venue" bgColor="white">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Text Content */}
                <div>
                    <h2 className="text-3xl md:text-4xl font-serif text-olive-900 mb-6">
                        Sobre o Local
                    </h2>
                    <h3 className="text-xl font-medium text-olive-600 mb-4">{LOCATION_NAME}</h3>

                    <p className="text-gray-600 mb-6 leading-relaxed">
                        O {LOCATION_NAME} oferece comida caseira mineira deliciosa, ambiente rústico e acolhedor,
                        espaço ao ar livre, animais, passeio a cavalo e áreas perfeitas para registrar momentos especiais.
                    </p>

                    <div className="bg-olive-50 border-l-4 border-olive-500 p-4 mb-8">
                        <p className="font-bold text-olive-800">Informação Importante:</p>
                        <p className="text-olive-700">
                            O restaurante funciona no formato self-service. <br />
                            <span className="font-bold">Valor por quilo: R$ 9,90/kg.</span>
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {highlights.map((item, index) => (
                            <div key={index} className="flex items-center space-x-3 text-gray-700">
                                <div className="text-olive-600">
                                    {item.icon}
                                </div>
                                <span>{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Images Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <img
                        src="https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800&auto=format&fit=crop"
                        alt="Comida Mineira"
                        className="rounded-lg shadow-md h-48 w-full object-cover transform translate-y-4"
                    />
                    <img
                        src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=800&auto=format&fit=crop"
                        alt="Natureza"
                        className="rounded-lg shadow-md h-48 w-full object-cover"
                    />
                    <img
                        src="https://images.unsplash.com/photo-1505944357431-27579db47558?q=80&w=800&auto=format&fit=crop"
                        alt="Ambiente Rústico"
                        className="rounded-lg shadow-md h-48 w-full object-cover transform translate-y-4"
                    />
                    <img
                        src="https://images.unsplash.com/photo-1533280385001-c32ff4e929b9?q=80&w=800&auto=format&fit=crop"
                        alt="Detalhes"
                        className="rounded-lg shadow-md h-48 w-full object-cover"
                    />
                </div>
            </div>
        </Section>
    );
};

export default VenueInfo;
