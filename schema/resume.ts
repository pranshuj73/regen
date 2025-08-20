import { z } from "zod";

// Zod schema for resume content
export const ResumeSchema = z.object({
	name: z.string().describe("Full name of the person"),
	email: z.string().describe("Valid email address (e.g., user@example.com)"),
	phone: z
		.string()
		.describe("Phone number in international format (e.g., +1 555-123-4567)"),
	address: z.string().describe("Full address or city, state"),
	linkedin: z
		.string()
		.optional()
		.describe("LinkedIn username only (e.g., username)"),
	github: z
		.string()
		.optional()
		.describe("GitHub username only (e.g., username)"),
	summary: z.string().describe("Professional summary in 1-2 sentences"),
	technical_skills: z
		.object({
			languages: z
				.array(z.string())
				.describe(
					"Programming languages (e.g., Python, Java, JavaScript, C++)",
				),
			frameworks: z
				.array(z.string())
				.describe(
					"Frameworks and libraries (e.g., React, Django, Spring, TensorFlow)",
				),
			development_tools: z
				.array(z.string())
				.describe(
					"Development tools and platforms (e.g., Git, Docker, VS Code, Jupyter)",
				),
			libraries: z
				.array(z.string())
				.describe(
					"Additional libraries and technologies (e.g., Pandas, NumPy, REST APIs)",
				),
		})
		.describe("Technical skills organized by category"),
	experience: z
		.array(
			z.object({
				position: z.string().describe("Job title or position"),
				organization: z.string().describe("Company or organization name"),
				duration: z
					.string()
					.describe("Employment period (e.g., Jan 2024 - Mar 2024)"),
				location: z.string().describe("City, State or Remote"),
				responsibilities: z
					.array(z.string())
					.describe(
						"3-5 bullet points describing achievements and responsibilities",
					),
			}),
		)
		.max(3)
		.describe("Work experience entries (maximum 3)"),
	projects: z
		.array(
			z.object({
				title: z.string().describe("Project name"),
				description: z.string().describe("Brief project description"),
				technologies: z
					.array(z.string())
					.describe("Technologies used in the project"),
				url: z.string().optional().describe("URL of the project"),
				year: z.string().optional().describe("Year of the project"),
			}),
		)
		.max(3)
		.describe("Project entries (maximum 3)"),
	education: z
		.array(
			z.object({
				institution: z.string().describe("School or university name"),
				degree: z.string().describe("Degree type and field of study"),
				location: z.string().describe("City, State or Country"),
				duration: z.string().describe("Study period (e.g., 2021 - 2025)"),
			}),
		)
		.describe("Educational background"),
	certifications: z
		.array(z.string())
		.optional()
		.describe("Professional certifications and licenses"),
});

export type ResumeSchemaType = z.infer<typeof ResumeSchema>;
