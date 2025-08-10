import { NextRequest, NextResponse } from 'next/server';
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { ResumeSchema } from '@/schema/resume';
import { buildResumePrompt } from '@/lib/prompt-utils';

export async function POST(request: NextRequest) {
  try {
    const { content, updates, jobDescription } = await request.json();

    const prompt = buildResumePrompt(content, updates, jobDescription);

    const result = await generateObject({
      model: google('gemini-2.0-flash-exp'),
      schema: ResumeSchema,
      prompt,
    });

    const resumeData = result.object;

    return NextResponse.json({ 
      data: resumeData,
      success: true 
    });

  } catch (error) {
    return NextResponse.json(
      { error: `Failed to generate resume: ${error}` },
      { status: 500 }
    );
  }
} 
