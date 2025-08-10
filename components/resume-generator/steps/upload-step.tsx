import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';
import { StepWrapper } from '../layout/step-wrapper';

interface UploadStepProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPasteResume: () => void;
}

export function UploadStep({ onFileUpload, onPasteResume }: UploadStepProps) {
  return (
    <StepWrapper>
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle>Upload Your Resume</CardTitle>
          <CardDescription>
            Upload your existing resume to get started
          </CardDescription>
          <div className="text-xs text-amber-500 bg-amber-50 dark:bg-amber-950/20 p-2 rounded">
            <strong>Note:</strong> PDF parsing extracts text only. URLs and links may need to be added manually in the next step.
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <button 
            className="h-64 w-full flex flex-col items-center justify-center space-y-2 bg-gray-800 hover:bg-gray-700 border-2 border-dashed border-gray-600 hover:border-gray-500 rounded-lg cursor-pointer"
            onClick={() => document.getElementById('resume-upload')?.click()}
          >
            <Upload className="h-8 w-8 text-blue-600" />
            <div className="flex flex-col gap-2 text-center">
              <span className="font-semibold">Upload Resume</span>
              <span className="text-sm text-gray-500 block">PDF, TXT, DOC, or DOCX files</span>
            </div>
            <Input
              id="resume-upload"
              type="file"
              accept=".pdf,.txt,.doc,.docx"
              onChange={onFileUpload}
              className="hidden"
            />
          </button>
          
          <div className="text-center">
            <span className="text-sm text-gray-500">or</span>
          </div>
          
          <Button
            onClick={onPasteResume}
            variant="outline"
            className="w-full cursor-pointer"
          >
            Paste Resume Content
          </Button>

        </CardContent>
      </Card>
    </StepWrapper>
  );
} 