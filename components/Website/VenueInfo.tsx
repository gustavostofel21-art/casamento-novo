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
                        <br /><br />
                        <strong>Endereço:</strong> RJ 127 km 35 numero1307, Pocinhos - RJ, Vassouras - RJ, 27700-000
                    </p>

                    <div className="bg-olive-50 border-l-4 border-olive-500 p-4 mb-8">
                        <p className="font-bold text-olive-800">Informação Importante:</p>
                        <p className="text-olive-700">
                            O restaurante funciona no formato self-service. <br />
                            <span className="font-bold">Valor: R$ 11,90 / 100g.</span>
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
                        src="/images/RESTAURANTE (1).PNG"
                        alt="Restaurante 1"
                        className="rounded-lg shadow-md h-48 w-full object-cover transform translate-y-4"
                    />
                    <img
                        src="/images/RESTAURANTE (2).PNG"
                        alt="Restaurante 2"
                        className="rounded-lg shadow-md h-48 w-full object-cover"
                    />
                    <img
                        src="/images/RESTAURANTE (3).PNG"
                        alt="Restaurante 3"
                        className="rounded-lg shadow-md h-48 w-full object-cover transform translate-y-4"
                    />
                    <img
                        src="/images/RESTAURANTE (4).PNG"
                        alt="Restaurante 4"
                        className="rounded-lg shadow-md h-48 w-full object-cover"
                    />
                </div>
            </div>
        </Section>
    );
};

export default VenueInfo;
