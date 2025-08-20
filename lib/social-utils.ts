// Function to extract username from social media URLs
export function extractUsername(
	value: string,
	platform: "linkedin" | "github",
): string {
	if (!value) return "";

	// If it's already just a username (no slashes or dots), return as is
	if (!value.includes("/") && !value.includes(".")) {
		return value;
	}

	// Handle LinkedIn URLs
	if (platform === "linkedin") {
		// Match patterns like linkedin.com/in/username or https://linkedin.com/in/username
		const match = value.match(/linkedin\.com\/in\/([^/?#]+)/);
		if (match) {
			return match[1];
		}
		// If it's just a username with @ prefix, remove it
		if (value.startsWith("@")) {
			return value.substring(1);
		}
	}

	// Handle GitHub URLs
	if (platform === "github") {
		// Match patterns like github.com/username or https://github.com/username
		const match = value.match(/github\.com\/([^/?#]+)/);
		if (match) {
			return match[1];
		}
		// If it's just a username with @ prefix, remove it
		if (value.startsWith("@")) {
			return value.substring(1);
		}
	}

	// If we can't extract, return the original value
	return value;
}
