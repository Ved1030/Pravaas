interface StatBlockProps {
  value: string;
  label: string;
  color?: string;
}

const StatBlock = ({ value, label, color = 'text-text-primary' }: StatBlockProps) => (
  <div className="brutal-card p-6 flex flex-col items-center justify-center">
    <span className={`font-display text-[28px] font-extrabold ${color}`}>{value}</span>
    <span className="font-mono-label text-[10px] text-text-muted-fc uppercase tracking-widest mt-1">{label}</span>
  </div>
);

export default StatBlock;
