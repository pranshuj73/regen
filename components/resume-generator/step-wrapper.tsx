import { ReactNode } from 'react';

interface StepWrapperProps {
  children: ReactNode;
}

export function StepWrapper({ children }: StepWrapperProps) {
  return (
    <div className="flex items-center justify-center p-4 w-full max-w-4xl min-h-[800px]">
      {children}
    </div>
  );
} 