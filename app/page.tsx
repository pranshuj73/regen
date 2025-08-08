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

interface PageState {
  upload?: { content: string };
  updates?: { selectedIds: string[]; customUpdates: string; combinedText: string };
  jd?: { text: string };
}

interface NavState {
  history: Step[];
  pageState: PageState;
}

export default function Home() {
  const [navState, setNavState] = useState<NavState>({
    history: ['menu'],
    pageState: {
      upload: { content: '' },
      updates: { selectedIds: [], customUpdates: '', combinedText: '' },
      jd: { text: '' },
    },
  });
  const [generatedResume, setGeneratedResume] = useState<any>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const currentStep = navState.history[navState.history.length - 1];

  // DEBUG LOGGING REMOVED



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
              setNavState(prev => ({
                ...prev,
                pageState: { ...prev.pageState, upload: { content: result.text } },
                history: [...prev.history, 'updates'],
              }));
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
          setNavState(prev => ({
            ...prev,
            pageState: { ...prev.pageState, upload: { content } },
            history: [...prev.history, 'updates'],
          }));
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handlePasteInput = (content: string) => {
    setNavState(prev => ({
      ...prev,
      pageState: { ...prev.pageState, upload: { content } },
      history: [...prev.history, 'updates'],
    }));
  };

  const handleUpdatesSubmit = (updates: string) => {
    setNavState(prev => ({
      ...prev,
      pageState: {
        ...prev.pageState,
        updates: {
          selectedIds: prev.pageState.updates?.selectedIds || [],
          customUpdates: prev.pageState.updates?.customUpdates || '',
          combinedText: updates,
        },
      },
      history: [...prev.history, 'jd'],
    }));
  };

  const handleUpdatesPersist = (meta: { selectedIds: string[]; customUpdates: string; combinedText: string }) => {
    setNavState(prev => ({
      ...prev,
      pageState: { ...prev.pageState, updates: meta },
    }));
  };

  const handleJDSubmit = (jd: string) => {
    setNavState(prev => ({
      ...prev,
      pageState: { ...prev.pageState, jd: { text: jd } },
    }));
    setTimeout(() => generateResume(), 0);
  };

  const handleJDChange = (text: string) => {
    setNavState(prev => ({
      ...prev,
      pageState: { ...prev.pageState, jd: { text } },
    }));
  };

  const generateResume = async () => {
    // Update to show generating state
    setIsGenerating(true);

    try {
      const payload = {
        content: navState.pageState.upload?.content || '',
        updates: navState.pageState.updates?.combinedText || '',
        jobDescription: navState.pageState.jd?.text || '',
      };
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        const result = await response.json();
        setGeneratedResume(result.data);
        setIsGenerating(false);
        setNavState(prev => ({ ...prev, history: [...prev.history, 'preview'] }));
      }
    } catch (error) {
      // noop
      setIsGenerating(false);
    }
  };

  const handleGenerateNew = () => {
    setNavState({
      history: ['menu'],
      pageState: {
        upload: { content: '' },
        updates: { selectedIds: [], customUpdates: '', combinedText: '' },
        jd: { text: '' },
      },
    });
    setGeneratedResume('');
    setIsGenerating(false);
  };

  const navigateTo = (step: Step) => {
    setNavState(prev => ({ ...prev, history: [...prev.history, step] }));
  };

  const goBack = () => {
    setNavState(prev => (
      prev.history.length > 1
        ? { ...prev, history: prev.history.slice(0, -1) }
        : prev
    ));
  };

  const canGoBack = navState.history.length > 1;

  return (
    <div className="print:hidden">
      <ResumeGeneratorWrapper>
        {(() => {
        switch (currentStep) {
          case 'menu':
            return (
              <StepWrapper 
                showBackButton={canGoBack} 
                onBack={goBack}
              >
                <MenuStep
                  onUpload={() => navigateTo('upload')}
                  onPaste={() => navigateTo('paste')}
                />
              </StepWrapper>
            );
          case 'upload':
            return (
              <StepWrapper 
                showBackButton={canGoBack} 
                onBack={goBack}
              >
                <UploadStep
                  onFileUpload={handleFileUpload}
                  onPasteResume={() => navigateTo('paste')}
                />
              </StepWrapper>
            );
          case 'paste':
            return (
              <StepWrapper 
                showBackButton={canGoBack} 
                onBack={goBack}
              >
                <PasteStep
                  onSubmit={handlePasteInput}
                  onUploadResume={() => navigateTo('upload')}
                />
              </StepWrapper>
            );
          case 'updates':
            return (
              <StepWrapper 
                showBackButton={canGoBack} 
                onBack={goBack}
              >
                <UpdatesStep
                  onSubmit={handleUpdatesSubmit}
                  onSubmitWithMeta={handleUpdatesPersist}
                  initialSelectedIds={navState.pageState?.updates?.selectedIds}
                  initialCustomUpdates={navState.pageState?.updates?.customUpdates}
                />
              </StepWrapper>
            );
          case 'jd':
            return (
              <StepWrapper 
                showBackButton={canGoBack} 
                onBack={goBack}
              >
                <JDStep
                  onSubmit={handleJDSubmit}
                  onSkip={() => generateResume()}
                  initialJD={navState.pageState?.jd?.text}
                  onChangeJD={handleJDChange}
                />
              </StepWrapper>
            );
          case 'preview':
            return (
              <StepWrapper 
                showBackButton={canGoBack} 
                onBack={goBack}
              >
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
              <StepWrapper 
                showBackButton={canGoBack} 
                onBack={goBack}
              >
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
