import React from 'react';
import Section from './Section';

const LocationMap: React.FC = () => {
    return (
        <Section id="map" bgColor="white" className="!p-0 !max-w-none">
            <div className="w-full h-[400px] bg-gray-200">
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3663.490795493263!2d-46.59828452378904!3d-23.334199978955523!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94cee6a742886f0b%3A0xe552d0577be834af!2sS%C3%ADtio%20Recanto%20Mineiro!5e0!3m2!1spt-BR!2sbr!4v1715200000000!5m2!1spt-BR!2sbr"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Mapa do Local"
                ></iframe>
            </div>
            <div className="bg-olive-900 text-white p-8 text-center">
                <p className="font-serif text-xl">Esperamos você lá!</p>
                <button
                    onClick={() => window.open('https://maps.app.goo.gl/XXXXX', '_blank')}
                    className="mt-4 text-olive-200 hover:text-white underline text-sm"
                >
                    Abrir no Google Maps
                </button>
            </div>
        </Section>
    );
};

export default LocationMap;
