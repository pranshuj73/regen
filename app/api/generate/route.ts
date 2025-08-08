import { NextRequest, NextResponse } from 'next/server';
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { ResumeContentSchema } from '@/schema/resume';

export async function POST(request: NextRequest) {
  try {
    const { content, updates, jobDescription } = await request.json();
    
    console.log('Received content:', content);
    console.log('Received updates:', updates);
    console.log('Received jobDescription:', jobDescription);

    // Create the prompt for resume generation
    let prompt = `Create a professional resume based on the following information:\n${content}`;
    
    if (updates) {
      prompt += `\nPlease make the following updates to the resume:\n${updates}`;
    }
    
    if (jobDescription) {
      prompt += `\nTailor this resume specifically for the following job description:\n${jobDescription}`;
    }

                    prompt += `\nGenerate a well-structured, professional resume with the following requirements:
            - Extract and organize all information into the provided schema
            - Focus on achievements and quantifiable results
            - Make it ATS-friendly with clear section headers
            - Ensure all contact information is properly formatted
            - Include relevant skills and technologies
            - Add any certifications if mentioned in the input
            - Create a compelling professional summary (2-3 sentences)
            - Limit experience and projects to maximum 3 entries each
            - Order sections as: Summary, Technical Skills, Experience, Projects, Education, Certifications
            - Extract LinkedIn and GitHub profiles if mentioned in the input (just the username, not full URL)`;

    const result = await generateObject({
      model: google('gemini-2.0-flash-exp'),
      schema: ResumeContentSchema,
      prompt,
    });

    console.log(result.object);

    // Return the structured data for the React component
    const resumeData = result.object;

    return NextResponse.json({ 
      data: resumeData,
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