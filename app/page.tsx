"use client";

import {
	Bot,
	CheckCircle2,
	FileText,
	Loader2,
	Send,
	Upload,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	ResumeComponent,
	ResumeGeneratorWrapper,
} from "@/components/generator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useResumePrint } from "@/lib/pdf-utils";
import type { ResumeSchemaType } from "@/schema/resume";

type Source = "upload" | "paste";
type PasteMode = "simple" | "structured";

type Stage =
	| "resume-source"
	| "upload-file"
	| "paste-mode"
	| "paste-content"
	| "structured-name"
	| "structured-email"
	| "structured-phone"
	| "structured-summary"
	| "structured-experience"
	| "structured-education"
	| "structured-skills"
	| "structured-projects"
	| "updates"
	| "job-description-choice"
	| "job-description-text"
	| "generating"
	| "done";

interface Message {
	id: number;
	sender: "bot" | "user";
	content: string;
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

function buildStructuredContent(structuredData: {
	name: string;
	email: string;
	phone: string;
	summary: string;
	experience: string;
	education: string;
	skills: string;
	projects: string;
}) {
	return `
Name: ${structuredData.name}
Email: ${structuredData.email}
Phone: ${structuredData.phone}

Professional Summary:
${structuredData.summary}

Work Experience:
${structuredData.experience}

Education:
${structuredData.education}

Skills:
${structuredData.skills}

Projects:
${structuredData.projects}
	`.trim();
}

function getBotPrompt(stage: Stage): string | null {
	switch (stage) {
		case "resume-source":
			return "Let's begin 👋 How would you like to provide your current resume?";
		case "upload-file":
			return "Great choice. Please upload your resume file. PDF works best, and I'll extract the text for you.";
		case "paste-mode":
			return "Would you like to paste the full resume text, or fill it in using structured fields?";
		case "paste-content":
			return "Please paste your full resume content. Include sections like experience, education, and skills.";
		case "structured-name":
			return "Let's build your resume details step by step. What's your full name?";
		case "structured-email":
			return "What's your email address?";
		case "structured-phone":
			return "What's your phone number? (optional)";
		case "structured-summary":
			return "Share your professional summary.";
		case "structured-experience":
			return "Now paste your work experience details (roles, companies, dates, and impact).";
		case "structured-education":
			return "Please provide your education details.";
		case "structured-skills":
			return "List your technical and soft skills.";
		case "structured-projects":
			return "Any notable projects? (optional)";
		case "updates":
			return "What updates should I apply to your resume? Select all that apply, and add extra requirements if needed.";
		case "job-description-choice":
			return "Would you like to add a job description so I can tailor your resume for a specific role?";
		case "job-description-text":
			return "Paste the job description here. I'll optimize your resume for it.";
		default:
			return null;
	}
}

function summarizeUserMessage(stage: Stage, value: string): string {
	if (value === "Skipped") return "Skipped";
	if (
		stage === "paste-content" ||
		stage === "structured-experience" ||
		stage === "structured-summary" ||
		stage === "structured-education" ||
		stage === "structured-skills" ||
		stage === "structured-projects" ||
		stage === "job-description-text"
	) {
		return `Shared ${value.length} characters`;
	}
	return value;
}

export default function Home() {
	const [stage, setStage] = useState<Stage>("resume-source");
	const [messages, setMessages] = useState<Message[]>([]);
	const [textInput, setTextInput] = useState("");
	const [uploading, setUploading] = useState(false);
	const [generating, setGenerating] = useState(false);
	const [generatedResume, setGeneratedResume] =
		useState<ResumeSchemaType | null>(null);
	const [formData, setFormData] = useState({
		source: null as Source | null,
		pasteMode: null as PasteMode | null,
		uploadContent: "",
		pastedContent: "",
		structured: {
			name: "",
			email: "",
			phone: "",
			summary: "",
			experience: "",
			education: "",
			skills: "",
			projects: "",
		},
		selectedUpdates: [] as string[],
		customUpdates: "",
		combinedUpdates: "",
		jobDescription: "",
	});

	const [updatesSelection, setUpdatesSelection] = useState<string[]>([]);
	const [customUpdatesInput, setCustomUpdatesInput] = useState("");

	const messageIdRef = useRef(1);
	const chatEndRef = useRef<HTMLDivElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const resumePreviewRef = useRef<HTMLDivElement>(null);

	const handlePrint = useResumePrint(resumePreviewRef);

	const addMessage = useCallback((sender: "bot" | "user", content: string) => {
		setMessages((prev) => [
			...prev,
			{ id: messageIdRef.current++, sender, content },
		]);
	}, []);

	const moveToStage = (nextStage: Stage) => {
		setStage(nextStage);
		const prompt = getBotPrompt(nextStage);
		if (prompt) addMessage("bot", prompt);
	};

	const seedConversation = useCallback(() => {
		const prompt = getBotPrompt("resume-source");
		const initialMessages: Message[] = [
			{
				id: 1,
				sender: "bot",
				content:
					"Hi! I'm Regen Assistant. I'll guide you through a quick chat to generate your tailored resume PDF.",
			},
			...(prompt ? [{ id: 2, sender: "bot" as const, content: prompt }] : []),
		];
		setMessages(initialMessages);
		messageIdRef.current = initialMessages.length + 1;
	}, []);

	useEffect(() => {
		seedConversation();
	}, [seedConversation]);

	useEffect(() => {
		chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
	});

	const hasTextInput = useMemo(
		() =>
			[
				"paste-content",
				"structured-name",
				"structured-email",
				"structured-phone",
				"structured-summary",
				"structured-experience",
				"structured-education",
				"structured-skills",
				"structured-projects",
				"job-description-text",
			].includes(stage),
		[stage],
	);

	const getContentForGeneration = () => {
		if (formData.source === "upload") return formData.uploadContent;
		if (formData.pasteMode === "simple") return formData.pastedContent;
		return buildStructuredContent(formData.structured);
	};

	const generateResume = async (jobDescription: string) => {
		setGenerating(true);
		setStage("generating");
		addMessage(
			"bot",
			"Perfect — give me a moment while I craft your tailored resume.",
		);

		try {
			const payload = {
				content: getContentForGeneration(),
				updates: formData.combinedUpdates,
				jobDescription,
			};

			const response = await fetch("/api/generate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				throw new Error("Failed to generate resume");
			}

			const result = await response.json();
			setGeneratedResume(result.data);
			setGenerating(false);
			setStage("done");
			addMessage(
				"bot",
				"Your resume is ready ✅ I've shared it below. Click Download PDF to save it.",
			);
		} catch (_error) {
			setGenerating(false);
			moveToStage("job-description-choice");
			addMessage(
				"bot",
				"I couldn't generate your resume this time. Please try again in a moment.",
			);
		}
	};

	const handleFileUpload = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		if (!file) return;

		setUploading(true);
		addMessage("user", `Uploaded file: ${file.name}`);

		try {
			const arrayBuffer = await file.arrayBuffer();

			if (
				file.type === "application/pdf" ||
				file.name.toLowerCase().endsWith(".pdf")
			) {
				const response = await fetch("/api/parse-pdf", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						filename: file.name,
						data: Array.from(new Uint8Array(arrayBuffer)),
					}),
				});

