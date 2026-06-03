"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { useToast } from "@/components/Toast";

type Thread = {
  id: string;
  user_id: string;
  subject: string | null;
  status: "open" | "pending" | "closed";
  priority: string;
  last_message_at: string;
  last_message_preview: string | null;
  admin_unread: number;
  user_unread: number;
  created_at: string;
  // joined via RPC/Query
  user_name?: string | null;
  user_email?: string | null;
  user_country?: string | null;
  user_is_beta?: boolean | null;
};

type Msg = {
  id: string;
  thread_id: string;
  sender_id: string;
  sender_role: "user" | "admin" | "mod" | "system";
  body: string;
  created_at: string;
};

const STATUS_FILTERS = [
  { id: "open",    label: "Offen",      color: "#22c55e" },
  { id: "pending", label: "Wartend",    color: "#FFB800" },
  { id: "closed",  label: "Geschlossen", color: "#9ca3af" },
] as const;

export default function AdminChatInbox() {
  const { toast } = useToast();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "pending" | "closed">("open");
  const [search, setSearch] = useState("");
  const [counts, setCounts] = useState({ open_count: 0, pending_count: 0, closed_count: 0, unread_threads: 0, total_unread: 0 });

  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    load();
    // Realtime: neue Messages in IRGENDEINEM Thread → Liste neu laden
    const supabase = createClient();
    const ch = supabase.channel("admin_chat_threads")
      .on("postgres_changes",
        { event: "*", schema: "public", table: "chat_threads" },
        () => load()
      )
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        () => load()
      )
      .subscribe();
    return () => { ch.unsubscribe(); };
  }, []);

  async function load() {
    const supabase = createClient();
    const [{ data: t }, { data: c }, { data: emails }] = await Promise.all([
      supabase.from("chat_threads").select("*").order("last_message_at", { ascending: false }),
      supabase.rpc("admin_chat_counts"),
      supabase.rpc("admin_user_emails"),
    ]);

    // User-Infos joinen
    const userIds = Array.from(new Set((t || []).map((x: any) => x.user_id)));
    let profileMap: Record<string, any> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase.from("profiles")
        .select("id, display_name, country, is_beta").in("id", userIds);
      for (const p of profiles || []) profileMap[(p as any).id] = p;
    }

    const emailMap: Record<string, any> = {};
    for (const e of (emails || []) as any[]) emailMap[e.id] = e;

    const enriched = (t || []).map((row: any) => ({
      ...row,
      user_name: profileMap[row.user_id]?.display_name,
      user_email: emailMap[row.user_id]?.email,
      user_country: profileMap[row.user_id]?.country,
      user_is_beta: profileMap[row.user_id]?.is_beta,
    }));

    setThreads(enriched);
    if (c && Array.isArray(c) && c[0]) setCounts(c[0]);
    setLoading(false);
  }

  const filtered = threads.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const hay = `${t.user_name || ""} ${t.user_email || ""} ${t.last_message_preview || ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const selected = selectedId ? threads.find((x) => x.id === selectedId) || null : null;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
        <h1 style={{ fontSize: 22 }}>💬 Chat-Inbox</h1>
        <CountBadge label="Offen"      value={counts.open_count}    color="#22c55e" />
        <CountBadge label="Wartend"    value={counts.pending_count} color="#FFB800" />
        <CountBadge label="Ungelesen"  value={counts.unread_threads} color="var(--accent)" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(260px, 380px) 1fr", gap: 14, alignItems: "start" }}>
        {/* Thread-Liste */}
        <div className="card" style={{ padding: 0, overflow: "hidden", position: "sticky", top: 84, maxHeight: "calc(100vh - 120px)", display: "flex", flexDirection: "column" }}>
          {/* Filter + Search */}
          <div style={{ padding: 10, borderBottom: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 8 }}>
            <input
              placeholder="Suche Name, Email, Text…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ padding: "8px 10px", fontSize: 12 }}
            />
            <div style={{ display: "flex", gap: 4, overflowX: "auto" }}>
              <Chip active={statusFilter === "all"} onClick={() => setStatusFilter("all")} label="Alle" color="var(--accent)" />
              {STATUS_FILTERS.map((s) => (
                <Chip key={s.id} active={statusFilter === s.id} onClick={() => setStatusFilter(s.id)} label={s.label} color={s.color} />
              ))}
            </div>
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {loading && <div style={{ padding: 20, textAlign: "center" }}><div className="spinner" style={{ margin: "0 auto" }} /></div>}
            {!loading && filtered.length === 0 && (
              <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 12 }}>
                Keine Chats
              </div>
            )}
            {filtered.map((t) => (
              <ThreadRow key={t.id} thread={t} selected={selectedId === t.id} onClick={() => setSelectedId(t.id)} />
            ))}
          </div>
        </div>

        {/* Detail */}
        {selected ? (
          <ChatDetail thread={selected} onUpdated={load} />
        ) : (
          <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>Chat auswählen</div>
            <div style={{ fontSize: 12, lineHeight: 1.5 }}>
              Wähle links eine Anfrage zum Lesen und Antworten.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ThreadRow({ thread, selected, onClick }: { thread: Thread; selected: boolean; onClick: () => void }) {
  const ago = timeAgo(thread.last_message_at);
  return (
    <button
      onClick={onClick}
      style={{
        display: "block", width: "100%", textAlign: "left", padding: "12px 14px",
        background: selected ? "var(--accent-tint)" : "transparent",
        border: "none",
        borderBottom: "1px solid var(--border)",
        cursor: "pointer", fontFamily: "inherit", color: "var(--text)",
        borderLeft: selected ? "3px solid var(--accent)" : "3px solid transparent",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: thread.admin_unread > 0 ? 900 : 700 }}>
          {thread.user_name || "(ohne Namen)"}
        </span>
        {thread.user_country && (
          <span style={{ fontSize: 9, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            {thread.user_country}
          </span>
        )}
        {thread.user_is_beta && (
          <span style={{
            fontSize: 8, fontWeight: 800, padding: "1px 4px",
            background: "rgba(255,184,0,0.2)", color: "#FFB800",
            borderRadius: 3, letterSpacing: 0.5,
          }}>BETA</span>
        )}
        <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--text-muted)" }}>{ago}</span>
      </div>
      <div style={{
        fontSize: 12, color: thread.admin_unread > 0 ? "var(--text)" : "var(--text-dim)",
        fontWeight: thread.admin_unread > 0 ? 700 : 400,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        marginBottom: 4,
      }}>
        {thread.last_message_preview || "—"}
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <StatusDot status={thread.status} />
        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{statusLabel(thread.status)}</span>
        {thread.admin_unread > 0 && (
          <span style={{
            marginLeft: "auto",
            fontSize: 10, fontWeight: 800,
            background: "var(--accent)", color: "#0a0a10",
            padding: "2px 6px", borderRadius: 10,
          }}>{thread.admin_unread} neu</span>
        )}
      </div>
    </button>
  );
}

function ChatDetail({ thread, onUpdated }: { thread: Thread; onUpdated: () => void }) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ch: any;
    const supabase = createClient();
    setLoading(true);
    (async () => {
      const { data } = await supabase.from("chat_messages")
        .select("*").eq("thread_id", thread.id).order("created_at", { ascending: true });
      setMessages((data as Msg[]) || []);
      setLoading(false);

      // Mark as read
      await supabase.rpc("mark_thread_read_admin", { p_thread_id: thread.id });
      onUpdated();

      ch = supabase.channel(`admin_chat_${thread.id}`)
        .on("postgres_changes", {
          event: "INSERT", schema: "public", table: "chat_messages",
          filter: `thread_id=eq.${thread.id}`,
        }, (payload) => {
          const m = payload.new as Msg;
          setMessages((p) => p.find((x) => x.id === m.id) ? p : [...p, m]);
        })
        .subscribe();
    })();
    return () => { if (ch) ch.unsubscribe(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread.id]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  async function send() {
    if (!input.trim() || sending) return;
    setSending(true);
    const supabase = createClient();
    const body = input.trim();
    setInput("");
    const { error } = await supabase.rpc("send_chat_message", {
      p_thread_id: thread.id, p_body: body,
    });
    setSending(false);
    if (error) { toast(error.message, { type: "error" }); return; }
    onUpdated();
  }

  async function setStatus(s: "open" | "pending" | "closed") {
    const supabase = createClient();
    const { error } = await supabase.rpc("admin_set_thread_status", {
      p_thread_id: thread.id, p_status: s,
    });
    if (error) { toast(error.message, { type: "error" }); return; }
    toast(`Status: ${statusLabel(s)}`, { type: "success" });
    onUpdated();
  }

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: "calc(100vh - 120px)" }}>
      {/* Header */}
      <div style={{
        padding: "12px 16px", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
      }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 14, fontWeight: 800 }}>{thread.user_name || "(ohne Namen)"}</div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            {thread.user_email || thread.user_id.slice(0, 8)}
            {thread.user_country && <> · {thread.user_country}</>}
            {" · Thread erstellt "}{new Date(thread.created_at).toLocaleString("de-DE")}
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {(["open", "pending", "closed"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className="btn"
              style={{
                padding: "4px 10px", fontSize: 11,
                background: thread.status === s ? "var(--accent-tint)" : "var(--bg-elevated)",
                borderColor: thread.status === s ? "var(--accent)" : "var(--border)",
                color: thread.status === s ? "var(--accent)" : "var(--text)",
              }}
            >
              {statusLabel(s)}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        style={{
          flex: 1, overflowY: "auto", padding: 14,
          display: "flex", flexDirection: "column", gap: 8,
          background: "var(--bg)",
        }}
      >
        {loading && <div style={{ margin: "auto" }}><div className="spinner" /></div>}
        {!loading && messages.length === 0 && (
          <div style={{ margin: "auto", color: "var(--text-muted)", fontSize: 12 }}>
            Noch keine Nachrichten
          </div>
        )}
        {messages.map((m) => {
          const isFromUser = m.sender_role === "user";
          const time = new Date(m.created_at).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
          return (
            <div key={m.id} style={{
              alignSelf: isFromUser ? "flex-start" : "flex-end",
              maxWidth: "78%",
            }}>
              <div style={{
                padding: "8px 12px",
                background: isFromUser
                  ? "var(--bg-elevated)"
                  : "linear-gradient(135deg, var(--accent), var(--accent-2))",
                color: isFromUser ? "var(--text)" : "#0a0a10",
                fontWeight: isFromUser ? 500 : 700,
                borderRadius: 14,
                border: isFromUser ? "1px solid var(--border)" : "none",
                fontSize: 13, lineHeight: 1.4,
                whiteSpace: "pre-wrap", wordBreak: "break-word",
              }}>
                {m.body}
              </div>
              <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 3, textAlign: isFromUser ? "left" : "right" }}>
                {m.sender_role === "admin" && "🛡️ Admin · "}
                {m.sender_role === "mod" && "🌟 Mod · "}
                {time}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div style={{ padding: 10, borderTop: "1px solid var(--border)", display: "flex", gap: 6 }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); send(); } }}
          placeholder="Antwort schreiben… (Cmd/Ctrl+Enter zum Senden)"
          className="form-textarea"
          rows={2}
          style={{ flex: 1, fontSize: 13 }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || sending}
          className="btn btn-primary"
          style={{ padding: "8px 14px", alignSelf: "flex-end" }}
        >
          {sending ? <div className="spinner" /> : "Senden ↗"}
        </button>
      </div>
    </div>
  );
}

function CountBadge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      padding: "4px 10px", borderRadius: 999,
      background: "var(--bg-elevated)", border: "1px solid var(--border)",
      fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 6,
    }}>
      <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 999, background: color }} />
      {label}: <span style={{ fontWeight: 900 }}>{value}</span>
    </div>
  );
}

function Chip({ active, onClick, label, color }: { active: boolean; onClick: () => void; label: string; color: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 10px", fontSize: 11, fontWeight: 700,
        borderRadius: 999, cursor: "pointer", whiteSpace: "nowrap",
        background: active ? "var(--accent-tint)" : "var(--bg-elevated)",
        border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
        color: active ? "var(--accent)" : "var(--text-dim)",
        fontFamily: "inherit",
      }}
    >
      {label}
    </button>
  );
}

function StatusDot({ status }: { status: string }) {
  const c = status === "open" ? "#22c55e" : status === "pending" ? "#FFB800" : "#9ca3af";
  return <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 999, background: c }} />;
}

function statusLabel(s: string) {
  return s === "open" ? "Offen" : s === "pending" ? "Wartend" : "Geschlossen";
}

function timeAgo(iso: string): string {
  const d = new Date(iso);
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60) return "jetzt";
  if (sec < 3600) return `${Math.floor(sec / 60)} min`;
  if (sec < 86400) return `${Math.floor(sec / 3600)} h`;
  return d.toLocaleDateString("de-DE");
}
