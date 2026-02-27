/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#000000",
                primary: "#FFFFFF",
                secondary: "#AEAEB2",
                accent: "#FF2D55",
                brand: {
                    DEFAULT: "#FF2D55",
                    light: "#FF375F",
                    dark: "#D02046",
                    muted: "#8A172F",
                    50: "#1C1C1E",
                    100: "#2C2C2E",
                    200: "#3A3A3C",
                },
                card: "#1C1C1E",
                "card-border": "#2C2C2E",
                warm: {
                    50: "#000000",
                    100: "#09090b",
                    200: "#18181b",
                },
            },
            fontFamily: {
                sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
                mono: ['"SF Mono"', '"Menlo"', '"Monaco"', '"Courier New"', 'monospace'],
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }
        },
    },
    plugins: [],
}
