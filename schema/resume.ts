import { z } from "zod";
import {
  pgTable,
  text,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

import { user } from "./auth";

// Zod schema for resume content
export const ResumeContentSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  address: z.string(),
  summary: z.string(),
  education: z.array(
    z.object({
      institution: z.string(),
      degree: z.string(),
      location: z.string(),
      duration: z.string()
    })
  ),
  experience: z.array(
    z.object({
      position: z.string(),
      organization: z.string(),
      duration: z.string(),
      location: z.string(),
      responsibilities: z.array(z.string())
    })
  ),
  projects: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      technologies: z.array(z.string())
    })
  ),
  technical_skills: z.object({
    languages: z.array(z.string()),
    frameworks: z.array(z.string()),
    development_tools: z.array(z.string()),
    libraries: z.array(z.string())
  })
});

// Drizzle table for resume
export const resume = pgTable("resume", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  content: jsonb("content").$type<z.infer<typeof ResumeContentSchema>>().notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export type ResumeContent = z.infer<typeof ResumeContentSchema>;
