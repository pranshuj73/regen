import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
	variable: "--font-geist-sans",
	subsets: ["latin"],
	display: "swap",
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "REGEN - (re)Generate Your Resume",
	description: "Generate a better version of your resume in seconds with AI.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${inter.variable} ${geistMono.variable} antialiased dark`}>
				{children}
			</body>
			<GoogleAnalytics gaId="G-V0FLTBFJ26" />
		</html>
	);
}
