'use client';

import { useState } from 'react';
import { downloadResumeAsPDF } from '@/lib/pdf-utils';
import {
  MenuStep,
  UploadStep,
  ManualStep,
  JDStep,
  PreviewStep,
  ResumeGeneratorWrapper
} from '@/components/resume-generator';

type Step = 'menu' | 'upload' | 'manual' | 'jd' | 'preview';

interface ResumeData {
  content: string;
  jobDescription?: string;
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>('menu');
  const [resumeData, setResumeData] = useState<ResumeData>({ content: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResume, setGeneratedResume] = useState<string>('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setResumeData({ content });
        setCurrentStep('jd');
      };
      reader.readAsText(file);
    }
  };

  const handleManualInput = (content: string) => {
    setResumeData({ content });
    setCurrentStep('jd');
  };

  const handleJDSubmit = (jd: string) => {
    setResumeData(prev => ({ ...prev, jobDescription: jd }));
    generateResume();
  };

  const generateResume = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resumeData),
      });
      
      if (response.ok) {
        const result = await response.json();
        setGeneratedResume(result.resume);
        setCurrentStep('preview');
      }
    } catch (error) {
      console.error('Error generating resume:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = async () => {
    if (generatedResume) {
      await downloadResumeAsPDF(generatedResume, 'resume.pdf');
    }
  };

  const handleGenerateNew = () => {
    setCurrentStep('menu');
    setResumeData({ content: '' });
    setGeneratedResume('');
  };

  return (
    <ResumeGeneratorWrapper>
      {(() => {
        switch (currentStep) {
          case 'menu':
            return (
              <MenuStep
                onUpload={() => setCurrentStep('upload')}
                onManual={() => setCurrentStep('manual')}
              />
            );
          case 'upload':
            return (
              <UploadStep
                onFileUpload={handleFileUpload}
                onBack={() => setCurrentStep('menu')}
              />
            );
          case 'manual':
            return (
              <ManualStep
                onSubmit={handleManualInput}
                onBack={() => setCurrentStep('menu')}
              />
            );
          case 'jd':
            return (
              <JDStep
                onSubmit={handleJDSubmit}
                onSkip={() => generateResume()}
              />
            );
          case 'preview':
            return (
              <PreviewStep
                isGenerating={isGenerating}
                generatedResume={generatedResume}
                onDownload={downloadPDF}
                onGenerateNew={handleGenerateNew}
              />
            );
          default:
            return (
              <MenuStep
                onUpload={() => setCurrentStep('upload')}
                onManual={() => setCurrentStep('manual')}
              />
            );
        }
      })()}
    </ResumeGeneratorWrapper>
  );
}
