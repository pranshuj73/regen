import type { ReactNode } from "react";

interface ResumeGeneratorWrapperProps {
	children: ReactNode;
}

export function ResumeGeneratorWrapper({
	children,
}: ResumeGeneratorWrapperProps) {
	return (
		<main className="print:hidden min-h-screen bg-gradient-to-br from-neutral-900 to-neutral-800 flex items-center justify-center p-4">
			{children}
		</main>
	);
}
