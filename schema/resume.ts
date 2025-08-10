import { z } from "zod";

// Zod schema for resume content
export const ResumeSchema = z.object({
  name: z.string().describe("Full name of the person"),
  email: z.string().describe("Valid email address (e.g., user@example.com)"),
  phone: z.string().describe("Phone number in international format (e.g., +1 555-123-4567)"),
  address: z.string().describe("Full address or city, state"),
  linkedin: z.string().optional().describe("Full LinkedIn profile URL (e.g., https://linkedin.com/in/username)"),
  github: z.string().optional().describe("Full GitHub profile URL (e.g., https://github.com/username)"),
  summary: z.string().describe("Professional summary in 1-2 sentences"),
  technical_skills: z.object({
    languages: z.array(z.string()).describe("Programming languages (e.g., JavaScript, Python, Java)"),
    frameworks: z.array(z.string()).describe("Frameworks and libraries relevant to the job (e.g., React, Pandas, PyTorch)"),
    development_tools: z.array(z.string()).describe("Development tools and platforms (e.g., Git, Docker, AWS)"),
    libraries: z.array(z.string()).describe("Additional libraries and technologies (e.g., Express.js, MongoDB)")
  }).describe("Technical skills organized by category"),
  experience: z.array(
    z.object({
      position: z.string().describe("Job title or position"),
      organization: z.string().describe("Company or organization name"),
      duration: z.string().describe("Employment period (e.g., Jan 2024 - Mar 2024)"),
      location: z.string().describe("City, State or Remote"),
      responsibilities: z.array(z.string()).describe("3-5 bullet points describing achievements and responsibilities")
    })
  ).max(3).describe("Work experience entries (maximum 3)"),
  projects: z.array(
    z.object({
      title: z.string().describe("Project name"),
      description: z.string().describe("Brief project description"),
      technologies: z.array(z.string()).describe("Technologies used in the project")
    })
  ).max(3).describe("Project entries (maximum 3)"),
  education: z.array(
    z.object({
      institution: z.string().describe("School or university name"),
      degree: z.string().describe("Degree type and field of study"),
      location: z.string().describe("City, State or Country"),
      duration: z.string().describe("Study period (e.g., 2021 - 2025)")
    })
  ).describe("Educational background"),
  certifications: z.array(z.string()).optional().describe("Professional certifications and licenses")
});

export type ResumeContent = z.infer<typeof ResumeSchema>;