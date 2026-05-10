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

const LAST_GENERATION_STORAGE_KEY = "regen:last-generation";

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

interface LastGenerationState {
	navState: NavState;
	generatedResume: any;
	savedAt: string;
}

const initialNavState: NavState = {
	history: ["menu"],
	pageState: {
		upload: { content: "" },
		updates: { selectedIds: [], customUpdates: "", combinedText: "" },
		jd: { text: "" },
	},
};

export default function Home() {
	const [navState, setNavState] = useState<NavState>(initialNavState);
	const [generatedResume, setGeneratedResume] = useState<any>("");
	const [isGenerating, setIsGenerating] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [lastGeneration, setLastGeneration] =
		useState<LastGenerationState | null>(null);

	const currentStep = navState.history[navState.history.length - 1];

	useEffect(() => {
		if (typeof window === "undefined") return;
		try {
			const saved = window.localStorage.getItem(LAST_GENERATION_STORAGE_KEY);
			if (!saved) return;
			const parsed = JSON.parse(saved) as LastGenerationState;
			if (!parsed?.navState || !parsed?.generatedResume) return;
			setLastGeneration(parsed);
		} catch {
			window.localStorage.removeItem(LAST_GENERATION_STORAGE_KEY);
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
		const nextNavState: NavState = {
			...navState,
			pageState: { ...navState.pageState, jd: { text: jd } },
			history: [...navState.history, "preview"],
		};
		setNavState(nextNavState);
		setIsGenerating(true);
		setTimeout(() => generateResume(nextNavState), 0);
	};

	const handleJDChange = (text: string) => {
		setNavState((prev) => ({
			...prev,
			pageState: { ...prev.pageState, jd: { text } },
		}));
	};

	const generateResume = async (sourceNavState: NavState = navState) => {
		setIsGenerating(true);

		try {
			const payload = {
				content: sourceNavState.pageState.upload?.content || "",
				updates: sourceNavState.pageState.updates?.combinedText || "",
				jobDescription: sourceNavState.pageState.jd?.text || "",
			};
			const response = await fetch("/api/generate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (response.ok) {
				const result = await response.json();
				setGeneratedResume(result.data);
				const snapshot: LastGenerationState = {
					navState: sourceNavState,
					generatedResume: result.data,
					savedAt: new Date().toISOString(),
				};
				if (typeof window !== "undefined") {
					window.localStorage.setItem(
						LAST_GENERATION_STORAGE_KEY,
						JSON.stringify(snapshot),
					);
				}
				setLastGeneration(snapshot);
			}
		} catch {
			// noop
		} finally {
			setIsGenerating(false);
		}
	};

	const handleGenerateNew = () => {
		setNavState(initialNavState);
		setGeneratedResume("");
		setIsGenerating(false);
		setIsUploading(false);
	};

	const handleContinueFromLastGeneration = () => {
		if (!lastGeneration) return;

		const generatedResumeContent = JSON.stringify(
			lastGeneration.generatedResume,
			null,
			2,
		);

		setNavState({
			history: ["menu", "updates"],
			pageState: {
				upload: { content: generatedResumeContent },
				updates: lastGeneration.navState.pageState.updates || {
					selectedIds: [],
					customUpdates: "",
					combinedText: "",
				},
				jd: lastGeneration.navState.pageState.jd || { text: "" },
			},
		});
		setGeneratedResume(lastGeneration.generatedResume);
		setIsGenerating(false);
		setIsUploading(false);
	};

	const clearLastGeneration = () => {
		if (typeof window !== "undefined") {
			window.localStorage.removeItem(LAST_GENERATION_STORAGE_KEY);
		}
		setLastGeneration(null);
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
									onContinueFromLastGeneration={
										lastGeneration
											? handleContinueFromLastGeneration
											: undefined
									}
									onClearLastGeneration={
										lastGeneration ? clearLastGeneration : undefined
									}
									lastGenerationSavedAt={lastGeneration?.savedAt}
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
										const nextNavState: NavState = {
											...navState,
											history: [...navState.history, "preview"],
										};
										setIsGenerating(true);
										setNavState(nextNavState);
										setTimeout(() => generateResume(nextNavState), 0);
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
									onContinueFromLastGeneration={
										lastGeneration
											? handleContinueFromLastGeneration
											: undefined
									}
									onClearLastGeneration={
										lastGeneration ? clearLastGeneration : undefined
									}
									lastGenerationSavedAt={lastGeneration?.savedAt}
								/>
							);
					}
				})()}
			</StepWrapper>
		</ResumeGeneratorWrapper>
	);
}
