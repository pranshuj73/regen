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

type GeneratedResume = unknown;

interface PersistedGeneration {
	navState: NavState;
	generatedResume: GeneratedResume;
	savedAt: number;
}

const LAST_GENERATION_STORAGE_KEY = "regen:last-generation";

const createInitialNavState = (): NavState => ({
	history: ["menu"],
	pageState: {
		upload: { content: "" },
		updates: { selectedIds: [], customUpdates: "", combinedText: "" },
		jd: { text: "" },
	},
});

const hasProgress = (navState: NavState, generatedResume: GeneratedResume) =>
	Boolean(
		navState.pageState.upload?.content?.trim() ||
			navState.pageState.updates?.combinedText?.trim() ||
			navState.pageState.jd?.text?.trim() ||
			generatedResume,
	);

const loadLastGeneration = (): PersistedGeneration | null => {
	try {
		const raw = window.localStorage.getItem(LAST_GENERATION_STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as PersistedGeneration;
		if (!parsed?.navState?.history?.length) return null;
		return parsed;
	} catch {
		return null;
	}
};

export default function Home() {
	const [navState, setNavState] = useState<NavState>(createInitialNavState);
	const [generatedResume, setGeneratedResume] = useState<GeneratedResume>("");
	const [isGenerating, setIsGenerating] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [hasLastGeneration, setHasLastGeneration] = useState(false);

	useEffect(() => {
		setHasLastGeneration(Boolean(loadLastGeneration()));
	}, []);

	useEffect(() => {
		if (!hasProgress(navState, generatedResume)) return;

		const payload: PersistedGeneration = {
			navState,
			generatedResume,
			savedAt: Date.now(),
		};
		window.localStorage.setItem(
			LAST_GENERATION_STORAGE_KEY,
			JSON.stringify(payload),
		);
		setHasLastGeneration(true);
	}, [generatedResume, navState]);

	const currentStep = navState.history[navState.history.length - 1];

	const handleContinueLastGeneration = () => {
		const saved = loadLastGeneration();
		if (!saved) {
			setHasLastGeneration(false);
			return;
		}
		setNavState(saved.navState);
		setGeneratedResume(saved.generatedResume ?? "");
		setIsGenerating(false);
		setIsUploading(false);
	};

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
		setNavState((prev) => ({
			...prev,
			pageState: { ...prev.pageState, jd: { text: jd } },
		}));
		setIsGenerating(true);
		setNavState((prev) => ({
			...prev,
			history: [...prev.history, "preview"],
		}));
		setTimeout(() => generateResume(), 0);
	};

	const handleJDChange = (text: string) => {
		setNavState((prev) => ({
			...prev,
			pageState: { ...prev.pageState, jd: { text } },
		}));
	};

	const generateResume = async () => {
		// Update to show generating state
		setIsGenerating(true);

		try {
			const payload = {
				content: navState.pageState.upload?.content || "",
				updates: navState.pageState.updates?.combinedText || "",
				jobDescription: navState.pageState.jd?.text || "",
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
			}
		} catch (_error) {
			// noop
			setIsGenerating(false);
		}
	};

	const handleGenerateNew = () => {
		window.localStorage.removeItem(LAST_GENERATION_STORAGE_KEY);
		setHasLastGeneration(false);
		setNavState(createInitialNavState());
		setGeneratedResume("");
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
									onContinue={
										hasLastGeneration ? handleContinueLastGeneration : undefined
									}
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
									onContinue={
										hasLastGeneration ? handleContinueLastGeneration : undefined
									}
								/>
							);
					}
				})()}
			</StepWrapper>
		</ResumeGeneratorWrapper>
	);
}
