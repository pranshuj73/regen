import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';
import { StepWrapper } from './step-wrapper';

interface UploadStepProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBack: () => void;
}

export function UploadStep({ onFileUpload, onBack }: UploadStepProps) {
  return (
    <StepWrapper>
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle>Upload Your Resume</CardTitle>
          <CardDescription>
            Upload your existing resume to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-64 flex flex-col items-center justify-center space-y-2 bg-gray-800 hover:bg-gray-700 border-2 border-dashed border-gray-600 hover:border-gray-500 rounded-lg cursor-pointer">
            <Upload className="h-8 w-8 text-blue-600" />
            <Label htmlFor="resume-upload" className="cursor-pointer">
              <div className="flex flex-col gap-2 text-center">
                <span className="font-semibold">Upload Resume</span>
                <span className="text-sm text-gray-500 block">PDF, DOC, DOCX, or TXT files</span>
              </div>
            </Label>
            <Input
              id="resume-upload"
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={onFileUpload}
              className="hidden"
            />
          </div>
          <Button
            onClick={onBack}
            variant="outline"
            className="w-full"
          >
            Back to Menu
          </Button>
        </CardContent>
      </Card>
    </StepWrapper>
  );
} 