export type UpdatesInput =
  | string
  | {
      selectedIds?: string[];
      customUpdates?: string;
      combinedText?: string;
    };

export function buildResumePrompt(
  content: string,
  updates?: UpdatesInput,
  jobDescription?: string
): string {
  const hasJD = typeof jobDescription === 'string' && jobDescription.trim().length > 0;
  const hasUpdates = Boolean(
    updates && (
      (typeof updates === 'string' && updates.trim().length > 0) ||
      (typeof updates === 'object' && (
        (updates.combinedText && updates.combinedText.trim().length > 0) ||
        (updates.customUpdates && updates.customUpdates.trim().length > 0) ||
        (Array.isArray(updates.selectedIds) && updates.selectedIds.length > 0)
      ))
    )
  );

  let updatesText = '';
  if (hasUpdates) {
    if (typeof updates === 'string') {
      updatesText = updates;
    } else if (typeof updates === 'object' && updates) {
      const selected = Array.isArray(updates.selectedIds) && updates.selectedIds.length
        ? `Selected options: ${updates.selectedIds.join(', ')}`
        : '';
      const parts = [updates.combinedText, updates.customUpdates, selected]
        .filter((x) => typeof x === 'string' && x.trim().length > 0);
      updatesText = parts.join('\n');
    }
  }

  const sections: string[] = [];

  sections.push(
    `ROLE\nYou are a professional resume writer. Write concise, ATS-optimized content using niche-appropriate language. Avoid clichés and redundancy.`
  );

  const inputs: string[] = [`- Raw resume content (verbatim):\n${content}`];
  if (hasUpdates) inputs.push(`- Desired updates from user (verbatim):\n${updatesText}`);
  if (hasJD) inputs.push(`- Target job description (verbatim):\n${jobDescription}`);
  sections.push(`INPUTS\n${inputs.join('\n')}`);

  const goals: string[] = [];
  if (hasJD) {
    goals.push('1) Memorize and use the job description vocabulary to tailor content.');
  } else {
    goals.push('1) Optimize for common target roles using industry-relevant vocabulary.');
  }
  if (hasUpdates) {
    goals.push('2) Apply the user’s requested updates faithfully.');
  }
  goals.push(
    '3) Convert experience into results-driven bullet points using Action → Task → Result, quantifying with numbers, % or $.',
    '4) Identify the most relevant technical skills for the role and include them in the technical skills categories. Include additional relevant skills appropriately.',
    '5) Produce a professional summary highlighting years of experience and strengths aligned to the target role. Use concise, passive third-person (approx. 3–5 sentences).'
  );
  sections.push(`GOALS\n${goals.join('\n')}`);

  sections.push(
    `OUTPUT FORMAT REQUIREMENTS (STRICT)
- Output must conform EXACTLY to the provided JSON schema fields. Do not add or rename fields. Do not include markdown.
- Respect these constraints:
  • Sections order: Summary, Technical Skills, Experience, Projects, Education, Certifications.
  • Experience: maximum 3 entries. Each entry's responsibilities must be 3-5 bullet points; each bullet starts with an action verb and includes a measurable result when possible. Keep each bullet concise (≤ 20 words when feasible).
  • Projects: maximum 3 entries, emphasizing impact and relevance to the target role.
  • Professional summary: 3-5 sentences tailored to the role${hasJD ? ' (and JD)' : ''}.
  • Technical skills: populate the provided categories (languages, frameworks, development_tools, libraries). Ensure the most relevant skills are included.
  • Social links: if LinkedIn or GitHub URLs are present, extract and return only the username (e.g., "linkedin": "username", "github": "username"). If absent, omit these fields.
  • Contact: ensure valid formatting for email and international-friendly phone formatting when present.
  • Education/Certifications: use only what's provided in the input; do not fabricate. If not provided, leave empty or omit optional fields per schema.`
  );

  sections.push(
    `REMINDERS
- Keep content ATS-friendly: clear sectioning, relevant keywords, quantifiable results.
- Favor clarity and brevity. Avoid first-person language.
- Do not include any content outside of the schema.`
  );

  return sections.join('\n\n');
}

