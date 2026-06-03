"use client";

// Floating Support-Chat-Bubble unten rechts im Dashboard.
// User schreibt eine Anfrage, Admin/Mod sieht das in der Admin-Inbox.

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { useLanguage } from "@/components/LanguageProvider";
import { useToast } from "@/components/Toast";

type Msg = {
  id: string;
  thread_id: string;
  sender_id: string;
  sender_role: "user" | "admin" | "mod" | "system";
  body: string;
  created_at: string;
};

export default function LiveChat() {
  const { lang } = useLanguage();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Thread laden + Realtime subscribe
  useEffect(() => {
    let channel: any;
    const supabase = createClient();
    (async () => {
      // get or create
      const { data: tid, error } = await supabase.rpc("get_or_create_my_thread");
      if (error || !tid) return;
      setThreadId(tid as string);

      // initial messages
      const { data: msgs } = await supabase.from("chat_messages")
        .select("*").eq("thread_id", tid).order("created_at", { ascending: true });
      setMessages((msgs as Msg[]) || []);

      // unread counter
      const { data: thread } = await supabase.from("chat_threads")
        .select("user_unread").eq("id", tid).maybeSingle();
      setUnread(thread?.user_unread || 0);

      // realtime
      channel = supabase.channel(`chat_user_${tid}`)
        .on("postgres_changes", {
          event: "INSERT", schema: "public", table: "chat_messages",
          filter: `thread_id=eq.${tid}`,
        }, (payload) => {
          const m = payload.new as Msg;
          setMessages((prev) => prev.find((x) => x.id === m.id) ? prev : [...prev, m]);
          if (!open && m.sender_role !== "user") {
            setUnread((u) => u + 1);
          }
        })
        .subscribe();
    })();
    return () => { if (channel) channel.unsubscribe(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-Scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  // Mark als gelesen wenn Chat geöffnet
  useEffect(() => {
    if (open && unread > 0) {
      const supabase = createClient();
      supabase.rpc("mark_my_thread_read").then(() => setUnread(0));
    }
  }, [open, unread]);

  async function send() {
    if (!threadId || !input.trim() || sending) return;
    setSending(true);
    const supabase = createClient();
    const body = input.trim();
    setInput("");

    // Optimistic
    const optimistic: Msg = {
      id: `tmp-${Date.now()}`,
      thread_id: threadId,
      sender_id: "me",
      sender_role: "user",
      body,
      created_at: new Date().toISOString(),
    };
    setMessages((p) => [...p, optimistic]);

    const { error } = await supabase.rpc("send_chat_message", {
      p_thread_id: threadId, p_body: body,
    });
    setSending(false);
    if (error) {
      toast(error.message, { type: "error" });
      setMessages((p) => p.filter((m) => m.id !== optimistic.id));
    }
  }

  return (
    <>
      {/* Floating Bubble */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Support Chat"
        style={{
          position: "fixed", bottom: 22, right: 22, zIndex: 9000,
          width: 56, height: 56, borderRadius: "50%",
          background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
          color: "#0a0a10", border: "none", cursor: "pointer",
          boxShadow: "0 8px 28px var(--accent-glow), 0 0 0 1px rgba(255,255,255,0.1) inset",
          fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 800,
          transition: "transform 0.15s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.08)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      >
        {open ? "✕" : "💬"}
        {unread > 0 && !open && (
          <span style={{
            position: "absolute", top: -2, right: -2,
            background: "var(--red)", color: "#fff",
            borderRadius: 999, fontSize: 11, fontWeight: 900,
            minWidth: 22, height: 22, padding: "0 6px",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "2px solid var(--bg)",
          }}>{unread > 9 ? "9+" : unread}</span>
        )}
      </button>

      {/* Chat-Panel */}
      {open && (
        <div
          className="kalion-glass"
          style={{
            position: "fixed", bottom: 92, right: 22, zIndex: 8999,
            width: 360, maxWidth: "calc(100vw - 44px)",
            height: 480, maxHeight: "calc(100vh - 130px)",
            display: "flex", flexDirection: "column",
            padding: 0, overflow: "hidden",
            animation: "kalion-fadeup 200ms cubic-bezier(.34,1.56,.64,1)",
          }}
        >
          <style>{`
            @keyframes kalion-fadeup {
              from { opacity: 0; transform: translateY(8px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {/* Header */}
          <div style={{
            padding: "12px 16px", borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{ fontSize: 22 }}>💬</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 800 }}>
                {lang === "en" ? "Kalion Support" : "Kalion Support"}
              </div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: 0.5 }}>
                <span style={{ color: "#22c55e" }}>●</span>{" "}
                {lang === "en" ? "Usually replies within a few hours" : "Antwort meist innerhalb weniger Stunden"}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            style={{
              flex: 1, overflowY: "auto", padding: 14,
              display: "flex", flexDirection: "column", gap: 8,
            }}
          >
            {messages.length === 0 && (
              <div style={{
                margin: "auto", textAlign: "center", color: "var(--text-muted)",
                fontSize: 12, padding: 20, lineHeight: 1.6,
              }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>👋</div>
                {lang === "en"
                  ? "Hi! Got a question or feedback? Just write here, we'll get back to you."
                  : "Hi! Eine Frage oder Feedback? Schreib einfach hier — wir melden uns."}
              </div>
            )}
            {messages.map((m) => (
              <Bubble key={m.id} message={m} />
            ))}
          </div>

          {/* Input */}
          <div style={{
            padding: 10, borderTop: "1px solid var(--border)",
            display: "flex", gap: 6,
          }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={lang === "en" ? "Type a message…" : "Nachricht schreiben…"}
              className="form-input"
              style={{ flex: 1, padding: "10px 12px", fontSize: 13 }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || sending}
              className="btn btn-primary"
              style={{ padding: "8px 14px", fontSize: 14 }}
              aria-label="Send"
            >
              {sending ? <div className="spinner" /> : "↗"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function Bubble({ message: m }: { message: Msg }) {
  const isUser = m.sender_role === "user";
  const isSystem = m.sender_role === "system";
  const time = new Date(m.created_at).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });

  if (isSystem) {
    return (
      <div style={{ alignSelf: "center", fontSize: 10, color: "var(--text-muted)", padding: "4px 10px" }}>
        {m.body}
      </div>
    );
  }

  return (
    <div style={{
      alignSelf: isUser ? "flex-end" : "flex-start",
      maxWidth: "82%",
      display: "flex", flexDirection: "column",
      alignItems: isUser ? "flex-end" : "flex-start",
      gap: 2,
    }}>
      <div style={{
        padding: "8px 12px",
        background: isUser
          ? "linear-gradient(135deg, var(--accent), var(--accent-2))"
          : "var(--bg-elevated)",
        color: isUser ? "#0a0a10" : "var(--text)",
        borderRadius: 14,
        borderBottomRightRadius: isUser ? 4 : 14,
        borderBottomLeftRadius: isUser ? 14 : 4,
        fontSize: 13, lineHeight: 1.4,
        fontWeight: isUser ? 700 : 500,
        whiteSpace: "pre-wrap", wordBreak: "break-word",
        border: isUser ? "none" : "1px solid var(--border)",
      }}>
        {m.body}
      </div>
      <div style={{ fontSize: 9, color: "var(--text-muted)", padding: "0 4px" }}>
        {m.sender_role === "admin" && "🛡️ Admin · "}
        {m.sender_role === "mod" && "🌟 Mod · "}
        {time}
      </div>
    </div>
  );
}
