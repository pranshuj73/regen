import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StepWrapper } from './step-wrapper';
import { ManualInputForm } from './manual-input-form';

interface PasteStepProps {
  onSubmit: (content: string) => void;
  onUploadResume: () => void;
}

export function PasteStep({ onSubmit, onUploadResume }: PasteStepProps) {
  const [useStructuredFields, setUseStructuredFields] = useState(false);
  const [resumeContent, setResumeContent] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(resumeContent);
  };

  const handleStructuredSubmit = (content: string) => {
    onSubmit(content);
  };

  return (
    <StepWrapper>
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle>Paste Your Resume</CardTitle>
          <CardDescription>
            Paste your resume content or use structured fields for better organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label className="text-sm font-medium">
                {useStructuredFields ? "Structured Form" : "Simple Paste"}
              </Label>
              <p className="text-xs text-gray-500">
                {useStructuredFields 
                  ? "Organize your information in structured fields" 
                  : "Just paste your resume content"
                }
              </p>
            </div>
            <Button
              type="button"
              variant={useStructuredFields ? "default" : "outline"}
              onClick={() => setUseStructuredFields(!useStructuredFields)}
              className="ml-4 cursor-pointer"
            >
              {useStructuredFields ? "Switch to Simple Paste" : "Switch to Structured Form"}
            </Button>
          </div>

          {useStructuredFields ? (
            <ManualInputForm onSubmit={handleStructuredSubmit} />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="resume-content" className="mb-2">Resume Content</Label>
                <Textarea
                  id="resume-content"
                  value={resumeContent}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setResumeContent(e.target.value)}
                  rows={12}
                  placeholder="Paste your resume content here... You can include all sections like experience, education, skills, etc."
                  required
                />
              </div>
              <Button type="submit" className="w-full cursor-pointer">
                Continue
              </Button>
            </form>
          )}
          
          <div className="text-center">
            <span className="text-sm text-gray-500">or</span>
          </div>
          
          <Button
            onClick={onUploadResume}
            variant="outline"
            className="w-full cursor-pointer"
          >
            Upload Resume Instead
          </Button>
        </CardContent>
      </Card>
    </StepWrapper>
  );
} 