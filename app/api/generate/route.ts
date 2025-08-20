import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { type NextRequest, NextResponse } from "next/server";
import { buildResumePrompt } from "@/lib/prompt-utils";
import { extractUsername } from "@/lib/social-utils";
import { ResumeSchema } from "@/schema/resume";

export async function POST(request: NextRequest) {
	try {
		const { content, updates, jobDescription } = await request.json();

		const prompt = buildResumePrompt(content, updates, jobDescription);

		const result = await generateObject({
			model: google("gemini-2.0-flash-exp"),
			schema: ResumeSchema,
			prompt,
		});

		const resumeData = result.object;

		// Clean up social media usernames - extract usernames from URLs if needed
		if (resumeData.linkedin) {
			resumeData.linkedin = extractUsername(resumeData.linkedin, "linkedin");
		}
		if (resumeData.github) {
			resumeData.github = extractUsername(resumeData.github, "github");
		}

		return NextResponse.json({
			data: resumeData,
			success: true,
		});
	} catch (error) {
		return NextResponse.json(
			{ error: `Failed to generate resume: ${error}` },
			{ status: 500 },
		);
	}
}
