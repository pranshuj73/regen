import { FileText, History, Upload } from "lucide-react";
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
	hasPersistedHistory: boolean;
	onContinueLastResume: () => void;
}

export function MenuStep({
	onUpload,
	onPaste,
	hasPersistedHistory,
	onContinueLastResume,
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
				{hasPersistedHistory && (
					<div className="border border-dashed border-blue-200 bg-blue-50/40 rounded-lg p-4">
						<p className="text-sm font-medium text-blue-900 mb-3">
							Continue where you left off
						</p>
						<Button
							onClick={onContinueLastResume}
							variant="outline"
							className="w-full bg-white hover:bg-blue-50 border-blue-200 hover:border-blue-300 cursor-pointer"
						>
							<History className="h-4 w-4 text-blue-700" />
							Continue last resume
						</Button>
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
					NB: We store resume data only in your browser (local storage), never on
					our servers.
					<br />
					Only your latest generated resume is kept locally. Click Generate New to
					start fresh.
				</p>
			</CardContent>
		</Card>
	);
}
