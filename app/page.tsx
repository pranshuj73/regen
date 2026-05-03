"use client";

import { Bot, Download, FileUp, Loader2, RefreshCw, Send, User } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ResumeGeneratorWrapper } from "@/components/generator";
import { PrintResume } from "@/components/generator/resume/print-resume";
import { ResumeComponent } from "@/components/generator/resume/resume-component";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useResumePrint } from "@/lib/pdf-utils";

type ResumeSource = "upload" | "paste" | "structured";
type ChatStage =
	| "source"
	| "upload"
	| "paste"
	| "structured"
	| "updates-select"
	| "updates-custom"
	| "job-description"
	| "generating"
	| "done";

interface ChatMessage {
	id: string;
	role: "bot" | "user";
	content: string;
}

interface StructuredData {
	name: string;
	email: string;
	phone: string;
	summary: string;
	experience: string;
	education: string;
	skills: string;
	projects: string;
}

const commonUpdates = [
	{
		id: "formatting",
		label: "Improve formatting and layout",
		description: "Make the resume more visually appealing and professional",
	},
	{
		id: "ats",
		label: "Optimize for ATS (Applicant Tracking Systems)",
		description: "Ensure the resume passes through automated screening systems",
	},
	{
		id: "achievements",
		label: "Enhance achievements and impact",
		description: "Add quantifiable results and specific accomplishments",
	},
	{
		id: "skills",
		label: "Update and organize skills",
		description: "Reorganize skills to match job requirements",
	},
	{
		id: "summary",
		label: "Improve professional summary",
		description: "Create a compelling and targeted summary",
	},
	{
		id: "language",
		label: "Improve language and clarity",
		description: "Use more powerful and clear language throughout",
	},
];

const structuredFields: Array<{
	key: keyof StructuredData;
	question: string;
	placeholder: string;
	required?: boolean;
	multiline?: boolean;
}> = [
	{
		key: "name",
		question: "Full Name",
		placeholder: "Enter your full name",
		required: true,
	},
	{
		key: "email",
		question: "Email",
		placeholder: "you@example.com",
		required: true,
	},
	{
		key: "phone",
		question: "Phone",
		placeholder: "Your phone number",
	},
	{
		key: "summary",
		question: "Professional Summary",
		placeholder:
			"Brief overview of your professional background and career objectives...",
		multiline: true,
	},
	{
		key: "experience",
		question: "Work Experience",
		placeholder:
			"List your work experience with company names, positions, dates, and key responsibilities...",
		multiline: true,
	},
	{
		key: "education",
		question: "Education",
		placeholder: "List your educational background...",
		multiline: true,
	},
	{
		key: "skills",
		question: "Skills",
		placeholder: "List your technical and soft skills...",
		multiline: true,
	},
	{
		key: "projects",
		question: "Projects (Optional)",
		placeholder: "Describe any relevant projects you've worked on...",
		multiline: true,
	},
];

const initialStructuredData: StructuredData = {
	name: "",
	email: "",
	phone: "",
	summary: "",
	experience: "",
	education: "",
	skills: "",
	projects: "",
};

const createMessage = (role: "bot" | "user", content: string): ChatMessage => ({
	id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
	role,
	content,
});

const composeStructuredResumeContent = (formData: StructuredData) =>
	`
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}

Professional Summary:
${formData.summary}

Work Experience:
${formData.experience}

Education:
${formData.education}

Skills:
${formData.skills}

Projects:
${formData.projects}
`.trim();

