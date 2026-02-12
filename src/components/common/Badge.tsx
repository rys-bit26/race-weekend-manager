interface BadgeProps {
  label: string;
  color: string;
  bgColor: string;
  small?: boolean;
}

export function Badge({ label, color, bgColor, small }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${
        small ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'
      }`}
      style={{ color, backgroundColor: bgColor }}
    >
      {label}
    </span>
  );
}
