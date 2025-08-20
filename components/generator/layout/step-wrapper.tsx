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
		<div className="w-full max-w-full md:max-w-5xl lg:max-w-4xl">
			{/* Navigation Bar */}
			{showBackButton && (
				<div className="flex justify-between items-center mb-4">
					<div className="flex gap-2">
						{showBackButton && onBack && (
							<Button
								onClick={onBack}
								variant="ghost"
								size="sm"
								className="cursor-pointer"
							>
								<ArrowLeft className="h-4 w-4 mr-1" />
								Back
							</Button>
						)}
					</div>
				</div>
			)}

			{/* Content */}
			<div className="flex flex-col justify-center">{children}</div>
		</div>
	);
}