				if (!response.ok) {
					throw new Error("Failed to parse PDF");
				}

				const result = await response.json();
				setFormData((prev) => ({ ...prev, uploadContent: result.text }));
				addMessage(
					"bot",
					"Resume received. I extracted the content successfully.",
				);
				moveToStage("updates");
			} else {
				const content = new TextDecoder().decode(arrayBuffer);
				setFormData((prev) => ({ ...prev, uploadContent: content }));
				addMessage("bot", "Resume received. I captured the text content.");
				moveToStage("updates");
			}
		} catch (_error) {
			addMessage(
				"bot",
				"I couldn't process that file. Please upload a PDF/TXT file or switch to paste mode.",
			);
		} finally {
			setUploading(false);
			event.target.value = "";
		}
	};

	const submitTextAnswer = () => {
		const value = textInput.trim();
		const optionalField =
			stage === "structured-phone" || stage === "structured-projects";
		if (!value && !optionalField) return;

		const userValue = value || "Skipped";
		addMessage("user", summarizeUserMessage(stage, userValue));
		setTextInput("");

		switch (stage) {
			case "paste-content":
				setFormData((prev) => ({ ...prev, pastedContent: userValue }));
				moveToStage("updates");
				return;
			case "structured-name":
				setFormData((prev) => ({
					...prev,
					structured: { ...prev.structured, name: userValue },
				}));
				moveToStage("structured-email");
				return;
			case "structured-email":
				setFormData((prev) => ({
					...prev,
					structured: { ...prev.structured, email: userValue },
				}));
				moveToStage("structured-phone");
				return;
			case "structured-phone":
				setFormData((prev) => ({
					...prev,
					structured: { ...prev.structured, phone: value },
				}));
				moveToStage("structured-summary");
				return;
			case "structured-summary":
				setFormData((prev) => ({
					...prev,
					structured: { ...prev.structured, summary: userValue },
				}));
				moveToStage("structured-experience");
				return;
			case "structured-experience":
				setFormData((prev) => ({
					...prev,
					structured: { ...prev.structured, experience: userValue },
				}));
				moveToStage("structured-education");
				return;
			case "structured-education":
				setFormData((prev) => ({
					...prev,
					structured: { ...prev.structured, education: userValue },
				}));
				moveToStage("structured-skills");
				return;
			case "structured-skills":
				setFormData((prev) => ({
					...prev,
					structured: { ...prev.structured, skills: userValue },
				}));
				moveToStage("structured-projects");
				return;
			case "structured-projects":
				setFormData((prev) => ({
					...prev,
					structured: { ...prev.structured, projects: value },
				}));
				moveToStage("updates");
				return;
			case "job-description-text":
				setFormData((prev) => ({ ...prev, jobDescription: userValue }));
				void generateResume(userValue);
				return;
			default:
				return;
		}
	};

	const handleUpdatesContinue = () => {
		const selectedDescriptions = commonUpdates
			.filter((item) => updatesSelection.includes(item.id))
			.map((item) => item.description);

		const combinedText = [...selectedDescriptions, customUpdatesInput]
			.filter(Boolean)
			.join("\n");

		setFormData((prev) => ({
			...prev,
			selectedUpdates: updatesSelection,
			customUpdates: customUpdatesInput,
			combinedUpdates: combinedText,
		}));

		const selectedLabels = commonUpdates
			.filter((item) => updatesSelection.includes(item.id))
			.map((item) => item.label)
			.join(", ");

		addMessage(
			"user",
			selectedLabels
				? `Selected updates: ${selectedLabels}`
				: "No predefined updates selected",
		);

		if (customUpdatesInput.trim()) {
			addMessage("user", "Added custom requirements");
		}

		moveToStage("job-description-choice");
	};

	const resetFlow = () => {
		setStage("resume-source");
		setTextInput("");
		setUploading(false);
		setGenerating(false);
		setGeneratedResume(null);
		setUpdatesSelection([]);
		setCustomUpdatesInput("");
		setFormData({
			source: null,
			pasteMode: null,
			uploadContent: "",
			pastedContent: "",
			structured: {
				name: "",
				email: "",
				phone: "",
				summary: "",
				experience: "",
				education: "",
				skills: "",
				projects: "",
			},
			selectedUpdates: [],
			customUpdates: "",
			combinedUpdates: "",
			jobDescription: "",
		});
		seedConversation();
	};

	return (
		<ResumeGeneratorWrapper>
			<Card className="w-full max-w-5xl h-[90vh] flex flex-col">
				<CardHeader className="border-b">
					<CardTitle className="flex items-center gap-2 text-xl">
						<Bot className="h-5 w-5" />
						REGEN Chat Assistant
					</CardTitle>
				</CardHeader>

				<CardContent className="flex-1 min-h-0 p-0 flex flex-col">
					<div className="flex-1 overflow-y-auto p-4 space-y-4">
						{messages.map((message) => (
							<div
								key={message.id}
								className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
							>
								<div
									className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
										message.sender === "user"
											? "bg-white text-black"
											: "bg-neutral-800 text-neutral-100"
									}`}
								>
									{message.content}
								</div>
							</div>
						))}

						{generating && (
							<div className="flex justify-start">
								<div className="bg-neutral-800 text-neutral-100 rounded-2xl px-4 py-3 text-sm flex items-center gap-2">
									<Loader2 className="h-4 w-4 animate-spin" />
									Generating your resume...
								</div>
							</div>
						)}

						{stage === "done" && generatedResume && (
							<div className="space-y-3 border rounded-lg p-3 bg-neutral-950/60">
								<div className="flex flex-wrap gap-2">
									<Button onClick={handlePrint} className="cursor-pointer">
										<FileText className="h-4 w-4 mr-2" />
										Download PDF
									</Button>
									<Button
										onClick={resetFlow}
										variant="outline"
										className="cursor-pointer"
									>
										Start New Resume
									</Button>
								</div>
								<div ref={resumePreviewRef} className="bg-white rounded-lg p-2">
									<ResumeComponent data={generatedResume} />
								</div>
							</div>
						)}

						<div ref={chatEndRef} />
					</div>

					<div className="border-t p-4 space-y-3">
						{stage === "resume-source" && (
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
								<Button
									onClick={() => {
										setFormData((prev) => ({ ...prev, source: "upload" }));
										addMessage("user", "Upload my resume");
										moveToStage("upload-file");
									}}
									variant="outline"
									className="cursor-pointer"
								>
									<Upload className="h-4 w-4 mr-2" /> Upload Resume
								</Button>
								<Button
									onClick={() => {
										setFormData((prev) => ({ ...prev, source: "paste" }));
										addMessage("user", "Paste my resume");
										moveToStage("paste-mode");
									}}
									variant="outline"
									className="cursor-pointer"
								>
									<FileText className="h-4 w-4 mr-2" /> Paste Resume
								</Button>
							</div>
						)}

						{stage === "upload-file" && (
							<div className="space-y-2">
								<input
									ref={fileInputRef}
									type="file"
									accept=".pdf,.txt,.doc,.docx"
									onChange={handleFileUpload}
									className="hidden"
								/>
								<Button
									onClick={() => fileInputRef.current?.click()}
									disabled={uploading}
									className="w-full cursor-pointer"
								>
									{uploading ? (
										<>
											<Loader2 className="h-4 w-4 animate-spin mr-2" />
											Processing resume...
										</>
									) : (
										<>
											<Upload className="h-4 w-4 mr-2" />
											Choose Resume File
										</>
									)}
								</Button>
								<Button
									onClick={() => {
										addMessage("user", "Switch to paste mode");
										moveToStage("paste-mode");
									}}
									variant="ghost"
									className="w-full cursor-pointer"
								>
									Use paste instead
								</Button>
							</div>
						)}

						{stage === "paste-mode" && (
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
								<Button
									onClick={() => {
										setFormData((prev) => ({ ...prev, pasteMode: "simple" }));
										addMessage("user", "Simple paste");
										moveToStage("paste-content");
									}}
									variant="outline"
									className="cursor-pointer"
								>
									Simple Paste
								</Button>
								<Button
									onClick={() => {
										setFormData((prev) => ({
											...prev,
											pasteMode: "structured",
										}));
										addMessage("user", "Structured fields");
										moveToStage("structured-name");
									}}
									variant="outline"
									className="cursor-pointer"
								>
									Structured Form
								</Button>
							</div>
						)}

						{stage === "updates" && (
							<div className="space-y-3">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
									{commonUpdates.map((update) => (
										<button
											type="button"
											key={update.id}
											onClick={() => {
												setUpdatesSelection((prev) =>
													prev.includes(update.id)
														? prev.filter((id) => id !== update.id)
														: [...prev, update.id],
												);
											}}
											className="text-left border rounded-lg p-3 hover:bg-neutral-900 cursor-pointer"
										>
											<div className="flex items-start gap-2">
												<Checkbox
													checked={updatesSelection.includes(update.id)}
												/>
												<div>
													<p className="text-sm font-medium">{update.label}</p>
													<p className="text-xs text-neutral-400">
														{update.description}
													</p>
												</div>
											</div>
										</button>
									))}
								</div>
								<Textarea
									value={customUpdatesInput}
									onChange={(e) => setCustomUpdatesInput(e.target.value)}
									placeholder="Any additional requirements? (optional)"
									rows={3}
								/>
								<Button
									onClick={handleUpdatesContinue}
									className="w-full cursor-pointer"
								>
									Continue
								</Button>
							</div>
						)}

						{stage === "job-description-choice" && (
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
								<Button
									onClick={() => {
										addMessage("user", "Yes, I'll provide a job description");
										moveToStage("job-description-text");
									}}
									variant="outline"
									className="cursor-pointer"
								>
									Yes, tailor it
								</Button>
								<Button
									onClick={() => {
										addMessage("user", "Skip job description");
										void generateResume("");
									}}
									variant="outline"
									className="cursor-pointer"
								>
									No, continue without it
								</Button>
							</div>
						)}

						{hasTextInput && (
							<form
								onSubmit={(e) => {
									e.preventDefault();
									submitTextAnswer();
								}}
								className="space-y-2"
							>
								{stage === "structured-email" ? (
									<Input
										value={textInput}
										onChange={(e) => setTextInput(e.target.value)}
										type="email"
										required
										placeholder="name@example.com"
									/>
								) : (
									<Textarea
										value={textInput}
										onChange={(e) => setTextInput(e.target.value)}
										rows={
											stage === "structured-name" ||
											stage === "structured-phone"
												? 1
												: 4
										}
										placeholder="Type your response..."
										required={
											stage !== "structured-phone" &&
											stage !== "structured-projects"
										}
									/>
								)}

								<div className="flex gap-2">
									<Button type="submit" className="cursor-pointer flex-1">
										<Send className="h-4 w-4 mr-2" /> Send
									</Button>
									{(stage === "structured-phone" ||
										stage === "structured-projects") && (
										<Button
											type="button"
											variant="outline"
											onClick={submitTextAnswer}
											className="cursor-pointer"
										>
											Skip
										</Button>
									)}
								</div>
							</form>
						)}

						{stage === "done" && (
							<div className="text-xs text-neutral-400 flex items-center gap-1">
								<CheckCircle2 className="h-4 w-4" />
								Conversation complete
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</ResumeGeneratorWrapper>
	);
}
