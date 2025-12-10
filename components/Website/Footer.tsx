import React from 'react';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-white py-12 border-t border-olive-50">
            <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-olive-800 mb-4 opacity-50">
                    <span className="font-serif font-bold">G</span>
                    <Heart size={12} fill="#384922" stroke="none" />
                    <span className="font-serif font-bold">L</span>
                </div>
                <p className="text-olive-900/40 text-sm font-light">
                    © 2026 Gustavo & Lívia. Feito com amor.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
