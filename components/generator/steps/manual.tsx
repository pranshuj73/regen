import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ManualInputForm } from '../forms/manual-input-form';

interface ManualStepProps {
  onSubmit: (content: string) => void;
  onBack: () => void;
}

export function ManualStep({ onSubmit, onBack }: ManualStepProps) {
  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Enter Your Details</CardTitle>
        <CardDescription>
          Provide your information to generate a resume
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ManualInputForm onSubmit={onSubmit} />
        <Button
          onClick={onBack}
          variant="outline"
          className="w-full"
        >
          Back to Menu
        </Button>
      </CardContent>
    </Card>
  );
}
