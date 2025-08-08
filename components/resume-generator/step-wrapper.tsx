import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface StepWrapperProps {
  children: ReactNode;
  onBack?: () => void;
  onForward?: () => void;
  showBackButton?: boolean;
  showForwardButton?: boolean;
}

export function StepWrapper({ 
  children, 
  onBack, 
  onForward, 
  showBackButton = false, 
  showForwardButton = false 
}: StepWrapperProps) {
  return (
    <div className="w-full max-w-4xl">
      {/* Navigation Bar */}
      {(showBackButton || showForwardButton) && (
        <div className="flex justify-between items-center mb-4 px-4">
          <div className="flex gap-2">
            {showBackButton && onBack && (
              <Button
                onClick={onBack}
                variant="ghost"
                size="sm"
                className="cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            {showForwardButton && onForward && (
              <Button
                onClick={onForward}
                variant="ghost"
                size="sm"
                className="cursor-pointer"
              >
                Forward
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      )}
      
      {/* Content */}
      <div className="flex flex-col justify-center p-4">
        {children}
      </div>
    </div>
  );
} 