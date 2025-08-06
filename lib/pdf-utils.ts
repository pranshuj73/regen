import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const downloadResumeAsPDF = async (htmlContent: string, filename: string = 'resume.pdf') => {
  try {
    // Create a temporary div to render the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    tempDiv.style.width = '800px';
    tempDiv.style.backgroundColor = 'white';
    tempDiv.style.padding = '20px';
    document.body.appendChild(tempDiv);

    // Convert HTML to canvas
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 800,
      height: tempDiv.scrollHeight,
    });

    // Remove the temporary div
    document.body.removeChild(tempDiv);

    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Download the PDF
    pdf.save(filename);
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
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