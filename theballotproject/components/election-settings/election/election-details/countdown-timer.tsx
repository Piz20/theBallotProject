import React, { useState, useEffect } from 'react';
import { Clock, Calendar, CheckCircle, Play, Timer, Hourglass, Zap, Activity } from 'lucide-react';

interface CountdownTimerProps {
  startDate?: string;
  endDate?: string;
  status: 'upcoming' | 'active' | 'ended';
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ startDate, endDate, status }) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    let targetDate: Date;

    if (status === 'upcoming' && startDate) {
      targetDate = new Date(startDate);
    } else if (status === 'active' && endDate) {
      targetDate = new Date(endDate);
    } else {
      // Timer de démonstration - 2h15min30s
      targetDate = new Date();
      targetDate.setHours(targetDate.getHours() + 2);
      targetDate.setMinutes(targetDate.getMinutes() + 15);
      targetDate.setSeconds(targetDate.getSeconds() + 30);
    }

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startDate, endDate, status]);

  const getStatusConfig = () => {
    switch (status) {
      case 'upcoming':
        return {
          icon: Timer,
          title: 'Ouverture dans',
          bgColor: 'from-amber-500 to-orange-500',
          textColor: 'text-white',
          description: 'Préparez-vous !'
        };
      case 'active':
        return {
          icon: Activity,
          title: 'Temps restant',
          bgColor: 'from-blue-500 to-indigo-600',
          textColor: 'text-white',
          description: 'Votez maintenant !'
        };
      case 'ended':
        return {
          icon: CheckCircle,
          title: 'Élection terminée',
          bgColor: 'from-gray-600 to-gray-700',
          textColor: 'text-white',
          description: 'Résultats disponibles'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  if (status === 'ended') {
    return (
      <div className={`bg-gradient-to-r ${config.bgColor} rounded-lg p-6 text-center shadow-lg`}>
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">{config.title}</h3>
        </div>
        <p className="text-white/90 font-medium">{config.description}</p>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r ${config.bgColor} rounded-lg p-6 text-center shadow-lg`}>
      {/* Header */}
      <div className="flex items-center justify-center space-x-3 mb-6">
        <div className="p-3 bg-white/20 rounded-lg">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">{config.title}</h3>
          <p className="text-white/90 text-sm">{config.description}</p>
        </div>
      </div>

      {/* Compteur */}
      <div className="grid grid-cols-4 gap-4 max-w-md mx-auto mb-4">
        {[
          { label: 'Jours', value: timeLeft.days },
          { label: 'Heures', value: timeLeft.hours },
          { label: 'Minutes', value: timeLeft.minutes },
          { label: 'Secondes', value: timeLeft.seconds }
        ].map((item, index) => (
          <div key={index} className="bg-white/20 rounded-lg p-3 border border-white/30">
            <div className="text-2xl font-bold text-white mb-1">
              {item.value.toString().padStart(2, '0')}
            </div>
            <div className="text-white/90 text-xs font-medium uppercase">
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* Indicateurs */}
      <div className="flex items-center justify-center space-x-4">
        <div className="flex items-center space-x-2 bg-white/20 px-3 py-2 rounded-lg border border-white/30">
          <Activity className="w-4 h-4 text-white" />
          <span className="text-white font-medium text-sm">Temps réel</span>
        </div>

        <div className="flex items-center space-x-2 bg-white/20 px-3 py-2 rounded-lg border border-white/30">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
            <div className="w-1 h-1 bg-white rounded-full animate-pulse delay-150"></div>
            <div className="w-1 h-1 bg-white rounded-full animate-pulse delay-300"></div>
          </div>
          <span className="text-white font-medium text-sm">Synchronisé</span>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;