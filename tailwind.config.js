import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
                poppins: ['Poppins', 'sans-serif'],
                poppinsBold: ['Poppins-SemiBold', 'sans-serif'],
                freckle: ['FreckleFace', 'cursive'],
                sfPro: ['SF-Pro-Display', 'sans-serif'],
                lightPoppins: ['Poppins-Light', 'sans-serif'],
                gochiHand: ['Gochi-Hand', 'cursive'],
                telegraf: ['Telegraf-Regular', 'sans-serif'],
            },
        },
    },

    plugins: [forms],
};