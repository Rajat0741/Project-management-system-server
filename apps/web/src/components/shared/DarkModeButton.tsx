import { Toggle } from "@/components/ui/toggle";
import { Sun, Moon } from "lucide-react";
import { useThemeToggle } from "@/hooks/useTheme";

export default function DarkModeButton() {
  const { isDark, toggleTheme } = useThemeToggle();
  return (
    <Toggle
      variant={"outline"}
      className="bg-white dark:bg-black border"
      pressed={isDark}
      onPressedChange={toggleTheme}
    >
      <div>{isDark ? <Sun /> : <Moon />}</div>
    </Toggle>
  );
}
