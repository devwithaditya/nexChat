import { useEffect, useState } from "react";
import { MessageSquare, LogOut } from "lucide-react";
import { Avatar } from "./Avatar";
import { ThemeToggle } from "./ThemeToggle";
import type { Conversation } from "@/lib/chat-data";
import { cn } from "@/lib/utils";
import { searchUsers } from "@/lib/api";

export function Sidebar({
  conversations,
  activeId,
  onSelect,
  query,
  onQuery,
  findUser,
  onFindUser,
  currentUsername,
  onLogout,
  onUserSelect,
  onlineUsers,
}: {
  conversations: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
  query: string;
  onQuery: (v: string) => void;
  findUser: string;
  onFindUser: (v: string) => void;
  currentUsername?: string;
  onLogout?: () => void;
  onUserSelect?: (user: any) => void;
  onlineUsers?: string[];
}) {
  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!findUser || findUser.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);

    const t = setTimeout(async () => {
      try {
        const data = await searchUsers(findUser);
        setResults(data);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [findUser]);

  return (
    <aside className="flex h-full w-full max-w-[320px] flex-col gap-4 rounded-2xl border border-border bg-panel p-4">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-brand-foreground">
            <MessageSquare className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">nexchat</span>
        </div>
        <ThemeToggle />
      </div>

      {/* Search */}
      <input
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        placeholder="Search conversations..."
        className="w-full rounded-xl border border-border bg-panel-2 px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/40"
      />

      {/* FIND PEOPLE */}
      <div>
        <div className="px-1 pb-2 text-xs font-semibold tracking-wider text-muted-foreground">
          FIND PEOPLE
        </div>

        <input
          value={findUser}
          onChange={(e) => onFindUser(e.target.value)}
          placeholder="@username"
          className="w-full rounded-xl border border-border bg-panel-2 px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/40"
        />

        {loading && (
          <p className="text-xs text-muted-foreground mt-2 px-1">
            Searching...
          </p>
        )}

        {results.length > 0 && (
          <div className="mt-2 space-y-1">
            {results.map((user) => (
              <div
                key={user._id}
                className="cursor-pointer rounded-lg px-3 py-2 hover:bg-panel-2 text-sm"
                onClick={() => {
                  onUserSelect && onUserSelect(user);
                  onFindUser("");
                  setResults([]);
                }}
              >
                @{user.username}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-1 pb-2 text-xs font-semibold tracking-wider text-muted-foreground">
          MESSAGES
        </div>

        <ul className="space-y-1">
          {filtered.map((c) => {
            const isOnline = onlineUsers?.includes(c.name);

            return (
              <li key={c.id}>
                <button
                  onClick={() => onSelect(c.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-panel-2",
                    activeId === c.id && "bg-panel-2"
                  )}
                >
                  
                  {/* 🔥 AVATAR WITH ONLINE DOT */}
                  <div className="relative">
                    <Avatar
                      initials={c.initials}
                      tone={c.avatarTone}
                    />

                    {isOnline && (
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-panel shadow-md"></span>
                    )}
                  </div>

                  {/* TEXT */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-semibold">
                        {c.name}
                      </span>

                      <span className="shrink-0 text-xs text-muted-foreground">
                        {c.time && !isNaN(new Date(c.time).getTime())
                          ? new Date(c.time).toLocaleTimeString([], {
                              hour: "numeric",
                              minute: "2-digit",
                            })
                          : ""}
                      </span>
                    </div>

                    <div className="truncate text-sm text-muted-foreground">
                      {c.preview}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* User Info */}
      {currentUsername && (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-panel-2 px-3 py-2">
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">
              signed in as
            </div>
            <div className="truncate text-sm font-semibold">
              @{currentUsername}
            </div>
          </div>

          <button
            onClick={onLogout}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      )}
    </aside>
  );
}