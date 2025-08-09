import { NextRequest, NextResponse } from 'next/server';
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { ResumeContentSchema } from '@/schema/resume';
import { buildResumePrompt } from '@/lib/prompt-utils';

export async function POST(request: NextRequest) {
  try {
    const { content, updates, jobDescription } = await request.json();
    
  

    const prompt = buildResumePrompt(content, updates, jobDescription);

    const result = await generateObject({
      model: google('gemini-2.0-flash-exp'),
      schema: ResumeContentSchema,
      prompt,
    });

    

    // Return the structured data for the React component
    const resumeData = result.object;

    return NextResponse.json({ 
      data: resumeData,
      success: true 
    });

  } catch (error) {
    
    return NextResponse.json(
      { error: 'Failed to generate resume' },
      { status: 500 }
    );
  }
} 