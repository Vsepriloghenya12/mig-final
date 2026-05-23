/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.js",
    "./index.js",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#FBFAFF",
        foreground: "#15142D",
        card: "#FFFFFF",
        "card-foreground": "#15142D",
        popover: "#FFFFFF",
        "popover-foreground": "#15142D",
        primary: "#F22D8F",
        "primary-foreground": "#FFFFFF",
        secondary: "#F6F2FF",
        "secondary-foreground": "#15142D",
        muted: "#F6F2FF",
        "muted-foreground": "#7D7890",
        accent: "#FFF0F7",
        "accent-foreground": "#15142D",
        destructive: "#E5484D",
        "destructive-foreground": "#FFFFFF",
        border: "#ECE8F6",
        input: "#ECE8F6",
        ring: "#F22D8F",
      },
      borderRadius: {
        sm: "14px",
        md: "18px",
        lg: "22px",
        xl: "30px",
      },
    },
  },
  plugins: [],
};
