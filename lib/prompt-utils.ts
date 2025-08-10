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
    goals.push('1) Memorize and use the job description vocabulary to tailor content as well as tailor the resume to meet the requirements of the job description.');
  } else {
    goals.push('1) Optimize for common target roles using industry-relevant vocabulary.');
  }
  if (hasUpdates) {
    goals.push('2) Apply the user\'s requested updates faithfully.');
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
  • Experience: maximum 3 entries. Each entry's responsibilities must be 2-4 bullet points; each bullet starts with an action verb and includes a measurable result when possible. Keep each bullet concise (≤ 20 words when feasible).
  • Projects: maximum 3 entries, emphasizing impact and relevance to the target role. Include project URLs when available.
  • Professional summary: 1-2 sentences tailored to the role${hasJD ? ' (and JD)' : ''}.
  • Technical skills: populate the provided categories correctly:
    - languages: Programming languages (Python, Java, JavaScript, C++, etc.)
    - frameworks: Frameworks and libraries (React, Django, Spring, TensorFlow, etc.)
    - development_tools: Development tools and platforms (Git, Docker, VS Code, Jupyter, etc.)
    - libraries: Additional libraries and technologies (Pandas, NumPy, REST APIs, etc.)
    Do not misclassify skills - cloud services, databases, and security concepts should not be in development_tools.
  • Social links: if LinkedIn or GitHub usernames are present, provide only the username (e.g., "linkedin": "username", "github": "username"). Do not include full URLs. If absent, omit these fields.
  • Contact: ensure valid email format (user@domain.com) and international phone format +1 (555)-123-4567 when present.
  • Education/Certifications: use only what's provided in the input; do not fabricate. If not provided, leave empty or omit optional fields per schema.

RESUME WRITING TIPS (IMPORTANT):
• Repetition is bad
  - Using the same words over and over again in your resume can be perceived as a sign of poor language understanding.
  - Instead, use synonyms and active verbs that increase the impact of your achievements.

• Use Action → Task → Result format AND Quantify your impact using numbers, percentages, or dollar amounts.
  - Any good resume will show the impact you've had in previous positions you've held.
  - Quantifying your impact on your resume is the key to building a strong application that will get recruiters to pick up the phone and invite you to an interview.
  - Use the action verbs from the list below to describe your achievements.
  - Use the action verb, followed by the task, followed by the result.
  - Use numbers, percentages, or dollar amounts to quantify your achievements. (IMPORTANT)

ACTION VERBS FOR YOUR RESUME (IMPORTANT):
LEADERSHIP							
Accomplished,	Achieved,	Administered,	Analyzed,	Assigned,	Attained,	Chaired,	Consolidated, Contracted,	Coordinated,	Delegated,	Developed,	Directed,	Earned,	Evaluated,	Executed, Handled,	Headed,	Impacted,	Improved,	Increased,	Led,	Mastered,	Orchestrated, Organized,	Oversaw,	Planned,	Predicted,	Prioritized,	Produced,	Proved,	Recommended, Regulated,	Reorganized,	Reviewed,	Scheduled,	Spearheaded,	Strengthened,	Supervised,	Surpassed
							
COMMUNICATION							
Addressed,	Arbitrated,	Arranged,	Authored,	Collaborated,	Convinced,	Corresponded,	Delivered, Developed,	Directed,	Documented,	Drafted,	Edited,	Energized,	Enlisted,	Formulated, Influenced,	Interpreted,	Lectured,	Liaised,	Mediated,	Moderated,	Negotiated,	Persuaded, Presented,	Promoted,	Publicized,	Reconciled,	Recruited,	Reported,	Rewrote,	Spoke, Suggested,	Synthesized,	Translated,	Verbalized,	Wrote			
							
RESEARCH							
Clarified,	Collected,	Concluded,	Conducted,	Constructed,	Critiqued,	Derived,	Determined, Diagnosed,	Discovered,	Evaluated,	Examined,	Extracted,	Formed,	Identified,	Inspected, Interpreted,	Interviewed,	Investigated,	Modeled,	Organized,	Resolved,	Reviewed,	Summarized, Surveyed,	Systematized,	Tested

TECHNICAL							
Assembled,	Built,	Calculated,	Computed,	Designed,	Devised,	Engineered,	Fabricated, Installed,	Maintained,	Operated,	Optimized,	Overhauled,	Programmed,	Remodeled,	Repaired, Solved,	Standardized,	Streamlined,	Upgraded

TEACHING							
Adapted,	Advised,	Clarified,	Coached,	Communicated,	Coordinated,	Demystified,	Developed, Enabled,	Encouraged,	Evaluated,	Explained,	Facilitated,	Guided,	Informed,	Instructed, Persuaded,	Set Goals,	Stimulated,	Studied,	Taught,	Trained		
							
QUANTITATIVE							
Administered,	Allocated,	Analyzed,	Appraised,	Audited,	Balanced,	Budgeted,	Calculated, Computed,	Developed,	Forecasted,	Managed,	Marketed,	Maximized,	Minimized,	Planned, Projected,	Researched						
							
CREATIVE							
Acted,	Composed,	Conceived,	Conceptualized,	Created,	Customized,	Designed,	Developed, Directed,	Established,	Fashioned,	Founded,	Illustrated,	Initiated,	Instituted,	Integrated, Introduced,	Invented,	Originated,	Performed,	Planned,	Published,	Redesigned,	Revised, Revitalized,	Shaped,	Visualized					
							
HELPING							
Assessed,	Assisted,	Clarified,	Coached,	Counseled,	Demonstrated,	Diagnosed,	Educated, Enhanced,	Expedited,	Facilitated,	Familiarized,	Guided,	Motivated,	Participated,	Proposed, Provided,	Referred,	Rehabilitated,	Represented,	Served,	Supported		
							
ORGANIZATIONAL							
Approved,	Accelerated,	Added,	Arranged,	Broadened,	Cataloged,	Centralized,	Changed, Classified,	Collected,	Compiled,	Completed,	Controlled,	Defined,	Dispatched,	Executed, Expanded,	Gained,	Gathered,	Generated,	Implemented,	Inspected,	Launched,	Monitored, Operated,	Organized,	Prepared,	Processed,	Purchased,	Recorded,	Reduced,	Reinforced, Retrieved,	Screened,	Selected,	Simplified,	Sold,	Specified,	Steered,	Structured, Systematized,	Tabulated,	Unified,	Updated,	Utilized,	Validated,	Verified
  `);

  sections.push(
    `REMINDERS
- Keep content ATS-friendly: clear sectioning, relevant keywords, quantifiable results.
- Favor clarity and brevity. Avoid first-person language.
- Do not include any content outside of the schema.`
  );

  return sections.join('\n\n');
}

