import React, { useRef, useEffect } from 'react';
import Section from './Section';
import { Heart } from 'lucide-react';

const About: React.FC = () => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const slider = scrollRef.current;
        if (!slider) return;

        let animationFrameId: number;

        const scroll = () => {
            if (slider.scrollLeft >= slider.scrollWidth - slider.clientWidth - 1) {
                slider.scrollLeft = 0; // reset
            } else {
                slider.scrollLeft += 1; // 1px por frame
            }
            animationFrameId = requestAnimationFrame(scroll);
        };

        animationFrameId = requestAnimationFrame(scroll);

        const pauseScroll = () => cancelAnimationFrame(animationFrameId);
        const resumeScroll = () => {
            animationFrameId = requestAnimationFrame(scroll);
        };

        slider.addEventListener('mouseenter', pauseScroll);
        slider.addEventListener('mouseleave', resumeScroll);
        // pause no mobile durante interação
        slider.addEventListener('touchstart', pauseScroll, { passive: true });
        slider.addEventListener('touchend', resumeScroll, { passive: true });

        return () => {
            cancelAnimationFrame(animationFrameId);
            slider.removeEventListener('mouseenter', pauseScroll);
            slider.removeEventListener('mouseleave', resumeScroll);
            slider.removeEventListener('touchstart', pauseScroll);
            slider.removeEventListener('touchend', resumeScroll);
        };
    }, []);

    return (
        <Section id="about" className="text-center">
            <div className="flex flex-col items-center">
                <div className="text-olive-600 mb-6">
                    <Heart size={40} strokeWidth={1.5} />
                </div>
                <h2 className="text-3xl md:text-4xl font-serif text-gray-800 mb-8">
                    Nossa História
                </h2>
                <div className="max-w-2xl text-gray-600 leading-relaxed text-lg px-4">
                    <p className="mb-4">
                        Nossa historia é marcada por muito amor, leveza e parceira. Construímos juntos uma vida cheia de aventuras, sonhos e momentos felizes.
                    </p>
                    <p>
                        Este site é um pedacinho da nossa alegria em dividir com você esse momento tão especial.
                    </p>
                </div>

                {/* Image Carousel */}
                <div className="mt-12 w-full max-w-5xl relative py-4">
                    <style>{`
                        .no-scrollbar::-webkit-scrollbar {
                            display: none;
                        }
                        .no-scrollbar {
                            -ms-overflow-style: none; /* IE and Edge */
                            scrollbar-width: none; /* Firefox */
                        }
                    `}</style>
                    <div
                        ref={scrollRef}
                        className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth"
                    >
                        {[2, 3, 4, 5, 2, 3, 4, 5, 2, 3, 4, 5].map((num, idx) => (
                            <div key={idx} className="h-[380px] md:h-[450px] flex-shrink-0 snap-center">
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
