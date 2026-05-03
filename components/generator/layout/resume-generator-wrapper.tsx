import type { ReactNode } from "react";

interface ResumeGeneratorWrapperProps {
	children: ReactNode;
}

export function ResumeGeneratorWrapper({
	children,
}: ResumeGeneratorWrapperProps) {
	return (
		<main className="print:hidden relative min-h-screen overflow-hidden bg-[#0f1013] text-neutral-100">
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.16),_transparent_55%),radial-gradient(circle_at_80%_15%,_rgba(167,139,250,0.12),_transparent_45%),linear-gradient(180deg,_#121317_0%,_#0f1013_60%,_#0c0d10_100%)]" />
			<div className="relative mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4 py-8 sm:px-6">
				{children}
			</div>
		</main>
	);
}
