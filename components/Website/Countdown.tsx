import React, { useEffect, useState } from 'react';
import { WEDDING_DATE } from '../../constants';
import Section from './Section';
import { TimeLeft } from '../../types';

const Countdown: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ months: 0, days: 0, hours: 0, minutes: 0 });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const target = new Date(WEDDING_DATE);

            if (target.getTime() <= now.getTime()) {
                setTimeLeft({ months: 0, days: 0, hours: 0, minutes: 0 });
                return;
            }

            const diff = target.getTime() - now.getTime();
            const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / (1000 * 60)) % 60);

            setTimeLeft({ months: 0, days: totalDays, hours, minutes });
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000); // Update every second for better feel

        return () => clearInterval(timer);
    }, []);

    const TimeUnit = ({ value, label }: { value: number; label: string }) => (
        <div className="flex flex-col items-center mx-2 md:mx-6">
            <div className="w-16 h-16 md:w-24 md:h-24 bg-olive-600 text-white rounded-lg flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <span className="text-2xl md:text-4xl font-serif">{value}</span>
            </div>
            <span className="mt-3 text-olive-800 font-medium uppercase text-xs tracking-widest">{label}</span>
        </div>
    );

    return (
        <Section id="countdown" bgColor="olive">
            <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-serif text-olive-900 mb-10">
                    Falta pouco para o grande dia!
                </h2>
                <div className="flex flex-wrap justify-center items-center">
                    {timeLeft.days > 0 && <TimeUnit value={timeLeft.days} label={timeLeft.days === 1 ? 'Dia' : 'Dias'} />}
                    {(timeLeft.days > 0 || timeLeft.hours > 0) && <TimeUnit value={timeLeft.hours} label={timeLeft.hours === 1 ? 'Hora' : 'Horas'} />}
                    <TimeUnit value={timeLeft.minutes} label={timeLeft.minutes === 1 ? 'Minuto' : 'Minutos'} />
                </div>
                <p className="mt-8 text-olive-700 italic">
                    04 de Abril de 2026, às 10:00
                </p>
            </div>
        </Section>
    );
};

export default Countdown;
