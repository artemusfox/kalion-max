import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

// Generiert einen iCalendar-Feed mit allen offenen Items des Users die ein due_date haben.
// User kann's importieren in Apple Calendar, Google Calendar, Outlook etc.
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { data: items } = await supabase
    .from("todo_items")
    .select("id, title, description, due_date, priority, list_id, completed_at")
    .not("due_date", "is", null);

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Kalion Max//Todos//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Kalion Max — Todos",
  ];

  const now = new Date();
  const stamp = formatICalDate(now, true);

  for (const it of (items || []) as any[]) {
    if (!it.due_date) continue;
    const due = new Date(it.due_date);
    const dtStart = formatICalDate(due, false);
    const status = it.completed_at ? "COMPLETED" : "NEEDS-ACTION";
    const prio = ["", "9", "5", "1"][it.priority] || "0";

    lines.push("BEGIN:VTODO");
    lines.push(`UID:${it.id}@kalion-max.app`);
    lines.push(`DTSTAMP:${stamp}`);
    lines.push(`DUE;VALUE=DATE:${dtStart}`);
    lines.push(`SUMMARY:${escapeIcs(it.title || "Task")}`);
    if (it.description) lines.push(`DESCRIPTION:${escapeIcs(it.description)}`);
    lines.push(`STATUS:${status}`);
    if (prio) lines.push(`PRIORITY:${prio}`);
    if (it.completed_at) lines.push(`COMPLETED:${formatICalDate(new Date(it.completed_at), true)}`);
    lines.push("END:VTODO");
  }

  lines.push("END:VCALENDAR");

  const filename = `kalion-max-todos-${now.toISOString().slice(0, 10)}.ics`;
  return new NextResponse(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

function pad(n: number): string { return String(n).padStart(2, "0"); }
function formatICalDate(d: Date, withTime: boolean): string {
  const date = `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
  if (!withTime) return date;
  return `${date}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

function escapeIcs(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "");
}
