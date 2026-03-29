/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#DAF1DE',   // Very light mint
                    100: '#C8E8CE',  // Light sage
                    200: '#B0DDB8',  // Soft green
                    300: '#9FD2A7',  // Medium sage
                    400: '#8EB69B',  // Sage green
                    500: '#5C8471',  // Teal blend
                    600: '#235347',  // Medium dark teal
                    700: '#163932',  // Dark teal
                    800: '#0B2B26',  // Very dark teal
                    900: '#051F20',  // Darkest teal
                    950: '#030F10',  // Almost black teal
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
