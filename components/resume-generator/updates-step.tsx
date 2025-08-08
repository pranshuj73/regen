import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { StepWrapper } from './step-wrapper';

interface UpdatesStepProps {
  onSubmit: (updates: string) => void;
  onSubmitWithMeta?: (meta: { selectedIds: string[]; customUpdates: string; combinedText: string }) => void;
  // Optional initial values so the step can hydrate when navigating back
  initialSelectedIds?: string[];
  initialCustomUpdates?: string;
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

export function UpdatesStep({ onSubmit, onSubmitWithMeta, initialSelectedIds, initialCustomUpdates }: UpdatesStepProps) {
  const [selectedUpdates, setSelectedUpdates] = useState<string[]>(initialSelectedIds || []);
  const [customUpdates, setCustomUpdates] = useState(initialCustomUpdates || '');

  // Ensure hydration if props change
  useEffect(() => {
    if (initialSelectedIds) setSelectedUpdates(initialSelectedIds);
  }, [initialSelectedIds]);
  useEffect(() => {
    if (initialCustomUpdates !== undefined) setCustomUpdates(initialCustomUpdates);
  }, [initialCustomUpdates]);

    const handleUpdateToggle = (updateId: string) => {
    setSelectedUpdates(prev => {
      const newSelection = prev.includes(updateId)
        ? prev.filter(id => id !== updateId)
        : [...prev, updateId];
      return newSelection;
    });
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
    onSubmitWithMeta?.({ selectedIds: selectedUpdates, customUpdates, combinedText: allUpdates });
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
                  className="flex text-left items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-800"
                  onClick={() => handleUpdateToggle(update.id)}
                >
                  <Checkbox
                    id={update.id}
                    checked={selectedUpdates.includes(update.id)}
                    className="pointer-events-none"
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

            <Button type="submit" className="w-full cursor-pointer">
              Continue to Job Description
            </Button>
          </form>
        </CardContent>
      </Card>
    </StepWrapper>
  );
} 