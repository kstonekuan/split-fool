/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{svelte,js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				primary: {
					DEFAULT: "#2563eb",
					hover: "#1d4ed8",
				},
				secondary: "#64748b",
				success: "#22c55e",
				danger: "#ef4444",
				warning: "#f59e0b",
			},
		},
	},
	plugins: [],
};
