"use client";

import { useEffect, useState } from "react";
import {
	JDStep,
	MenuStep,
	PasteStep,
	PreviewStep,
	ResumeGeneratorWrapper,
	StepWrapper,
	UpdatesStep,
	UploadStep,
} from "@/components/generator";

type Step = "menu" | "upload" | "paste" | "updates" | "jd" | "preview";

interface PageState {
	upload?: { content: string };
	updates?: {
		selectedIds: string[];
		customUpdates: string;
		combinedText: string;
	};
	jd?: { text: string };
}

interface NavState {
	history: Step[];
	pageState: PageState;
}

interface PersistedResumeSession {
	generatedResume: any;
	pageState: PageState;
	restoreStep: "preview";
	savedAt: number;
}

const LAST_RESUME_SESSION_KEY = "regen:last-resume-session";

const createDefaultPageState = (): PageState => ({
	upload: { content: "" },
	updates: { selectedIds: [], customUpdates: "", combinedText: "" },
	jd: { text: "" },
});

const createInitialNavState = (): NavState => ({
	history: ["menu"],
	pageState: createDefaultPageState(),
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null;

const isValidPageState = (value: unknown): value is PageState => {
	if (!isRecord(value)) {
		return false;
	}

	const upload = value.upload;
	const updates = value.updates;
	const jd = value.jd;

	if (!isRecord(upload) || typeof upload.content !== "string") {
		return false;
	}

	if (
		!isRecord(updates) ||
		!Array.isArray(updates.selectedIds) ||
		!updates.selectedIds.every((id: unknown) => typeof id === "string") ||
		typeof updates.customUpdates !== "string" ||
		typeof updates.combinedText !== "string"
	) {
		return false;
	}

	if (!isRecord(jd) || typeof jd.text !== "string") {
		return false;
	}

	return true;
};

const isValidPersistedSession = (
	value: unknown,
): value is PersistedResumeSession => {
	if (!isRecord(value)) {
		return false;
	}

	if (!isValidPageState(value.pageState)) {
		return false;
	}

	if (value.restoreStep !== "preview") {
		return false;
	}

	if (typeof value.savedAt !== "number") {
		return false;
	}

	if (!("generatedResume" in value)) {
		return false;
	}

	if (value.generatedResume === null || value.generatedResume === "") {
		return false;
	}

	return true;
};

export default function Home() {
	const [navState, setNavState] = useState<NavState>(createInitialNavState);
	const [generatedResume, setGeneratedResume] = useState<any>("");
	const [isGenerating, setIsGenerating] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [persistedSession, setPersistedSession] =
		useState<PersistedResumeSession | null>(null);

	const currentStep = navState.history[navState.history.length - 1];
	const hasPersistedHistory = persistedSession !== null;

	useEffect(() => {
		try {
			const rawSession = localStorage.getItem(LAST_RESUME_SESSION_KEY);
			if (!rawSession) {
				return;
			}

			const parsedSession: unknown = JSON.parse(rawSession);
			if (isValidPersistedSession(parsedSession)) {
				setPersistedSession(parsedSession);
				return;
			}

			localStorage.removeItem(LAST_RESUME_SESSION_KEY);
		} catch (error) {
			localStorage.removeItem(LAST_RESUME_SESSION_KEY);
			setPersistedSession(null);
		}
	}, []);

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			setIsUploading(true);
			const reader = new FileReader();
			reader.onload = async (e) => {
				const arrayBuffer = e.target?.result as ArrayBuffer;

				if (
					file.type === "application/pdf" ||
					file.name.toLowerCase().endsWith(".pdf")
				) {
					// Handle PDF files
					try {
						const response = await fetch("/api/parse-pdf", {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({
								filename: file.name,
								data: Array.from(new Uint8Array(arrayBuffer)),
							}),
						});

						if (response.ok) {
							const result = await response.json();
							setNavState((prev) => ({
								...prev,
								pageState: {
									...prev.pageState,
									upload: { content: result.text },
								},
								history: [...prev.history, "updates"],
							}));
						} else {
							alert(
								"Failed to parse PDF. Please try copying and pasting the text content instead.",
							);
						}
					} catch (error) {
						console.error("Error parsing PDF:", error);
						alert(
							"Failed to parse PDF. Please try copying and pasting the text content instead.",
						);
					} finally {
						setIsUploading(false);
					}
				} else {
					// Handle text files
					const content = new TextDecoder().decode(arrayBuffer);
					setNavState((prev) => ({
						...prev,
						pageState: { ...prev.pageState, upload: { content } },
						history: [...prev.history, "updates"],
					}));
				}
				setIsUploading(false);
			};
			reader.readAsArrayBuffer(file);
		}
	};

	const handlePasteInput = (content: string) => {
		setNavState((prev) => ({
			...prev,
			pageState: { ...prev.pageState, upload: { content } },
			history: [...prev.history, "updates"],
		}));
	};

	const handleUpdatesSubmit = (updates: string) => {
		setNavState((prev) => ({
			...prev,
			pageState: {
				...prev.pageState,
				updates: {
					selectedIds: prev.pageState.updates?.selectedIds || [],
					customUpdates: prev.pageState.updates?.customUpdates || "",
					combinedText: updates,
				},
			},
			history: [...prev.history, "jd"],
		}));
	};

	const handleUpdatesPersist = (meta: {
		selectedIds: string[];
		customUpdates: string;
		combinedText: string;
	}) => {
		setNavState((prev) => ({
			...prev,
			pageState: { ...prev.pageState, updates: meta },
		}));
	};

	const handleJDSubmit = (jd: string) => {
		const nextPageState: PageState = {
			...navState.pageState,
			jd: { text: jd },
		};

		setNavState((prev) => ({
			...prev,
			pageState: nextPageState,
		}));
		setIsGenerating(true);
		setNavState((prev) => ({
			...prev,
			history: [...prev.history, "preview"],
		}));
		setTimeout(() => generateResume(nextPageState), 0);
	};

	const handleJDChange = (text: string) => {
		setNavState((prev) => ({
			...prev,
			pageState: { ...prev.pageState, jd: { text } },
		}));
	};

	const generateResume = async (pageState: PageState = navState.pageState) => {
		// Update to show generating state
		setIsGenerating(true);

		try {
			const payload = {
				content: pageState.upload?.content || "",
				updates: pageState.updates?.combinedText || "",
				jobDescription: pageState.jd?.text || "",
			};
			const response = await fetch("/api/generate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (response.ok) {
				const result = await response.json();
				setGeneratedResume(result.data);
				setIsGenerating(false);

				const latestSession: PersistedResumeSession = {
					generatedResume: result.data,
					pageState,
					restoreStep: "preview",
					savedAt: Date.now(),
				};

				try {
					localStorage.setItem(
						LAST_RESUME_SESSION_KEY,
						JSON.stringify(latestSession),
					);
					setPersistedSession(latestSession);
				} catch (error) {
					console.error("Failed to persist latest resume session:", error);
				}
			}
		} catch (error) {
			// noop
			setIsGenerating(false);
		}
	};

	const handleGenerateNew = () => {
		try {
			localStorage.removeItem(LAST_RESUME_SESSION_KEY);
		} catch (error) {
			// noop
		}
		setPersistedSession(null);
		setNavState(createInitialNavState());
		setGeneratedResume("");
		setIsGenerating(false);
		setIsUploading(false);
	};

	const handleContinueLastResume = () => {
		if (!persistedSession) {
			return;
		}

		setNavState({
			history: ["menu", "updates", "jd", persistedSession.restoreStep],
			pageState: persistedSession.pageState,
		});
		setGeneratedResume(persistedSession.generatedResume);
		setIsGenerating(false);
		setIsUploading(false);
	};

	const navigateTo = (step: Step) => {
		setNavState((prev) => ({ ...prev, history: [...prev.history, step] }));
	};

	const goBack = () => {
		setNavState((prev) =>
			prev.history.length > 1
				? { ...prev, history: prev.history.slice(0, -1) }
				: prev,
		);
	};

	const canGoBack = navState.history.length > 1;

	return (
		<ResumeGeneratorWrapper>
			<StepWrapper showBackButton={canGoBack} onBack={goBack}>
				{(() => {
					switch (currentStep) {
						case "menu":
							return (
								<MenuStep
									onUpload={() => navigateTo("upload")}
									onPaste={() => navigateTo("paste")}
									hasPersistedHistory={hasPersistedHistory}
									onContinueLastResume={handleContinueLastResume}
								/>
							);
						case "upload":
							return (
								<UploadStep
									onFileUpload={handleFileUpload}
									onPasteResume={() => navigateTo("paste")}
									isUploading={isUploading}
								/>
							);
						case "paste":
							return (
								<PasteStep
									onSubmit={handlePasteInput}
									onUploadResume={() => navigateTo("upload")}
								/>
							);
						case "updates":
							return (
								<UpdatesStep
									onSubmit={handleUpdatesSubmit}
									onSubmitWithMeta={handleUpdatesPersist}
									initialSelectedIds={navState.pageState?.updates?.selectedIds}
									initialCustomUpdates={
										navState.pageState?.updates?.customUpdates
									}
								/>
							);
						case "jd":
							return (
								<JDStep
									onSubmit={handleJDSubmit}
									onSkip={() => {
										setIsGenerating(true);
										setNavState((prev) => ({
											...prev,
											history: [...prev.history, "preview"],
										}));
										setTimeout(() => generateResume(), 0);
									}}
									initialJD={navState.pageState?.jd?.text}
									onChangeJD={handleJDChange}
								/>
							);
						case "preview":
							return (
								<PreviewStep
									isGenerating={isGenerating}
									generatedResume={generatedResume}
									onDownload={() => {}}
									onGenerateNew={handleGenerateNew}
								/>
							);
						default:
							return (
								<MenuStep
									onUpload={() => navigateTo("upload")}
									onPaste={() => navigateTo("paste")}
									hasPersistedHistory={hasPersistedHistory}
									onContinueLastResume={handleContinueLastResume}
								/>
							);
					}
				})()}
			</StepWrapper>
		</ResumeGeneratorWrapper>
	);
}
