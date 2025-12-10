import React from 'react';
import Navbar from './Website/Navbar';
import Hero from './Website/Hero';
import Countdown from './Website/Countdown';
import About from './Website/About';
import EventDetails from './Website/EventDetails';
import LocationMap from './Website/LocationMap';
import VenueInfo from './Website/VenueInfo';
import RSVP from './Website/RSVP';
import Gallery from './Website/Gallery';
import Footer from './Website/Footer';
import { Lock } from 'lucide-react';

interface LandingPageProps {
    onLoginClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick }) => {
    return (
        <div className="font-sans text-gray-800 antialiased selection:bg-olive-200 selection:text-olive-900 bg-olive-50">
            <Navbar />
            <Hero />
            <Countdown />
            <About />
            <EventDetails />
            <LocationMap />
            <VenueInfo />
            <Gallery />
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
