import { useTheme } from "next-themes";

export const useThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const isDark = theme === "dark";

  return {
    isDark,
    toggleTheme,
    theme,
  };
};
