import React from 'react';
import Section from './Section';
import { Clock, MapPin, Calendar } from 'lucide-react';

const EventDetails: React.FC = () => {
    return (
        <Section id="details" bgColor="olive">
            <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-serif text-olive-900 mb-2">Detalhes do Evento</h2>
                <p className="text-olive-700">Tudo o que você precisa saber</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                {/* Date */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-olive-100 flex flex-col items-center hover:shadow-md transition-shadow">
                    <div className="w-16 h-16 bg-olive-100 rounded-full flex items-center justify-center text-olive-600 mb-4">
                        <Calendar size={32} />
                    </div>
                    <h3 className="text-xl font-serif font-bold text-gray-800 mb-2">A Data</h3>
                    <p className="text-gray-600">04 de Abril de 2026</p>
                    <p className="text-gray-400 text-sm">Sábado</p>
                </div>

                {/* Time */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-olive-100 flex flex-col items-center hover:shadow-md transition-shadow">
                    <div className="w-16 h-16 bg-olive-100 rounded-full flex items-center justify-center text-olive-600 mb-4">
                        <Clock size={32} />
                    </div>
                    <h3 className="text-xl font-serif font-bold text-gray-800 mb-2">O Horário</h3>
                    <p className="text-gray-600">10:00 da manhã</p>
                    <p className="text-gray-400 text-sm">Cerimônia e Recepção</p>
                </div>

                {/* Location */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-olive-100 flex flex-col items-center hover:shadow-md transition-shadow">
                    <div className="w-16 h-16 bg-olive-100 rounded-full flex items-center justify-center text-olive-600 mb-4">
                        <MapPin size={32} />
                    </div>
                    <h3 className="text-xl font-serif font-bold text-gray-800 mb-2">O Local</h3>
                    <p className="text-gray-600">Sítio Recanto Mineiro</p>
                    <p className="text-gray-400 text-sm">Mairiporã - SP</p>
                </div>
            </div>
        </Section>
    );
};

export default EventDetails;
