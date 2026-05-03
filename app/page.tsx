"use client";

import { Bot, Download, RefreshCcw, Send, Upload, User } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { ResumeGeneratorWrapper } from "@/components/generator/layout/resume-generator-wrapper";
import { PrintResume } from "@/components/generator/resume/print-resume";
import { ResumeComponent } from "@/components/generator/resume/resume-component";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useResumePrint } from "@/lib/pdf-utils";
import type { ResumeSchemaType } from "@/schema/resume";

type Sender = "bot" | "user";
type InputMethod = "upload" | "paste-simple" | "paste-structured" | null;
type ChatStage =
	| "method"
	| "pasteMode"
	| "upload"
	| "paste"
	| "structuredField"
	| "updates"
	| "customUpdates"
	| "jobDescription"
	| "generating"
	| "result";

interface Message {
	id: number;
	sender: Sender;
	text: string;
}

interface StructuredFields {
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

const structuredQuestions: Array<{
	key: keyof StructuredFields;
	label: string;
	placeholder: string;
	required?: boolean;
}> = [
	{
		key: "name",
		label: "Full Name",
		placeholder: "Enter your full name",
		required: true,
	},
	{
		key: "email",
		label: "Email",
		placeholder: "Enter your email",
		required: true,
	},
	{
		key: "phone",
		label: "Phone",
		placeholder: "Enter your phone number (optional)",
	},
	{
		key: "summary",
		label: "Professional Summary",
		placeholder:
			"Brief overview of your professional background and career objectives...",
	},
	{
		key: "experience",
		label: "Work Experience",
		placeholder:
			"List your work experience with company names, positions, dates, and key responsibilities...",
	},
	{
		key: "education",
		label: "Education",
		placeholder: "List your educational background...",
	},
	{
		key: "skills",
		label: "Skills",
		placeholder: "List your technical and soft skills...",
	},
	{
		key: "projects",
		label: "Projects (Optional)",
		placeholder: "Describe any relevant projects you've worked on...",
	},
];

const initialStructuredFields: StructuredFields = {
	name: "",
	email: "",
	phone: "",
	summary: "",
	experience: "",
	education: "",
	skills: "",
	projects: "",
};

const initialMessages: Message[] = [
	{
		id: 1,
		sender: "bot",
		text: "Hi! I can tailor your resume in a quick chat.",
	},
	{
		id: 2,
		sender: "bot",
		text: "How would you like to provide your current resume?",
	},
];

const buildStructuredResumeContent = (fields: StructuredFields) => {
	return `
Name: ${fields.name}
Email: ${fields.email}
Phone: ${fields.phone}

Professional Summary:
${fields.summary}

Work Experience:
${fields.experience}

Education:
${fields.education}

Skills:
${fields.skills}

Projects:
${fields.projects}
`.trim();
};

export default function Home() {
	const [messages, setMessages] = useState<Message[]>(initialMessages);
	const [stage, setStage] = useState<ChatStage>("method");
	const [inputMethod, setInputMethod] = useState<InputMethod>(null);
	const [draftText, setDraftText] = useState("");
	const [resumeContent, setResumeContent] = useState("");
	const [structuredFields, setStructuredFields] =
		useState<StructuredFields>(initialStructuredFields);
	const [structuredFieldIndex, setStructuredFieldIndex] = useState(0);
	const [selectedUpdates, setSelectedUpdates] = useState<string[]>([]);
	const [customUpdates, setCustomUpdates] = useState("");
	const [generatedResume, setGeneratedResume] = useState<ResumeSchemaType | null>(
		null,
	);
	const [isUploading, setIsUploading] = useState(false);
	const [isGenerating, setIsGenerating] = useState(false);

	const messageId = useRef(3);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const resumeRef = useRef<HTMLDivElement>(null);
	const handlePrint = useResumePrint(resumeRef);

	const currentStructuredQuestion = structuredQuestions[structuredFieldIndex];

	const disableTextSubmit = useMemo(() => {
		if (isGenerating) return true;
		if (stage === "paste") return !draftText.trim();
		if (stage === "structuredField" && currentStructuredQuestion?.required) {
			return !draftText.trim();
		}
		return false;
	}, [draftText, stage, isGenerating, currentStructuredQuestion]);

	const addMessage = (sender: Sender, text: string) => {
		setMessages((prev) => [...prev, { id: messageId.current++, sender, text }]);
	};

	const askForUpdates = () => {
		addMessage(
			"bot",
			"What updates would you like to make? Select one or more options below.",
		);
		setStage("updates");
	};

	const askStructuredQuestion = (index: number) => {
		const question = structuredQuestions[index];
		if (!question) return;
		addMessage(
			"bot",
			question.required
				? `${question.label} (required)`
				: `${question.label} (optional)`,
		);
		setStage("structuredField");
	};

	const handleMethodSelect = (method: "upload" | "paste") => {
		addMessage("user", method === "upload" ? "Upload Resume" : "Paste Resume");

		if (method === "upload") {
			setInputMethod("upload");
			addMessage("bot", "Great — upload your resume file.");
			setStage("upload");
			return;
		}

		addMessage(
			"bot",
			"Do you want to use Simple Paste or Structured Form for your resume content?",
		);
		setStage("pasteMode");
	};

	const handlePasteModeSelect = (mode: "simple" | "structured") => {
		if (mode === "simple") {
			setInputMethod("paste-simple");
			addMessage("user", "Simple Paste");
			addMessage("bot", "Paste your resume content below.");
			setStage("paste");
			return;
		}

		setInputMethod("paste-structured");
		setStructuredFields(initialStructuredFields);
		setStructuredFieldIndex(0);
		setDraftText("");
		addMessage("user", "Structured Form");
		askStructuredQuestion(0);
	};

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		setIsUploading(true);
		const reader = new FileReader();
		reader.onload = async (e) => {
			const arrayBuffer = e.target?.result as ArrayBuffer;

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

					if (!response.ok) throw new Error("Unable to parse PDF");

					const result = await response.json();
					setResumeContent(result.text || "");
					addMessage("user", `Uploaded ${file.name}`);
					askForUpdates();
				} catch {
					addMessage(
						"bot",
						"I couldn't parse that PDF. Please try another file or switch to paste mode.",
					);
				}
			} else {
				const content = new TextDecoder().decode(arrayBuffer);
				setResumeContent(content);
				addMessage("user", `Uploaded ${file.name}`);
				askForUpdates();
			}
			setIsUploading(false);
		};
		reader.readAsArrayBuffer(file);
	};

	const handleContinueUpdates = () => {
		const selectedLabels = commonUpdates
			.filter((update) => selectedUpdates.includes(update.id))
			.map((update) => update.label);

		addMessage(
			"user",
			selectedLabels.length > 0
				? selectedLabels.join(", ")
				: "No common updates selected.",
		);
		addMessage(
			"bot",
			"Any additional requirements? You can type them below or skip.",
		);
		setStage("customUpdates");
	};

	const skipCustomUpdates = () => {
		setCustomUpdates("");
		addMessage("user", "No additional requirements.");
		addMessage(
			"bot",
			"Add a job description for tailoring, or skip and generate now.",
		);
		setStage("jobDescription");
	};

	const skipJobDescription = () => {
		addMessage("user", "Skip job description");
		void generateResume("");
	};

	const generateResume = async (jobDescription: string) => {
		setStage("generating");
		setIsGenerating(true);
		addMessage("bot", "Generating your tailored resume now...");

		const selectedDescriptions = commonUpdates
			.filter((update) => selectedUpdates.includes(update.id))
			.map((update) => update.description);
		const combinedUpdates = [...selectedDescriptions, customUpdates]
			.filter(Boolean)
			.join("\n");

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

			if (!response.ok) throw new Error("Generation failed");

			const result = await response.json();
			setGeneratedResume(result.data);
			setStage("result");
			addMessage(
				"bot",
				"Your resume is ready. I shared it below — download it as a PDF.",
			);
		} catch {
			setStage("jobDescription");
			addMessage(
				"bot",
				"Something went wrong while generating. Please try again.",
			);
		} finally {
			setIsGenerating(false);
		}
	};

	const handleSubmitText = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const value = draftText.trim();

		if (stage === "paste") {
			if (!value) return;
			setResumeContent(value);
			addMessage("user", "Shared my resume content.");
			setDraftText("");
			askForUpdates();
			return;
		}

		if (stage === "structuredField") {
			const question = structuredQuestions[structuredFieldIndex];
			if (!question) return;
			if (question.required && !value) return;

			const updatedFields = { ...structuredFields, [question.key]: value };
			setStructuredFields(updatedFields);
			addMessage("user", value || "(left blank)");
			setDraftText("");

			if (structuredFieldIndex + 1 >= structuredQuestions.length) {
				setResumeContent(buildStructuredResumeContent(updatedFields));
				addMessage("bot", "Great, I captured your details.");
				askForUpdates();
				return;
			}

			const next = structuredFieldIndex + 1;
			setStructuredFieldIndex(next);
			const nextQuestion = structuredQuestions[next];
			if (nextQuestion) {
				addMessage(
					"bot",
					nextQuestion.required
						? `${nextQuestion.label} (required)`
						: `${nextQuestion.label} (optional)`,
				);
			}
			return;
		}

		if (stage === "customUpdates") {
			setCustomUpdates(value);
			addMessage("user", value || "No additional requirements.");
			setDraftText("");
			addMessage(
				"bot",
				"Paste the job description to tailor your resume, or skip this step.",
			);
			setStage("jobDescription");
			return;
		}

		if (stage === "jobDescription") {
			addMessage("user", value || "Skip job description");
			setDraftText("");
			void generateResume(value);
		}
	};

	const resetConversation = () => {
		setMessages(initialMessages);
		messageId.current = 3;
		setStage("method");
		setInputMethod(null);
		setDraftText("");
		setResumeContent("");
		setStructuredFields(initialStructuredFields);
		setStructuredFieldIndex(0);
		setSelectedUpdates([]);
		setCustomUpdates("");
		setGeneratedResume(null);
		setIsUploading(false);
		setIsGenerating(false);
	};

	return (
		<ResumeGeneratorWrapper>
			{generatedResume && <PrintResume data={generatedResume} />}
			<Card className="w-full max-w-4xl h-[90vh] flex flex-col">
				<CardHeader className="border-b">
					<div className="flex items-center justify-between gap-2">
						<CardTitle>REGEN Chat</CardTitle>
						<Button
							variant="outline"
							size="sm"
							onClick={resetConversation}
							className="cursor-pointer"
						>
							<RefreshCcw className="h-4 w-4 mr-2" />
							Start Over
						</Button>
					</div>
				</CardHeader>
				<CardContent className="flex-1 flex flex-col min-h-0 p-0">
					<div className="flex-1 overflow-y-auto p-4 space-y-4">
						{messages.map((message) => (
							<div
								key={message.id}
								className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
							>
								<div
									className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
										message.sender === "user"
											? "bg-primary text-primary-foreground"
											: "bg-muted"
									}`}
								>
									<div className="flex items-center gap-2 mb-1 opacity-80">
										{message.sender === "user" ? (
											<User className="h-3.5 w-3.5" />
										) : (
											<Bot className="h-3.5 w-3.5" />
										)}
										<span className="text-xs">
											{message.sender === "user" ? "You" : "Regen"}
										</span>
									</div>
									<p className="whitespace-pre-wrap">{message.text}</p>
								</div>
							</div>
						))}

						{isGenerating && (
							<div className="text-sm text-muted-foreground">Generating...</div>
						)}

						{stage === "result" && generatedResume && (
							<div className="space-y-3">
								<div className="flex flex-wrap gap-2">
									<Button onClick={handlePrint} className="cursor-pointer">
										<Download className="h-4 w-4 mr-2" />
										Download PDF
									</Button>
								</div>
								<div ref={resumeRef} className="border rounded-lg bg-white">
									<ResumeComponent data={generatedResume} />
								</div>
							</div>
						)}
					</div>

					<div className="border-t p-4 space-y-3">
						{stage === "method" && (
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
								<Button
									onClick={() => handleMethodSelect("upload")}
									variant="outline"
									className="cursor-pointer"
								>
									Upload Resume
								</Button>
								<Button
									onClick={() => handleMethodSelect("paste")}
									variant="outline"
									className="cursor-pointer"
								>
									Paste Resume
								</Button>
							</div>
						)}

						{stage === "pasteMode" && (
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
								<Button
									onClick={() => handlePasteModeSelect("simple")}
									variant="outline"
									className="cursor-pointer"
								>
									Simple Paste
								</Button>
								<Button
									onClick={() => handlePasteModeSelect("structured")}
									variant="outline"
									className="cursor-pointer"
								>
									Structured Form
								</Button>
							</div>
						)}

						{stage === "upload" && (
							<div className="space-y-2">
								<Button
									onClick={() => fileInputRef.current?.click()}
									disabled={isUploading}
									className="w-full cursor-pointer"
								>
									<Upload className="h-4 w-4 mr-2" />
									{isUploading ? "Processing file..." : "Choose Resume File"}
								</Button>
								<input
									ref={fileInputRef}
									type="file"
									accept=".pdf,.txt,.doc,.docx"
									onChange={handleFileUpload}
									className="hidden"
								/>
								<Button
									onClick={() => {
										setStage("pasteMode");
										addMessage("user", "Switching to paste mode");
										addMessage(
											"bot",
											"Do you want Simple Paste or Structured Form?",
										);
									}}
									variant="ghost"
									className="w-full cursor-pointer"
								>
									Paste instead
								</Button>
							</div>
						)}

						{stage === "updates" && (
							<div className="space-y-3">
								<Label className="text-sm">Select one or more updates</Label>
								<div className="max-h-44 overflow-y-auto space-y-2 pr-2">
									{commonUpdates.map((update) => (
										<button
											type="button"
											key={update.id}
											onClick={() =>
												setSelectedUpdates((prev) =>
													prev.includes(update.id)
														? prev.filter((id) => id !== update.id)
														: [...prev, update.id],
												)
											}
											className="w-full text-left flex items-start gap-3 border rounded-lg p-3 hover:bg-muted cursor-pointer"
										>
											<Checkbox
												checked={selectedUpdates.includes(update.id)}
												className="pointer-events-none"
											/>
											<div>
												<p className="text-sm font-medium">{update.label}</p>
												<p className="text-xs text-muted-foreground">
													{update.description}
												</p>
											</div>
										</button>
									))}
								</div>
								<Button
									onClick={handleContinueUpdates}
									className="w-full cursor-pointer"
								>
									Continue
								</Button>
							</div>
						)}

						{(stage === "paste" ||
							stage === "structuredField" ||
							stage === "customUpdates" ||
							stage === "jobDescription") && (
							<form onSubmit={handleSubmitText} className="space-y-2">
								{stage === "structuredField" && currentStructuredQuestion && (
									<p className="text-xs text-muted-foreground">
										{currentStructuredQuestion.required
											? `${currentStructuredQuestion.label} is required.`
											: `${currentStructuredQuestion.label} is optional.`}
									</p>
								)}
								<Textarea
									value={draftText}
									onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
										setDraftText(e.target.value)
									}
									rows={stage === "paste" ? 7 : 4}
									placeholder={
										stage === "paste"
											? "Paste your resume content..."
											: stage === "structuredField" && currentStructuredQuestion
												? currentStructuredQuestion.placeholder
												: stage === "customUpdates"
													? "Type any additional requirements (optional)..."
													: "Paste the job description (optional)..."
									}
								/>
								<div className="flex gap-2">
									<Button
										type="submit"
										disabled={disableTextSubmit}
										className="flex-1 cursor-pointer"
									>
										<Send className="h-4 w-4 mr-2" />
										Send
									</Button>
									{stage === "customUpdates" && (
										<Button
											type="button"
											onClick={skipCustomUpdates}
											variant="outline"
											className="cursor-pointer"
										>
											Skip
										</Button>
									)}
									{stage === "jobDescription" && (
										<Button
											type="button"
											onClick={skipJobDescription}
											variant="outline"
											disabled={isGenerating}
											className="cursor-pointer"
										>
											Skip
										</Button>
									)}
								</div>
							</form>
						)}

						{(stage === "generating" || stage === "result") &&
							inputMethod &&
							!generatedResume && (
								<div className="text-xs text-muted-foreground">
									{inputMethod === "upload"
										? "Using your uploaded resume as input."
										: inputMethod === "paste-simple"
											? "Using your pasted resume content as input."
											: "Using your structured chat responses as input."}
								</div>
							)}
					</div>
				</CardContent>
			</Card>
		</ResumeGeneratorWrapper>
	);
}
