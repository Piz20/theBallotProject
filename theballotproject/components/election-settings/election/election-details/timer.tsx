import React, { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';

interface TimerProps {
  endTime: Date;
  onElectionEnd: () => void;
}

const Timer: React.FC<TimerProps> = ({ endTime, onElectionEnd }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime.getTime() - now;

      if (distance < 0) {
        setIsExpired(true);
        onElectionEnd();
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, onElectionEnd]);

  if (isExpired) {
    return (
      <div className="bg-red-500 text-white p-6 rounded-xl text-center mb-8 shadow-lg">
        <Calendar className="mx-auto mb-2" size={32} />
        <h2 className="text-2xl font-bold">Élection Terminée</h2>
        <p className="text-red-100">Les votes sont maintenant fermés</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-6 rounded-xl text-center mb-8 shadow-lg">
      <div className="flex items-center justify-center mb-4">
        <Clock className="mr-2" size={24} />
        <h2 className="text-2xl font-bold">Temps Restant</h2>
      </div>
      <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
        <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
          <div className="text-2xl font-bold">{timeLeft.days}</div>
          <div className="text-sm opacity-80">Jours</div>
        </div>
        <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
          <div className="text-2xl font-bold">{timeLeft.hours}</div>
          <div className="text-sm opacity-80">Heures</div>
        </div>
        <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
          <div className="text-2xl font-bold">{timeLeft.minutes}</div>
          <div className="text-sm opacity-80">Minutes</div>
        </div>
        <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
          <div className="text-2xl font-bold">{timeLeft.seconds}</div>
          <div className="text-sm opacity-80">Secondes</div>
        </div>
      </div>
    </div>
  );
};

export default Timer;