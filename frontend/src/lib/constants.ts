import type { TransportMode } from './types';

export const MODE_COLORS: Record<TransportMode, string> = {
  metro: 'bg-fc-metro',
  bus: 'bg-fc-bus',
  walk: 'bg-fc-walk',
  auto: 'bg-fc-auto',
  ferry: 'bg-fc-ferry',
  cycle: 'bg-fc-cycle',
};

export const MODE_TEXT_COLORS: Record<TransportMode, string> = {
  metro: 'text-fc-metro',
  bus: 'text-fc-bus',
  walk: 'text-fc-walk',
  auto: 'text-fc-auto',
  ferry: 'text-fc-ferry',
  cycle: 'text-fc-cycle',
};

export const MODE_BORDER_COLORS: Record<TransportMode, string> = {
  metro: 'border-fc-metro',
  bus: 'border-fc-bus',
  walk: 'border-fc-walk',
  auto: 'border-fc-auto',
  ferry: 'border-fc-ferry',
  cycle: 'border-fc-cycle',
};

export const MODE_ICONS: Record<TransportMode, string> = {
  metro: '🚇',
  bus: '🚌',
  walk: '🚶',
  auto: '🛺',
  ferry: '⛴',
  cycle: '🚲',
};
