import React, { useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Navbar from './Website/Navbar';
import Hero from './Website/Hero';
import Countdown from './Website/Countdown';
import About from './Website/About';
import EventDetails from './Website/EventDetails';
import LocationMap from './Website/LocationMap';
import VenueInfo from './Website/VenueInfo';
import RSVP from './Website/RSVP';
import Footer from './Website/Footer';
import LiveGallery from './Website/LiveGallery';
import Gifts from './Website/Gifts';
import { Lock } from 'lucide-react';

interface LandingPageProps {
    onLoginClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick }) => {
    useEffect(() => {
        // Verifica se a URL retornou do Stripe com sucesso
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('payment_success') === 'true') {
            toast.success('PAGAMENTO APROVADO! Muito obrigado pelo presente! ❤️', {
                duration: 6000,
                position: 'top-center',
                style: { backgroundColor: '#4b553d', color: '#fff', fontSize: '18px' }
            });
            // Limpa a URL mas não recarrega a página
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (urlParams.get('payment_cancel') === 'true') {
            toast.error('Pagamento cancelado ou incompleto. Fique à vontade para tentar depois.', {
                duration: 4000,
                position: 'top-center',
            });
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    return (
        <div className="font-sans text-gray-800 antialiased selection:bg-olive-200 selection:text-olive-900 bg-olive-50">
            <Toaster />
            <Navbar />
            <Hero />
            <Countdown />
            <About />
            <EventDetails />
            <LocationMap />
            <VenueInfo />
            <Gifts />
            <LiveGallery />
            <RSVP />

            <div className="relative">
                <Footer />
                <button
                    onClick={onLoginClick}
                    className="absolute bottom-4 right-4 p-2 text-olive-300 hover:text-olive-600 transition-colors opacity-50 hover:opacity-100"
                    title="Área dos Noivos"
                >
                    <Lock size={14} />
                </button>
            </div>
        </div>
    );
};

export default LandingPage;
