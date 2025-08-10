import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText } from 'lucide-react';
import { StepWrapper } from '../layout/step-wrapper';

interface MenuStepProps {
  onUpload: () => void;
  onPaste: () => void;
}

export function MenuStep({ onUpload, onPaste }: MenuStepProps) {
  return (
    <StepWrapper>
      <Card className="w-full h-full py-16">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-white mb-2">
            Resume Generator
          </CardTitle>
          <CardDescription className="text-lg text-gray-400">
            Create a professional resume tailored to your needs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={onUpload}
              className="h-32 flex flex-col items-center justify-center space-y-2 bg-white hover:bg-gray-50 border-2 border-dashed border-gray-300 hover:border-gray-400 cursor-pointer"
              variant="outline"
            >
              <Upload className="h-8 w-8 text-blue-600" />
              <span className="font-semibold">Upload Resume</span>
              <span className="text-sm text-gray-500">Upload your existing resume</span>
            </Button>
            
            <Button
              onClick={onPaste}
              className="h-32 flex flex-col items-center justify-center space-y-2 bg-white hover:bg-gray-50 border-2 border-dashed border-gray-300 hover:border-gray-400 cursor-pointer"
              variant="outline"
            >
              <FileText className="h-8 w-8 text-green-600" />
              <span className="font-semibold">Paste Resume</span>
              <span className="text-sm text-gray-500">Paste your resume content</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </StepWrapper>
  );
} 