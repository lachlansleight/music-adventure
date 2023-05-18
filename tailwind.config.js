const colors = require("tailwindcss/colors");

module.exports = {
    purge: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                gray: colors.neutral,
                primary: colors.sky,
            },
        },
    },
    variants: {
        extend: {},
    },
    plugins: [],
};
