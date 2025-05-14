/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: 'rgb(var(--color-primary))',
                    light: 'rgb(var(--color-primary-light))',
                    dark: 'rgb(var(--color-primary-dark))',
                },
                secondary: {
                    DEFAULT: 'rgb(var(--color-secondary))',
                    light: 'rgb(var(--color-secondary-light))',
                    dark: 'rgb(var(--color-secondary-dark))',
                },
                accent: {
                    DEFAULT: 'rgb(var(--color-accent))',
                    light: 'rgb(var(--color-accent-light))',
                    dark: 'rgb(var(--color-accent-dark))',
                },
                success: 'rgb(var(--color-success))',
                warning: 'rgb(var(--color-warning))',
                error: 'rgb(var(--color-error))',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            spacing: {
                '72': '18rem',
                '80': '20rem',
                '96': '24rem',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-in-out',
                'slide-in': 'slideIn 0.3s ease-in-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideIn: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
    darkMode: 'class',
}