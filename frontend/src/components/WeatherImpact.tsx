import { Cloud, CloudRain, CloudFog, Sun, CloudLightning, Wind } from 'lucide-react';
import type { AIWeatherData } from '@/lib/types';

interface WeatherImpactProps {
  weather: AIWeatherData;
  compact?: boolean;
}

const weatherIcons: Record<string, any> = {
  sun: Sun,
  cloud: Cloud,
  'cloud-rain': CloudRain,
  'cloud-fog': CloudFog,
  'cloud-lightning': CloudLightning,
  wind: Wind,
};

const WeatherImpact = ({ weather, compact = false }: WeatherImpactProps) => {
  const Icon = weatherIcons[weather.icon] || Cloud;
  const routeDelay = weather.routeImpact?.totalDelay || 0;

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 ${weather.bg} px-2 py-1 rounded-lg`}>
        <Icon size={11} strokeWidth={2.5} className={weather.color} />
        <span className={`text-[10px] font-bold ${weather.color}`}>
          {weather.label}
          {routeDelay > 0 && <span className="ml-0.5">+{routeDelay}min</span>}
        </span>
      </div>
    );
  }

  return (
    <div className={`${weather.bg} rounded-xl p-3 border ${weather.color.replace('text-', 'border-').replace('-600', '-200').replace('-500', '-200')}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon size={16} strokeWidth={2.5} className={weather.color} />
          <span className={`text-xs font-bold ${weather.color}`}>{weather.label}</span>
        </div>
        <span className="text-xs font-semibold text-gray-500">{weather.temperature}°C</span>
      </div>
      {routeDelay > 0 && (
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
            +{routeDelay} min delay expected
          </span>
        </div>
      )}
      {weather.impacts && weather.impacts.length > 0 && (
        <ul className="space-y-0.5">
          {weather.impacts.map((impact, i) => (
            <li key={i} className="text-[10px] text-gray-500 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              {impact}
            </li>
          ))}
        </ul>
      )}
      {!compact && (
        <div className="flex items-center gap-3 mt-2 pt-2 border-t border-white/50">
          <div className="text-[10px] text-gray-500">
            <span className="font-semibold">Humidity:</span> {weather.humidity}%
          </div>
          <div className="text-[10px] text-gray-500">
            <span className="font-semibold">Visibility:</span> {weather.visibility}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherImpact;
