import { Moon, Sun } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
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
