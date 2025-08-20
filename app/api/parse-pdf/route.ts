import pdf from "@cyber2024/pdf-parse-fixed";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const { filename, data } = await request.json();

		// Convert the array back to a Buffer
		const buffer = Buffer.from(data);

		// Parse the PDF
		const result = await pdf(buffer);

		return NextResponse.json({
			text: result.text,
			pages: result.numpages,
			info: result.info,
		});
	} catch (error) {
		console.error("Error parsing PDF:", error);
		return NextResponse.json(
			{ error: "Failed to parse PDF file" },
			{ status: 500 },
		);
	}
}
