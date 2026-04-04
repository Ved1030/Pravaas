import { RouteSegment } from '@/lib/types';

interface SegmentBarProps {
  segments: RouteSegment[];
  showLabels?: boolean;
}

const modernModeColors: Record<string, string> = {
  metro: 'bg-blue-500 hover:bg-blue-400',
  bus: 'bg-amber-500 hover:bg-amber-400',
  auto: 'bg-emerald-500 hover:bg-emerald-400',
  walk: 'bg-gray-400 hover:bg-gray-300',
};

const SegmentBar = ({ segments, showLabels = true }: SegmentBarProps) => {
  const total = segments.reduce((s, seg) => s + seg.duration, 0);

  return (
    <div className="w-full group">
      <div className="flex gap-1 w-full h-2.5 rounded-full overflow-hidden bg-gray-50">
        {segments.map((seg, i) => (
          <div
            key={i}
            className={`${modernModeColors[seg.mode] || 'bg-gray-400'} h-full transition-all duration-300 shadow-[inset_0_1px_rgba(255,255,255,0.2)]`}
            style={{ width: `${(seg.duration / total) * 100}%` }}
            title={`${seg.label} (${seg.duration}m)`}
          />
        ))}
      </div>
      {showLabels && (
        <div className="flex gap-1 w-full mt-2">
          {segments.map((seg, i) => {
            const width = (seg.duration / total) * 100;
            // Only show text if segment is wide enough, otherwise just keep the spacing
            return (
              <div
                key={i}
                className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate flex-shrink-0"
                style={{ width: `${width}%` }}
              >
                {width >= 15 ? seg.label : ''}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SegmentBar;