export default function Home() {
	const [messages, setMessages] = useState<ChatMessage[]>([
		createMessage(
			"bot",
			"Hi, I am REGEN. I will ask you the same questions from the old flow, but in chat format. How would you like to provide your resume?",
		),
	]);
	const [stage, setStage] = useState<ChatStage>("source");
	const [resumeSource, setResumeSource] = useState<ResumeSource | null>(null);
	const [resumeContent, setResumeContent] = useState("");
	const [isUploading, setIsUploading] = useState(false);
	const [pasteInput, setPasteInput] = useState("");
	const [structuredData, setStructuredData] =
		useState<StructuredData>(initialStructuredData);
	const [structuredIndex, setStructuredIndex] = useState(0);
	const [structuredInput, setStructuredInput] = useState("");
	const [selectedUpdateIds, setSelectedUpdateIds] = useState<string[]>([]);
	const [customUpdatesInput, setCustomUpdatesInput] = useState("");
	const [jobDescriptionInput, setJobDescriptionInput] = useState("");
	const [generatedResume, setGeneratedResume] = useState<any>(null);
	const [isGenerating, setIsGenerating] = useState(false);
	const [error, setError] = useState("");

	const contentRef = useRef<HTMLDivElement>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const handlePrint = useResumePrint(contentRef);

	const currentStructuredField =
		stage === "structured" ? structuredFields[structuredIndex] : null;

	const combinedUpdates = useMemo(() => {
		const selectedDescriptions = commonUpdates
			.filter((update) => selectedUpdateIds.includes(update.id))
			.map((update) => update.description);
		return [...selectedDescriptions, customUpdatesInput].filter(Boolean).join("\n");
	}, [selectedUpdateIds, customUpdatesInput]);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, stage, isGenerating]);

	const appendMessage = (role: "bot" | "user", content: string) => {
		setMessages((prev) => [...prev, createMessage(role, content)]);
	};

	const startUpdatesFlow = () => {
		setStage("updates-select");
		appendMessage(
			"bot",
			"What updates would you like to make? Select common updates first.",
		);
	};

	const handleSourceSelect = (source: ResumeSource) => {
		setResumeSource(source);
		appendMessage(
			"user",
			source === "upload"
				? "Upload Resume"
				: source === "paste"
					? "Paste Resume"
					: "Structured Form",
		);

		if (source === "upload") {
			setStage("upload");
			appendMessage(
				"bot",
				"Upload your existing resume file (PDF, TXT, DOC, or DOCX).",
			);
			return;
		}

		if (source === "paste") {
			setStage("paste");
			appendMessage(
				"bot",
				"Paste your resume content. You can include experience, education, skills, etc.",
			);
			return;
		}

		setStage("structured");
		setStructuredIndex(0);
		setStructuredInput("");
		appendMessage("bot", structuredFields[0].question);
	};

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		setError("");
		setIsUploading(true);

		const reader = new FileReader();
		reader.onload = async (e) => {
			const arrayBuffer = e.target?.result as ArrayBuffer;
			let parsedContent = "";

			if (
				file.type === "application/pdf" ||
				file.name.toLowerCase().endsWith(".pdf")
			) {
				try {
					const response = await fetch("/api/parse-pdf", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							filename: file.name,
							data: Array.from(new Uint8Array(arrayBuffer)),
						}),
					});

					if (!response.ok) {
						setError(
							"Failed to parse PDF. Try copy-pasting your resume content instead.",
						);
						setIsUploading(false);
						event.target.value = "";
						return;
					}

					const result = await response.json();
					parsedContent = result.text || "";
				} catch {
					setError(
						"Failed to parse PDF. Try copy-pasting your resume content instead.",
					);
					setIsUploading(false);
					event.target.value = "";
					return;
				}
			} else {
				parsedContent = new TextDecoder().decode(arrayBuffer);
			}

			setResumeContent(parsedContent);
			appendMessage("user", `Uploaded file: ${file.name}`);
			startUpdatesFlow();
			setIsUploading(false);
			event.target.value = "";
		};

		reader.onerror = () => {
			setError("Unable to read this file. Please try another file.");
			setIsUploading(false);
			event.target.value = "";
		};

		reader.readAsArrayBuffer(file);
	};

	const handlePasteSubmit = () => {
		if (!pasteInput.trim()) return;
		setResumeContent(pasteInput.trim());
		appendMessage(
			"user",
			`${pasteInput.trim().slice(0, 140)}${pasteInput.trim().length > 140 ? "..." : ""}`,
		);
		setPasteInput("");
		startUpdatesFlow();
	};
	const handleStructuredSubmit = () => {
		if (!currentStructuredField) return;
		if (currentStructuredField.required && !structuredInput.trim()) return;

		setStructuredData((prev) => ({
			...prev,
			[currentStructuredField.key]: structuredInput.trim(),
		}));
		appendMessage("user", structuredInput.trim() || "Skipped");

		const nextIndex = structuredIndex + 1;
		if (nextIndex < structuredFields.length) {
			setStructuredIndex(nextIndex);
			setStructuredInput("");
			appendMessage("bot", structuredFields[nextIndex].question);
			return;
		}

		const finalStructuredData = {
			...structuredData,
			[currentStructuredField.key]: structuredInput.trim(),
		};
		const content = composeStructuredResumeContent(finalStructuredData);
		setResumeContent(content);
		setStructuredInput("");
		startUpdatesFlow();
	};
	const toggleUpdate = (id: string) => {
		setSelectedUpdateIds((prev) =>
			prev.includes(id) ? prev.filter((entry) => entry !== id) : [...prev, id],
		);
	};

	const handleUpdatesContinue = () => {
		const selectedLabels = commonUpdates
			.filter((update) => selectedUpdateIds.includes(update.id))
			.map((update) => update.label)
			.join(", ");
		appendMessage(
			"user",
			selectedLabels || "No common updates selected",
		);
		setStage("updates-custom");
		appendMessage(
			"bot",
			"Any additional requirements? (Optional)",
		);
	};

	const handleCustomUpdatesContinue = () => {
		appendMessage("user", customUpdatesInput.trim() || "No additional requirements");
		setStage("job-description");
		appendMessage(
			"bot",
			"Job Description (Optional): paste it to tailor your resume specifically.",
		);
	};

	const generateResume = async (jobDescription: string) => {
		setError("");
		setStage("generating");
		setIsGenerating(true);
		appendMessage("bot", "Awesome. Generating your tailored resume now...");

		try {
			const response = await fetch("/api/generate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					content: resumeContent,
					updates: combinedUpdates,
					jobDescription,
				}),
			});

			if (!response.ok) {
				throw new Error("Generation failed");
			}

			const result = await response.json();
			setGeneratedResume(result.data);
			setStage("done");
			appendMessage(
				"bot",
				"Your resume is ready. I shared it below as a PDF-ready resume.",
			);
		} catch {
			setError("Failed to generate resume. Please try again.");
			appendMessage(
				"bot",
				"I hit an issue while generating the resume. Please try again.",
			);
			setStage("job-description");
		} finally {
			setIsGenerating(false);
		}
	};

	const handleJobDescriptionSubmit = () => {
		appendMessage("user", jobDescriptionInput.trim());
		generateResume(jobDescriptionInput.trim());
	};

	const handleJobDescriptionSkip = () => {
		appendMessage("user", "Skipped job description");
		generateResume("");
	};
	const resetConversation = () => {
		setMessages([
			createMessage(
				"bot",
				"Hi, I am REGEN. I will ask you the same questions from the old flow, but in chat format. How would you like to provide your resume?",
			),
		]);
		setStage("source");
		setResumeSource(null);
		setResumeContent("");
		setIsUploading(false);
		setPasteInput("");
		setStructuredData(initialStructuredData);
		setStructuredIndex(0);
		setStructuredInput("");
		setSelectedUpdateIds([]);
		setCustomUpdatesInput("");
		setJobDescriptionInput("");
		setGeneratedResume(null);
		setIsGenerating(false);
		setError("");
	};

	return (
		<ResumeGeneratorWrapper>
			{generatedResume && <PrintResume data={generatedResume} />}
			<Card className="w-full max-w-4xl h-[90vh] flex flex-col">
				<CardHeader className="border-b">
					<CardTitle className="text-xl">REGEN Chat</CardTitle>
				</CardHeader>
				<CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
					<div className="flex-1 overflow-y-auto p-4 space-y-4">
						{messages.map((message) => (
							<div
								key={message.id}
								className={`flex ${message.role === "bot" ? "justify-start" : "justify-end"}`}
							>
								<div
									className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
										message.role === "bot"
											? "bg-secondary text-secondary-foreground"
											: "bg-primary text-primary-foreground"
									}`}
								>
									<div className="flex items-start gap-2">
										{message.role === "bot" ? (
											<Bot className="h-4 w-4 mt-0.5 shrink-0" />
										) : (
											<User className="h-4 w-4 mt-0.5 shrink-0" />
										)}
										<p className="whitespace-pre-wrap">{message.content}</p>
									</div>
								</div>
							</div>
						))}

						{isGenerating && (
							<div className="flex justify-start">
								<div className="bg-secondary text-secondary-foreground rounded-2xl px-4 py-3 text-sm max-w-[80%]">
									<div className="flex items-center gap-2">
										<Loader2 className="h-4 w-4 animate-spin" />
										<span>Crafting your perfect resume...</span>
									</div>
								</div>
							</div>
						)}

						{stage === "done" && generatedResume && (
							<div className="space-y-3">
								<div className="flex gap-2">
									<Button onClick={handlePrint} className="cursor-pointer">
										<Download className="h-4 w-4" />
										Download PDF
									</Button>
									<Button
										variant="outline"
										onClick={resetConversation}
										className="cursor-pointer"
									>
										<RefreshCw className="h-4 w-4" />
										Start New Resume
									</Button>
								</div>
								<div ref={contentRef} className="rounded-xl border bg-white p-2">
									<ResumeComponent data={generatedResume} />
								</div>
							</div>
						)}

						<div ref={messagesEndRef} />
					</div>

					<div className="border-t p-4 space-y-3">
						{error && (
							<p className="text-sm text-red-500" role="alert">
								{error}
							</p>
						)}

						{stage === "source" && (
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
								<Button
									variant="outline"
									onClick={() => handleSourceSelect("upload")}
									className="cursor-pointer"
								>
									Upload Resume
								</Button>
								<Button
									variant="outline"
									onClick={() => handleSourceSelect("paste")}
									className="cursor-pointer"
								>
									Paste Resume
								</Button>
								<Button
									variant="outline"
									onClick={() => handleSourceSelect("structured")}
									className="cursor-pointer"
								>
									Structured Form
								</Button>
							</div>
						)}

						{stage === "upload" && (
							<div className="space-y-2">
								<Label htmlFor="resume-upload">Upload file</Label>
								<div className="flex items-center gap-2">
									<Input
										id="resume-upload"
										type="file"
										accept=".pdf,.txt,.doc,.docx"
										onChange={handleFileUpload}
										disabled={isUploading}
									/>
									{isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
								</div>
								<p className="text-xs text-muted-foreground">
									PDF parsing extracts text only. You can add missing URLs manually in the next steps.
								</p>
							</div>
						)}

						{stage === "paste" && (
							<div className="space-y-2">
								<Textarea
									value={pasteInput}
									onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
										setPasteInput(e.target.value)
									}
									rows={6}
									placeholder="Paste your resume content here..."
								/>
								<Button
									onClick={handlePasteSubmit}
									disabled={!pasteInput.trim()}
									className="cursor-pointer"
								>
									<Send className="h-4 w-4" />
									Send
								</Button>
							</div>
						)}

						{stage === "structured" && currentStructuredField && (
							<div className="space-y-2">
								<Label>{currentStructuredField.question}</Label>
								{currentStructuredField.multiline ? (
									<Textarea
										value={structuredInput}
										onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
											setStructuredInput(e.target.value)
										}
										rows={4}
										placeholder={currentStructuredField.placeholder}
									/>
								) : (
									<Input
										value={structuredInput}
										type={currentStructuredField.key === "email" ? "email" : "text"}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setStructuredInput(e.target.value)
										}
										placeholder={currentStructuredField.placeholder}
									/>
								)}
								<Button
									onClick={handleStructuredSubmit}
									disabled={
										Boolean(currentStructuredField.required) && !structuredInput.trim()
									}
									className="cursor-pointer"
								>
									<Send className="h-4 w-4" />
									Send
								</Button>
							</div>
						)}

						{stage === "updates-select" && (
							<div className="space-y-3">
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
									{commonUpdates.map((update) => (
										<div
											key={update.id}
											role="button"
											tabIndex={0}
											onClick={() => toggleUpdate(update.id)}
											onKeyDown={(e) => {
												if (e.key === "Enter" || e.key === " ") {
													e.preventDefault();
													toggleUpdate(update.id);
												}
											}}
											className="rounded-lg border p-3 text-left hover:bg-accent cursor-pointer"
										>
											<div className="flex items-start gap-2">
												<Checkbox
													checked={selectedUpdateIds.includes(update.id)}
													className="pointer-events-none"
												/>
												<div>
													<p className="text-sm font-medium">{update.label}</p>
													<p className="text-xs text-muted-foreground">
														{update.description}
													</p>
												</div>
											</div>
										</div>
									))}
								</div>
								<Button onClick={handleUpdatesContinue} className="cursor-pointer">
									Continue
								</Button>
							</div>
						)}

						{stage === "updates-custom" && (
							<div className="space-y-2">
								<Textarea
									value={customUpdatesInput}
									onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
										setCustomUpdatesInput(e.target.value)
									}
									rows={4}
									placeholder="Describe any specific changes you'd like to make..."
								/>
								<Button
									onClick={handleCustomUpdatesContinue}
									className="cursor-pointer"
								>
									Continue
								</Button>
							</div>
						)}

						{stage === "job-description" && (
							<div className="space-y-2">
								<Textarea
									value={jobDescriptionInput}
									onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
										setJobDescriptionInput(e.target.value)
									}
									rows={5}
									placeholder="Paste the job description here to tailor your resume..."
								/>
								<div className="flex gap-2">
									<Button
										onClick={handleJobDescriptionSubmit}
										disabled={!jobDescriptionInput.trim()}
										className="cursor-pointer"
									>
										Generate Tailored Resume
									</Button>
									<Button
										variant="outline"
										onClick={handleJobDescriptionSkip}
										className="cursor-pointer"
									>
										Skip & Generate
									</Button>
								</div>
							</div>
						)}

						{stage === "done" && (
							<div className="text-sm text-muted-foreground">
								{resumeSource
									? `Resume source: ${resumeSource}. You can download the final PDF above.`
									: "You can download the final PDF above."}
							</div>
						)}

						{stage === "generating" && (
							<div className="flex items-center text-sm text-muted-foreground gap-2">
								<Loader2 className="h-4 w-4 animate-spin" />
								Generating resume...
							</div>
						)}

						{stage !== "done" && stage !== "source" && stage !== "generating" && (
							<Button
								variant="ghost"
								onClick={resetConversation}
								className="cursor-pointer text-xs"
							>
								<FileUp className="h-4 w-4" />
								Start Over
							</Button>
						)}
					</div>
				</CardContent>
			</Card>
		</ResumeGeneratorWrapper>
	);
}
