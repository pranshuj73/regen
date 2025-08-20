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
								<div className="flex items-center justify-center h-64">
									<div className="text-center">
										<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
										<p className="text-lg font-semibold">
											Generating your resume...
										</p>
										<p className="text-gray-500">This may take a few moments</p>
									</div>
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
