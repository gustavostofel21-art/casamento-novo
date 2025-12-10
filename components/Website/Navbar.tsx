import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();
        const targetId = href.replace('#', '');
        const element = document.getElementById(targetId);

        if (element) {
            // Calculate offset to account for fixed header (approx 80px)
            const headerOffset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            setIsOpen(false);
        } else if (href === '#') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setIsOpen(false);
        }
    };

    const links = [
        { name: 'O Casal', href: '#about' },
        { name: 'O Dia', href: '#details' },
        { name: 'Local', href: '#venue' },
        { name: 'RSVP', href: '#rsvp' },
    ];

    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 shadow-md py-2' : 'bg-transparent py-4'}`}>
            <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
                {/* Logo */}
                <a
                    href="#"
                    onClick={(e) => handleLinkClick(e, '#')}
                    className={`font-serif text-2xl md:text-3xl font-bold transition-colors flex items-center ${scrolled ? 'text-olive-800' : 'text-white'}`}
                >
                    G <span className={`mx-1 font-serif italic font-light text-3xl ${scrolled ? 'text-olive-600' : 'text-olive-300'}`}>&</span> L
                </a>

                {/* Desktop Menu */}
                <div className="hidden md:flex space-x-8">
                    {links.map(link => (
                        <a
                            key={link.name}
                            href={link.href}
                            onClick={(e) => handleLinkClick(e, link.href)}
                            className={`text-sm uppercase tracking-widest hover:text-olive-500 transition-colors cursor-pointer ${scrolled ? 'text-gray-600' : 'text-white/90'}`}
                        >
                            {link.name}
                        </a>
                    ))}
                </div>

                {/* Mobile Toggle */}
                <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? (
                        <X className={scrolled ? 'text-gray-800' : 'text-white'} />
                    ) : (
                        <Menu className={scrolled ? 'text-gray-800' : 'text-white'} />
                    )}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white absolute top-full left-0 w-full shadow-lg py-6 flex flex-col items-center space-y-6 animate-fade-in border-t border-gray-100">
                    {links.map(link => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="text-gray-700 text-sm uppercase tracking-widest hover:text-olive-600 font-medium cursor-pointer"
                            onClick={(e) => handleLinkClick(e, link.href)}
                        >
                            {link.name}
                        </a>
                    ))}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
