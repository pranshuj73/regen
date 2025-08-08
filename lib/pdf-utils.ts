import { useReactToPrint } from 'react-to-print';

export const useResumePrint = (contentRef: React.RefObject<HTMLDivElement | null>) => {
  return useReactToPrint({
    contentRef,
    documentTitle: 'Resume',
    onAfterPrint: () => {
      console.log('Print completed');
    },
    onPrintError: (error) => {
      console.error('Print error:', error);
    }
  });
};

export const generateResumeHTML = (data: any) => {
  // This function would generate structured HTML based on the resume data
  // For now, return a basic template
  return `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px;">
        <h1 style="color: #333; margin: 0;">${data.name || 'Your Name'}</h1>
        <p style="color: #666; margin: 5px 0;">${data.title || 'Professional Title'}</p>
        <p style="color: #666; margin: 5px 0;">${data.email || 'email@example.com'} | ${data.phone || '(555) 123-4567'}</p>
      </div>
      
      ${data.summary ? `
        <div style="margin-bottom: 20px;">
          <h2 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Professional Summary</h2>
          <p>${data.summary}</p>
        </div>
      ` : ''}
      
      ${data.experience ? `
        <div style="margin-bottom: 20px;">
          <h2 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Work Experience</h2>
          <div style="white-space: pre-line;">${data.experience}</div>
        </div>
      ` : ''}
      
      ${data.education ? `
        <div style="margin-bottom: 20px;">
          <h2 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Education</h2>
          <div style="white-space: pre-line;">${data.education}</div>
        </div>
      ` : ''}
      
      ${data.skills ? `
        <div style="margin-bottom: 20px;">
          <h2 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Skills</h2>
          <div style="white-space: pre-line;">${data.skills}</div>
        </div>
      ` : ''}
      
      ${data.projects ? `
        <div style="margin-bottom: 20px;">
          <h2 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Projects</h2>
          <div style="white-space: pre-line;">${data.projects}</div>
        </div>
      ` : ''}
    </div>
  `;
}; 