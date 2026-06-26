import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, CloudSun, Droplets, Wind, Eye, Compass, CloudRain } from 'lucide-react';

interface WeatherForecast {
  day: string;
  temp: number;
  condition: string;
  icon: React.ReactNode;
}

export const WeatherStatus: React.FC = () => {
  const [currentTemp, setCurrentTemp] = useState(24.2);
  const [humidity, setHumidity] = useState(62);
  const [windSpeed, setWindSpeed] = useState(12);
  const [pressure, setPressure] = useState(1013);
  const [visibility, setVisibility] = useState(10);

  // Fluctuations to make telemetry feel active and real
  useEffect(() => {
    const iv = setInterval(() => {
      setCurrentTemp(t => Number((t + (Math.random() - 0.5) * 0.4).toFixed(1)));
      setHumidity(h => Math.max(30, Math.min(95, h + Math.round((Math.random() - 0.5) * 2))));
      setWindSpeed(w => Math.max(3, Math.min(25, w + Math.round((Math.random() - 0.5) * 2))));
      setPressure(p => Math.max(990, Math.min(1030, p + Math.round((Math.random() - 0.5) * 2))));
    }, 4000);
    return () => clearInterval(iv);
  }, []);

  const forecast: WeatherForecast[] = [
    { day: 'TODAY', temp: 24, condition: 'CLEAR', icon: <Sun className="w-3.5 h-3.5 text-yellow-400" /> },
    { day: 'TOMORROW', temp: 26, condition: 'SUNNY', icon: <CloudSun className="w-3.5 h-3.5 text-cyan-300 animate-pulse" /> },
    { day: 'SATURDAY', temp: 23, condition: 'CLOUDY', icon: <CloudSun className="w-3.5 h-3.5 text-gray-400" /> },
  ];

  return (
    <div className="flex flex-col space-y-3 font-sharetech text-[10px]">
      
      {/* Current atmospheric status banner */}
      <div className="bg-black/25 border border-white/5 rounded-md p-2.5 flex items-center justify-between hover:border-white/10 transition-colors">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 relative">
            <Sun className="w-4 h-4 animate-spin" style={{ animationDuration: '20s' }} />
            <span className="absolute inset-0 rounded bg-cyan-400/5 animate-ping pointer-events-none" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[6px] text-gray-600 tracking-widest uppercase">Atmosphere</span>
            <span className="text-[11px] font-bold text-white uppercase tracking-wider mt-0.5">CLEAR SKIES</span>
          </div>
        </div>
        <div className="flex flex-col items-end leading-none">
          <span className="text-[6px] text-gray-600 tracking-widest uppercase">Thermal Index</span>
          <span className="font-orbitron font-black text-cyan-300 text-glow-cyan text-base mt-1.5">
            {currentTemp.toFixed(1)}°C
          </span>
        </div>
      </div>

      {/* Primary sensor grids */}
      <div className="grid grid-cols-2 gap-2">
        {/* Humidity */}
        <div className="bg-black/25 border border-white/5 rounded-md p-2 flex items-center space-x-2 hover:border-white/10 transition-colors">
          <Droplets className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
          <div className="flex flex-col leading-none w-full">
            <span className="text-[6px] text-gray-600 tracking-wider uppercase mb-0.5">Humidity</span>
            <div className="flex items-center justify-between">
              <span className="font-orbitron font-bold text-white text-[9px]">{humidity}%</span>
              <span className="text-[6px] text-blue-400/60 uppercase font-bold">Stable</span>
            </div>
            <div className="h-0.5 w-full bg-white/5 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${humidity}%` }} />
            </div>
          </div>
        </div>

        {/* Wind velocity */}
        <div className="bg-black/25 border border-white/5 rounded-md p-2 flex items-center space-x-2 hover:border-white/10 transition-colors">
          <Wind className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
          <div className="flex flex-col leading-none w-full">
            <span className="text-[6px] text-gray-600 tracking-wider uppercase mb-0.5">Wind Velocity</span>
            <div className="flex items-center justify-between">
              <span className="font-orbitron font-bold text-white text-[9px]">{windSpeed} km/h</span>
              <span className="text-[6px] text-teal-400/60 uppercase font-bold">NE</span>
            </div>
            <div className="h-0.5 w-full bg-white/5 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-teal-500 rounded-full transition-all duration-500" style={{ width: `${(windSpeed/30)*100}%` }} />
            </div>
          </div>
        </div>

        {/* Barometric Pressure */}
        <div className="bg-black/25 border border-white/5 rounded-md p-2 flex items-center space-x-2 hover:border-white/10 transition-colors">
          <Compass className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
          <div className="flex flex-col leading-none w-full">
            <span className="text-[6px] text-gray-600 tracking-wider uppercase mb-0.5">Barometer</span>
            <div className="flex items-center justify-between">
              <span className="font-orbitron font-bold text-white text-[9px]">{pressure} hPa</span>
              <span className="text-[6px] text-orange-400/60 uppercase font-bold">Normal</span>
            </div>
            <div className="h-0.5 w-full bg-white/5 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-orange-500 rounded-full transition-all duration-500" style={{ width: `${((pressure - 980) / 70) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Visibility */}
        <div className="bg-black/25 border border-white/5 rounded-md p-2 flex items-center space-x-2 hover:border-white/10 transition-colors">
          <Eye className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
          <div className="flex flex-col leading-none w-full">
            <span className="text-[6px] text-gray-600 tracking-wider uppercase mb-0.5">Visibility</span>
            <div className="flex items-center justify-between">
              <span className="font-orbitron font-bold text-white text-[9px]">{visibility} km</span>
              <span className="text-[6px] text-purple-400/60 uppercase font-bold">Max</span>
            </div>
            <div className="h-0.5 w-full bg-white/5 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* 3-Day Forecast Panel */}
      <div className="bg-black/25 border border-white/5 rounded-md p-2 flex flex-col space-y-2">
        <span className="text-[6px] text-gray-600 tracking-widest uppercase border-b border-cyan-500/10 pb-1 mb-1 leading-none font-bold">
          // METEOROLOGICAL PREDICTIONS (72H)
        </span>
        {forecast.map((f, i) => (
          <div key={f.day} className="flex items-center justify-between py-0.5 hover:bg-white/2 px-1 rounded transition-colors">
            <div className="flex items-center space-x-2">
              {f.icon}
              <span className="text-white tracking-wider font-bold">{f.day}</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-gray-500 text-[7px] uppercase font-mono">{f.condition}</span>
              <span className="font-orbitron font-bold text-cyan-400 w-8 text-right">{f.temp}°C</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
