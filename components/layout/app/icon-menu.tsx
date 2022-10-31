import { ReactNode } from 'react';

interface IconMenuProps {
  icon: ReactNode;
  text: string;
}

export default function IconMenu({ icon, text }: IconMenuProps) {
  return (
    <div className="flex items-center justify-start space-x-2">
      {icon}
      <p className="text-sm">{text}</p>
    </div>
  );
}
