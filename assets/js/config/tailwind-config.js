tailwind.config = {
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
            },
            colors: {
                neonBlue: '#06b6d4',
                neonYellow: '#fbbf24',
            },
            boxShadow: {
                'neon-blue': '0 0 5px #06b6d4, 0 0 20px #06b6d4, 0 0 40px #06b6d4',
                'neon-yellow': '0 0 5px #fbbf24, 0 0 20px #fbbf24, 0 0 40px #fbbf24',
            },
            cursor: {
                'pencil': 'url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTcgM2EyLjgyOCAyLjgyOCAwIDEgMSA0IDRMNy41IDIwLjUgMiAyMmwxLjUtNS41TDE3IDN6Ij48L3BhdGg+PC9zdmc+) 0 24, auto',
                'pencil-dark': 'url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMzYjgyZjYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTcgM2EyLjgyOCAyLjgyOCAwIDEgMSA0IDRMNy41IDIwLjUgMiAyMmwxLjUtNS41TDE3IDN6Ij48L3BhdGg+PC9zdmc+) 0 24, auto',
            }
        }
    }
}
