import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Check, X } from 'lucide-react';
import { generateLatexResume } from '@/lib/latex-utils';
import { ResumeSchemaType } from '@/schema/resume';

interface LatexViewerProps {
  data: ResumeSchemaType;
  onClose: () => void;
}

export function LatexViewer({ data, onClose }: LatexViewerProps) {
  const [copied, setCopied] = useState(false);
  const latexContent = generateLatexResume(data);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(latexContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>LaTeX Resume</CardTitle>
            <CardDescription>
              Copy the LaTeX code below to compile your resume
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleCopy}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy LaTeX
                </>
              )}
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="cursor-pointer"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="bg-gray-900 text-green-400 p-4 overflow-auto max-h-[70vh] font-mono text-sm">
            <Textarea
              value={latexContent}
              readOnly
              className="bg-transparent border-none text-green-400 font-mono text-sm resize-none h-full min-h-[60vh] focus:ring-0 focus:outline-none"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 