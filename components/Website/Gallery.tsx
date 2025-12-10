import React from 'react';
import Section from './Section';

const Gallery: React.FC = () => {
    const images = [
        "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1511285560982-1351cdeb9821?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1529636798458-92182e662485?q=80&w=600&auto=format&fit=crop"
    ];

    return (
        <Section id="gallery" bgColor="white">
            <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-serif text-olive-900">
                    Momentos
                </h2>
                <p className="text-gray-500 mt-2">Um pouco do nosso amor</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((src, idx) => (
                    <div key={idx} className="overflow-hidden rounded-lg shadow-md aspect-square group">
                        <img
                            src={src}
                            alt={`Gallery ${idx}`}
                            className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                        />
                    </div>
                ))}
            </div>
        </Section>
    );
};

export default Gallery;
