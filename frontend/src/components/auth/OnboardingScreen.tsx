import { useEffect, useState } from "react";
import { MessageSquare, RefreshCw, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  sanitizeUsernameInput,
  validatePassword,
  validateUsername,
} from "@/lib/auth-service";

import { suggestUsername } from "@/lib/api";
import { ThemeToggle } from "@/components/chat/ThemeToggle";
import { cn } from "@/lib/utils";

export function OnboardingScreen() {
  const { register, switchToLogin, isNewUser } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Debounced availability check — abstracted, ready for real API.

  useEffect(() => {
  const load = async () => {
    const data = await suggestUsername();
    setUsername(data.username);
  };
  load();
  }, []);

  const usernameValidation = validateUsername(username);
  const passwordValidation = validatePassword(password);
  const canSubmit =
  usernameValidation.ok && passwordValidation.ok && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await register(username, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
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
            <h1 className="text-2xl font-bold tracking-tight">
              {isNewUser ? "Welcome to nexchat" : "Create your account"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Pick a username and password to get started.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wider text-muted-foreground">
                  USERNAME
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      value={username}
                      onChange={(e) => setUsername(sanitizeUsernameInput(e.target.value))}
                      maxLength={20}
                      placeholder="yourname123"
                      autoCapitalize="none"
                      autoComplete="off"
                      spellCheck={false}
                      className="w-full rounded-xl border border-border bg-panel-2 px-4 py-3 pr-10 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/40"
                    />
                    {username && usernameValidation.ok && (
                       <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                         valid
                        </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      const data = await suggestUsername();
                       setUsername(data.username);
                    } } 
                    aria-label="Generate new username"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-panel-2 transition-colors hover:bg-accent"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
                   <p className="text-xs text-muted-foreground">
                       {!usernameValidation.ok
                       ? usernameValidation.error
                       : "Select Username"}
                    </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wider text-muted-foreground">
                  PASSWORD
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-border bg-panel-2 px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/40"
                />
                {password && !passwordValidation.ok && (
                  <p className="text-xs text-destructive">{passwordValidation.error}</p>
                )}
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
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
              </button>
            </form>

            <button
              type="button"
              onClick={switchToLogin}
              className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground"
            >
              Already have an account? <span className="font-semibold">Log in</span>
            </button>
          </div>
        </div>
      </div>
      
    </main>

  );
}
