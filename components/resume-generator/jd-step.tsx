import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { JDInputForm } from './jd-input-form';
import { StepWrapper } from './step-wrapper';

interface JDStepProps {
  onSubmit: (jd: string) => void;
  onSkip: () => void;
  initialJD?: string;
  onChangeJD?: (text: string) => void;
}

export function JDStep({ onSubmit, onSkip, initialJD, onChangeJD }: JDStepProps) {
  return (
    <StepWrapper>
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle>Job Description (Optional)</CardTitle>
          <CardDescription>
            Provide a job description to tailor your resume specifically
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <JDInputForm onSubmit={onSubmit} onSkip={onSkip} initialJD={initialJD} onChangeJD={onChangeJD} />
        </CardContent>
      </Card>
    </StepWrapper>
  );
} 