import { Clock3, FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface MenuStepProps {
	onUpload: () => void;
	onPaste: () => void;
	onContinueLastState?: () => void;
	hasLastState?: boolean;
}

export function MenuStep({
	onUpload,
	onPaste,
	onContinueLastState,
	hasLastState = false,
}: MenuStepProps) {
	return (
		<Card className="w-full h-full py-16">
			<CardHeader className="text-center mb-4">
				<CardTitle className="text-6xl font-bold text-white mb-2 mono">
					REGEN
				</CardTitle>
				<CardDescription className="text-gray-400 mx-auto">
					Upload your resume → Give us a job description → Get a tailored PDF
					resume in seconds.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{hasLastState && onContinueLastState && (
					<div className="rounded-lg border border-dashed border-blue-300 bg-blue-50/80 p-4">
						<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
							<div className="flex items-center gap-2 text-blue-700">
								<Clock3 className="h-4 w-4" />
								<p className="text-sm font-medium">Resume History</p>
							</div>
							<Button onClick={onContinueLastState} className="cursor-pointer">
								Continue Last Resume
							</Button>
						</div>
						<p className="mt-2 text-xs text-blue-700/80">
							Only your most recent generation is saved locally in this browser.
						</p>
					</div>
				)}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Button
						onClick={onUpload}
						className="h-32 flex flex-col items-center justify-center space-y-2 bg-white hover:bg-gray-50 border-2 border-dashed border-gray-300 hover:border-gray-400 cursor-pointer"
						variant="outline"
					>
						<Upload className="h-8 w-8 text-blue-600" />
						<span className="font-semibold">Upload Resume</span>
						<span className="text-sm text-gray-500">
							Upload your existing resume
						</span>
					</Button>

					<Button
						onClick={onPaste}
						className="h-32 flex flex-col items-center justify-center space-y-2 bg-white hover:bg-gray-50 border-2 border-dashed border-gray-300 hover:border-gray-400 cursor-pointer"
						variant="outline"
					>
						<FileText className="h-8 w-8 text-green-600" />
						<span className="font-semibold">Paste Resume</span>
						<span className="text-sm text-gray-500">
							Paste your resume content
						</span>
					</Button>
				</div>
				<p className="text-xs text-center text-gray-500 mt-10 -mb-10">
					NB: We don't use auth or a database. Your latest session is only
					stored in this browser.
					<br />
					Please download your resume when you're done.
				</p>
			</CardContent>
		</Card>
	);
}
