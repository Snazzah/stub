import { ReactNode } from 'react';

export default function MaxWidthWrapper({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={`w-full max-w-screen-xl mx-auto px-5 md:px-20 ${className}`}>{children}</div>;
}
