import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  green: "bg-[oklch(0.88_0.07_150)] text-[oklch(0.30_0.08_150)]",
  blue: "bg-[oklch(0.88_0.06_240)] text-[oklch(0.30_0.10_240)]",
  pink: "bg-[oklch(0.90_0.05_20)] text-[oklch(0.35_0.12_20)]",
  amber: "bg-[oklch(0.92_0.06_85)] text-[oklch(0.35_0.10_70)]",
  violet: "bg-[oklch(0.90_0.05_290)] text-[oklch(0.35_0.10_290)]",
};

export function Avatar({
  initials,
  tone = "violet",
  size = "md",
  className,
}: {
  initials: string;
  tone?: keyof typeof tones | string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-11 w-11 text-sm",
  };
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-semibold shrink-0",
        sizes[size],
        tones[tone] ?? tones.violet,
        className,
      )}
    >
      {initials}
    </div>
  );
}
