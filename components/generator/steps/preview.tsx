import { Download, Eye, FileText, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useResumePrint } from "@/lib/pdf-utils";
import { LatexViewer } from "../resume/latex-viewer";
import { PrintResume } from "../resume/print-resume";
import { ResumeComponent } from "../resume/resume-component";

// Skeleton Resume Component
function SkeletonResume() {
	return (
		<div className="animate-pulse">
			{/* Header */}
			<div className="mb-6">
				<div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
				<div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
				<div className="h-4 bg-gray-200 rounded w-2/3"></div>
			</div>

			{/* Summary */}
			<div className="mb-6">
				<div className="h-5 bg-gray-200 rounded w-1/4 mb-3"></div>
				<div className="space-y-2">
					<div className="h-3 bg-gray-200 rounded w-full"></div>
					<div className="h-3 bg-gray-200 rounded w-5/6"></div>
					<div className="h-3 bg-gray-200 rounded w-4/5"></div>
				</div>
			</div>

			{/* Experience */}
			<div className="mb-6">
				<div className="h-5 bg-gray-200 rounded w-1/4 mb-3"></div>
				<div className="space-y-4">
					<div>
						<div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
						<div className="h-3 bg-gray-200 rounded w-1/4 mb-2"></div>
						<div className="space-y-1">
							<div className="h-3 bg-gray-200 rounded w-full"></div>
							<div className="h-3 bg-gray-200 rounded w-5/6"></div>
							<div className="h-3 bg-gray-200 rounded w-4/5"></div>
						</div>
					</div>
					<div>
						<div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
						<div className="h-3 bg-gray-200 rounded w-1/4 mb-2"></div>
						<div className="space-y-1">
							<div className="h-3 bg-gray-200 rounded w-full"></div>
							<div className="h-3 bg-gray-200 rounded w-5/6"></div>
						</div>
					</div>
				</div>
			</div>

			{/* Education */}
			<div className="mb-6">
				<div className="h-5 bg-gray-200 rounded w-1/4 mb-3"></div>
				<div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
				<div className="h-3 bg-gray-200 rounded w-1/4"></div>
			</div>

			{/* Skills */}
			<div>
				<div className="h-5 bg-gray-200 rounded w-1/4 mb-3"></div>
				<div className="flex flex-wrap gap-2">
					<div className="h-6 bg-gray-200 rounded w-16"></div>
					<div className="h-6 bg-gray-200 rounded w-20"></div>
					<div className="h-6 bg-gray-200 rounded w-14"></div>
					<div className="h-6 bg-gray-200 rounded w-18"></div>
					<div className="h-6 bg-gray-200 rounded w-12"></div>
				</div>
			</div>
		</div>
	);
}

interface PreviewStepProps {
	isGenerating: boolean;
	generatedResume: any;
	onDownload: () => void;
	onGenerateNew: () => void;
}

export function PreviewStep({
	isGenerating,
	generatedResume,
	onDownload,
	onGenerateNew,
}: PreviewStepProps) {
	const contentRef = useRef<HTMLDivElement>(null);
	const handlePrint = useResumePrint(contentRef);
	const [showLatex, setShowLatex] = useState(false);

	return (
		<>
			{/* Print-only resume component */}
			{generatedResume && <PrintResume data={generatedResume} />}

			{/* LaTeX Viewer Modal */}
			{showLatex && generatedResume && (
				<LatexViewer
					data={generatedResume}
					onClose={() => setShowLatex(false)}
				/>
			)}

			{/* Main UI - hidden when printing */}
			<div className="print:hidden">
				<Card>
					<CardHeader>
						<div className="flex md:flex-row flex-col justify-between items-start md:items-center gap-4">
							<div>
								<CardTitle>Generated Resume</CardTitle>
								<CardDescription>Preview your generated resume</CardDescription>
							</div>
							<div className="flex flex-wrap items-center gap-2">
								<Button
									onClick={handlePrint}
									className="flex items-center space-x-2 cursor-pointer"
								>
									<Download className="h-4 w-4" />
									Print Resume
								</Button>
								<Button
									onClick={() => setShowLatex(true)}
									variant="outline"
									className="flex items-center space-x-2 cursor-pointer"
								>
									<FileText className="h-4 w-4" />
									View LaTeX
								</Button>
								<Button
									onClick={onGenerateNew}
									variant="outline"
									className="flex items-center space-x-2 cursor-pointer"
								>
									<Sparkles className="h-4 w-4" />
									Generate New
								</Button>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<div className="bg-white border rounded-lg p-6 min-h-[600px]">
							{isGenerating ? (
								<div className="space-y-4">
									<div className="text-center mb-6">
										<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
										<p className="text-lg font-semibold">
											Crafting your perfect resume...
										</p>
										<p className="text-gray-500">Our AI is tailoring your experience to match the job description</p>
									</div>
									<SkeletonResume />
								</div>
							) : (
								<div className="prose max-w-none">
									{generatedResume ? (
										<div ref={contentRef}>
											<ResumeComponent data={generatedResume} />
										</div>
									) : (
										<div className="text-center text-gray-500 py-8">
											<Eye className="h-12 w-12 mx-auto mb-4 text-gray-400" />
											<p>Resume preview will appear here</p>
										</div>
									)}
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		</>
	);
}
