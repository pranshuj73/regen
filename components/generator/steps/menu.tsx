import { FileText, Upload } from "lucide-react";
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
}

export function MenuStep({ onUpload, onPaste }: MenuStepProps) {
	return (
		<Card className="w-full border border-white/10 bg-white/[0.03] py-14 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur-xl">
			<CardHeader className="mb-6 space-y-4 text-center">
				<p className="text-xs font-medium tracking-[0.18em] text-indigo-300/90 uppercase">
					Resume generator
				</p>
				<CardTitle className="text-5xl font-semibold tracking-tight text-neutral-100 sm:text-6xl">
					REGEN
				</CardTitle>
				<CardDescription className="mx-auto max-w-2xl text-sm text-neutral-400 sm:text-base">
					Upload your resume, add updates, include a role brief, and generate a
					tailored PDF in seconds.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-5">
				<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
					<Button
						onClick={onUpload}
						variant="outline"
						className="group h-36 cursor-pointer flex-col items-start justify-between gap-3 rounded-xl border border-white/15 bg-white/[0.02] p-5 text-left text-neutral-100 transition-colors hover:border-indigo-300/45 hover:bg-indigo-500/[0.08]"
					>
						<Upload className="h-5 w-5 text-indigo-300 transition-colors group-hover:text-indigo-200" />
						<div className="space-y-1">
							<span className="block text-base font-medium">Upload resume</span>
							<span className="block text-xs text-neutral-400">
								Select a PDF or text file.
							</span>
						</div>
					</Button>

					<Button
						onClick={onPaste}
						variant="outline"
						className="group h-36 cursor-pointer flex-col items-start justify-between gap-3 rounded-xl border border-white/15 bg-white/[0.02] p-5 text-left text-neutral-100 transition-colors hover:border-indigo-300/45 hover:bg-indigo-500/[0.08]"
					>
						<FileText className="h-5 w-5 text-indigo-300 transition-colors group-hover:text-indigo-200" />
						<div className="space-y-1">
							<span className="block text-base font-medium">Paste resume</span>
							<span className="block text-xs text-neutral-400">
								Paste plain-text resume content.
							</span>
						</div>
					</Button>
				</div>
				<p className="pt-2 text-center text-xs leading-relaxed text-neutral-500">
					No auth. No database. Your data is processed in session.
					<br />
					Download the generated resume before starting over.
				</p>
			</CardContent>
		</Card>
	);
}
