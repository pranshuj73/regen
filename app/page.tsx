'use client';

import { useState } from 'react';
import {
  MenuStep,
  UploadStep,
  PasteStep,
  UpdatesStep,
  JDStep,
  PreviewStep,
  ResumeGeneratorWrapper,
  StepWrapper
} from '@/components/resume-generator';

type Step = 'menu' | 'upload' | 'paste' | 'updates' | 'jd' | 'preview';

interface NavigationHistory {
  step: Step;
  resumeData: ResumeData;
  generatedResume: any;
  isGenerating: boolean;
}

interface ResumeData {
  content: string;
  updates?: string;
  jobDescription?: string;
}

export default function Home() {
  const [navigationHistory, setNavigationHistory] = useState<NavigationHistory[]>([
    { 
      step: 'menu', 
      resumeData: { content: '' }, 
      generatedResume: '', 
      isGenerating: false 
    }
  ]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);
  
  // Get current state from navigation history
  const currentHistory = navigationHistory[currentHistoryIndex];
  const currentStep = currentHistory.step;
  const resumeData = currentHistory.resumeData;
  const isGenerating = currentHistory.isGenerating;
  const generatedResume = currentHistory.generatedResume;

  // Helper functions to update current step state
  const updateCurrentStep = (updates: Partial<Omit<NavigationHistory, 'step'>>) => {
    setNavigationHistory(prev => {
      const newHistory = [...prev];
      newHistory[currentHistoryIndex] = {
        ...newHistory[currentHistoryIndex],
        ...updates
      };
      return newHistory;
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
          // Handle PDF files
          try {
            const response = await fetch('/api/parse-pdf', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                filename: file.name,
                data: Array.from(new Uint8Array(arrayBuffer))
              }),
            });
            
            if (response.ok) {
              const result = await response.json();
              const newResumeData = { content: result.text };
              navigateTo('updates', { resumeData: newResumeData });
            } else {
              alert('Failed to parse PDF. Please try copying and pasting the text content instead.');
            }
          } catch (error) {
            console.error('Error parsing PDF:', error);
            alert('Failed to parse PDF. Please try copying and pasting the text content instead.');
          }
        } else {
          // Handle text files
          const content = new TextDecoder().decode(arrayBuffer);
          const newResumeData = { content };
          navigateTo('updates', { resumeData: newResumeData });
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handlePasteInput = (content: string) => {
    const newResumeData = { content };
    navigateTo('updates', { resumeData: newResumeData });
  };

  const handleUpdatesSubmit = (updates: string) => {
    const newResumeData = { ...resumeData, updates };
    navigateTo('jd', { resumeData: newResumeData });
  };

  const handleJDSubmit = (jd: string) => {
    const newResumeData = { ...resumeData, jobDescription: jd };
    updateCurrentStep({ resumeData: newResumeData });
    generateResume();
  };

  const generateResume = async () => {
    updateCurrentStep({ isGenerating: true });
    try {
      console.log('Sending resume data:', resumeData);
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resumeData),
      });
      
      if (response.ok) {
        const result = await response.json();
        navigateTo('preview', { resumeData, generatedResume: result.data, isGenerating: false });
      }
    } catch (error) {
      console.error('Error generating resume:', error);
      updateCurrentStep({ isGenerating: false });
    }
  };

  const handleGenerateNew = () => {
    setNavigationHistory([{ step: 'menu' }]);
    setCurrentStep('menu');
  };

  const navigateTo = (step: Step, updates?: Partial<Omit<NavigationHistory, 'step'>>) => {
    const newHistoryItem: NavigationHistory = {
      step,
      resumeData: updates?.resumeData || resumeData,
      generatedResume: updates?.generatedResume || generatedResume,
      isGenerating: updates?.isGenerating || false
    };
    
    // Remove any forward history if we're navigating to a new step
    const newHistory = navigationHistory.slice(0, currentHistoryIndex + 1);
    newHistory.push(newHistoryItem);
    
    setNavigationHistory(newHistory);
    setCurrentHistoryIndex(newHistory.length - 1);
  };

  const goBack = () => {
    if (currentHistoryIndex > 0) {
      setCurrentHistoryIndex(currentHistoryIndex - 1);
    }
  };

  const goForward = () => {
    if (currentHistoryIndex < navigationHistory.length - 1) {
      setCurrentHistoryIndex(currentHistoryIndex + 1);
    }
  };

  const canGoBack = currentHistoryIndex > 0;
  const canGoForward = currentHistoryIndex < navigationHistory.length - 1;

  return (
    <div className="print:hidden">
      <ResumeGeneratorWrapper>
        {(() => {
        switch (currentStep) {
          case 'menu':
            return (
              <StepWrapper showBackButton={canGoBack} onBack={goBack}>
                <MenuStep
                  onUpload={() => navigateTo('upload')}
                  onPaste={() => navigateTo('paste')}
                />
              </StepWrapper>
            );
          case 'upload':
            return (
              <StepWrapper showBackButton={canGoBack} onBack={goBack}>
                <UploadStep
                  onFileUpload={handleFileUpload}
                  onPasteResume={() => navigateTo('paste')}
                />
              </StepWrapper>
            );
          case 'paste':
            return (
              <StepWrapper showBackButton={canGoBack} onBack={goBack}>
                <PasteStep
                  onSubmit={handlePasteInput}
                  onUploadResume={() => navigateTo('upload')}
                />
              </StepWrapper>
            );
          case 'updates':
            return (
              <StepWrapper showBackButton={canGoBack} onBack={goBack}>
                <UpdatesStep
                  onSubmit={handleUpdatesSubmit}
                  onBack={() => navigateTo('paste')}
                />
              </StepWrapper>
            );
          case 'jd':
            return (
              <StepWrapper showBackButton={canGoBack} onBack={goBack}>
                <JDStep
                  onSubmit={handleJDSubmit}
                  onSkip={() => generateResume()}
                />
              </StepWrapper>
            );
          case 'preview':
            return (
              <StepWrapper showBackButton={canGoBack} onBack={goBack}>
                <PreviewStep
                  isGenerating={isGenerating}
                  generatedResume={generatedResume}
                  onDownload={() => {}}
                  onGenerateNew={handleGenerateNew}
                />
              </StepWrapper>
            );
          default:
            return (
              <StepWrapper showBackButton={canGoBack} onBack={goBack}>
                <MenuStep
                  onUpload={() => navigateTo('upload')}
                  onPaste={() => navigateTo('paste')}
                />
              </StepWrapper>
            );
        }
      })()}
      </ResumeGeneratorWrapper>
    </div>
  );
}
