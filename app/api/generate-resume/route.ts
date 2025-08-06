import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export async function POST(request: NextRequest) {
  try {
    const { content, jobDescription } = await request.json();

    // Create the prompt for resume generation
    let prompt = `Create a professional resume based on the following information:\n\n${content}`;
    
    if (jobDescription) {
      prompt += `\n\nTailor this resume specifically for the following job description:\n\n${jobDescription}`;
    }

    prompt += `\n\nGenerate a well-structured, professional resume in HTML format with the following sections:
1. Header with name, contact information, and professional summary
2. Work Experience (with bullet points highlighting achievements)
3. Education
4. Skills (both technical and soft skills)
5. Projects (if applicable)

Use clean HTML with appropriate styling. Focus on achievements and quantifiable results. Make it ATS-friendly with clear section headers.`;

    const result = await generateText({
      model: openai('gpt-4'),
      prompt,
      maxTokens: 2000,
    });

    // For now, return a structured HTML resume
    // In a real implementation, you'd parse the AI response and structure it properly
    const resumeHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px;">
          <h1 style="color: #333; margin: 0;">John Doe</h1>
          <p style="color: #666; margin: 5px 0;">Software Engineer</p>
          <p style="color: #666; margin: 5px 0;">john.doe@email.com | (555) 123-4567 | linkedin.com/in/johndoe</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h2 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Professional Summary</h2>
          <p>Experienced software engineer with 5+ years developing scalable web applications. Proficient in React, Node.js, and cloud technologies. Passionate about clean code and user experience.</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h2 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Work Experience</h2>
          
          <div style="margin-bottom: 15px;">
            <h3 style="color: #555; margin: 0;">Senior Software Engineer</h3>
            <p style="color: #666; margin: 5px 0;">Tech Company Inc. | 2022 - Present</p>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Led development of microservices architecture serving 1M+ users</li>
              <li>Improved application performance by 40% through optimization</li>
              <li>Mentored 3 junior developers and conducted code reviews</li>
            </ul>
          </div>
          
          <div style="margin-bottom: 15px;">
            <h3 style="color: #555; margin: 0;">Software Engineer</h3>
            <p style="color: #666; margin: 5px 0;">StartupXYZ | 2020 - 2022</p>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Built full-stack web applications using React and Node.js</li>
              <li>Implemented CI/CD pipelines reducing deployment time by 60%</li>
              <li>Collaborated with design team to improve user experience</li>
            </ul>
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h2 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Education</h2>
          <h3 style="color: #555; margin: 0;">Bachelor of Science in Computer Science</h3>
          <p style="color: #666; margin: 5px 0;">University of Technology | 2016 - 2020</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h2 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Skills</h2>
          <p><strong>Technical:</strong> JavaScript, TypeScript, React, Node.js, Python, AWS, Docker, Git</p>
          <p><strong>Soft Skills:</strong> Leadership, Problem Solving, Communication, Team Collaboration</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h2 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Projects</h2>
          <div style="margin-bottom: 10px;">
            <h3 style="color: #555; margin: 0;">E-commerce Platform</h3>
            <p style="color: #666; margin: 5px 0;">Full-stack application with payment integration and admin dashboard</p>
          </div>
          <div style="margin-bottom: 10px;">
            <h3 style="color: #555; margin: 0;">Task Management App</h3>
            <p style="color: #666; margin: 5px 0;">React-based application with real-time collaboration features</p>
          </div>
        </div>
      </div>
    `;

    return NextResponse.json({ 
      resume: resumeHTML,
      success: true 
    });

  } catch (error) {
    console.error('Error generating resume:', error);
    return NextResponse.json(
      { error: 'Failed to generate resume' },
      { status: 500 }
    );
  }
} 