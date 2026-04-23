import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface StepWrapperProps {
	children: ReactNode;
	onBack?: () => void;
	showBackButton?: boolean;
}

export function StepWrapper({
	children,
	onBack,
	showBackButton = false,
}: StepWrapperProps) {
	return (
		<div className="w-full">
			{showBackButton && onBack && (
				<div className="mb-4">
					<Button
						onClick={onBack}
						variant="ghost"
						size="sm"
						className="cursor-pointer border border-white/10 bg-white/[0.02] text-neutral-300 hover:bg-white/10 hover:text-white"
					>
						<ArrowLeft className="mr-1 h-4 w-4" />
						Back
					</Button>
				</div>
			)}

			<div className="flex flex-col justify-center">{children}</div>
		</div>
	);
}
