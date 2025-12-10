import React from 'react';

interface SectionProps {
    id?: string;
    className?: string;
    children: React.ReactNode;
    bgColor?: 'white' | 'olive';
}

const Section: React.FC<SectionProps> = ({ id, className = '', children, bgColor = 'white' }) => {
    const bgClass = bgColor === 'olive' ? 'bg-olive-50' : 'bg-white';

    return (
        <section id={id} className={`py-16 md:py-24 px-4 sm:px-6 lg:px-8 ${bgClass} ${className}`}>
            <div className="max-w-4xl mx-auto">
                {children}
            </div>
        </section>
    );
};

export default Section;
