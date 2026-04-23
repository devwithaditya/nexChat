import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className={cn(
        "relative inline-flex h-9 w-[72px] items-center rounded-full border border-border bg-panel-2 px-1 transition-colors",
      )}
    >
      <Sun className="h-4 w-4 text-amber-500 absolute left-2" />
      <Moon className="h-4 w-4 text-foreground/70 absolute right-2" />
      <span
        className={cn(
          "h-7 w-7 rounded-full bg-background shadow transition-transform",
          isDark ? "translate-x-[36px]" : "translate-x-0",
        )}
      />
    </button>
  );
}
