import React from 'react';
import Section from './Section';

const LocationMap: React.FC = () => {
    return (
        <Section id="map" bgColor="white" className="!p-0 !max-w-none">
            <div className="w-full h-[400px] bg-gray-200">
                <iframe
                    src="https://maps.google.com/maps?q=Aki%20Ki%20N%C3%B3is%20Fica,%20RJ%20127%20Vassouras%20-%20RJ&t=&z=15&ie=UTF8&iwloc=&output=embed"
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
                    onClick={() => window.open('https://share.google/PaOwz2odRH3aJF3Ez', '_blank')}
                    className="mt-4 text-olive-200 hover:text-white underline text-sm"
                >
                    Abrir no Google Maps
                </button>
            </div>
        </Section>
    );
};

export default LocationMap;
