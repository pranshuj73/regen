import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { StepWrapper } from './step-wrapper';

interface UpdatesStepProps {
  onSubmit: (updates: string) => void;
  onBack: () => void;
}

const commonUpdates = [
  {
    id: 'formatting',
    label: 'Improve formatting and layout',
    description: 'Make the resume more visually appealing and professional'
  },
  {
    id: 'ats',
    label: 'Optimize for ATS (Applicant Tracking Systems)',
    description: 'Ensure the resume passes through automated screening systems'
  },
  {
    id: 'achievements',
    label: 'Enhance achievements and impact',
    description: 'Add quantifiable results and specific accomplishments'
  },
  {
    id: 'skills',
    label: 'Update and organize skills',
    description: 'Reorganize skills to match job requirements'
  },
  {
    id: 'summary',
    label: 'Improve professional summary',
    description: 'Create a compelling and targeted summary'
  },
  {
    id: 'language',
    label: 'Improve language and clarity',
    description: 'Use more powerful and clear language throughout'
  }
];

export function UpdatesStep({ onSubmit, onBack }: UpdatesStepProps) {
  const [selectedUpdates, setSelectedUpdates] = useState<string[]>([]);
  const [customUpdates, setCustomUpdates] = useState('');

  const handleUpdateToggle = (updateId: string) => {
    setSelectedUpdates(prev => 
      prev.includes(updateId) 
        ? prev.filter(id => id !== updateId)
        : [...prev, updateId]
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const selectedDescriptions = commonUpdates
      .filter(update => selectedUpdates.includes(update.id))
      .map(update => update.description);
    
    const allUpdates = [
      ...selectedDescriptions,
      customUpdates
    ].filter(Boolean).join('\n');
    
    onSubmit(allUpdates);
  };

  return (
    <StepWrapper>
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle>What updates would you like to make?</CardTitle>
          <CardDescription>
            Select common updates or describe your specific requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label className="text-base font-semibold">Common Updates</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {commonUpdates.map((update) => (
                <div 
                  key={update.id} 
                  className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-800"
                  onClick={() => handleUpdateToggle(update.id)}
                >
                  <Checkbox
                    id={update.id}
                    checked={selectedUpdates.includes(update.id)}
                    onCheckedChange={() => handleUpdateToggle(update.id)}
                    className="cursor-pointer"
                  />
                  <div className="space-y-1">
                    <Label 
                      htmlFor={update.id} 
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {update.label}
                    </Label>
                    <p className="text-xs text-gray-500">{update.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="custom-updates" className="mb-2">Additional Requirements (Optional)</Label>
              <Textarea
                id="custom-updates"
                value={customUpdates}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCustomUpdates(e.target.value)}
                rows={4}
                placeholder="Describe any specific changes you'd like to make to your resume..."
              />
            </div>

            <div className="flex space-x-2">
              <Button type="submit" className="flex-1 cursor-pointer">
                Continue to Job Description
              </Button>
              <Button type="button" onClick={onBack} variant="outline" className="flex-1 cursor-pointer">
                Back
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </StepWrapper>
  );
} 