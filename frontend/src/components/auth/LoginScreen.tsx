import { useState } from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { sanitizeUsernameInput } from "@/lib/auth-service";
import { ThemeToggle } from "@/components/chat/ThemeToggle";
import { cn } from "@/lib/utils";

export function LoginScreen() {
  const { login, switchToOnboarding } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = username.length >= 3 && password.length >= 6 && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await login(username, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-md flex-col">
        <div className="flex items-center justify-between pb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-brand-foreground">
              <MessageSquare className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">nexchat</span>
          </div>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 flex-col justify-center">
          <div className="rounded-2xl border border-border bg-panel p-6 md:p-8">
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">Log in to continue chatting.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wider text-muted-foreground">
                  USERNAME
                </label>
                <input
                  value={username}
                  onChange={(e) => setUsername(sanitizeUsernameInput(e.target.value))}
                  placeholder="Your username"
                  autoCapitalize="none"
                  autoComplete="username"
                  spellCheck={false}
                  className="w-full rounded-xl border border-border bg-panel-2 px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/40"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wider text-muted-foreground">
                  PASSWORD
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-border bg-panel-2 px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/40"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className={cn(
                  "flex w-full items-center justify-center rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-brand-foreground transition-opacity",
                  !canSubmit && "opacity-50",
                )}
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log in"}
              </button>
            </form>

            <button
              type="button"
              onClick={switchToOnboarding}
              className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground"
            >
              New here? <span className="font-semibold">Create an account</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
