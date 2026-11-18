"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { CalendarDays, Check, ChevronLeft, ChevronRight, CircleAlert, Plus, Trash2, X } from "lucide-react";

type RecordItem = { id: string; userId: string; name: string; email: string; date: string; status: "PRESENT" | "ABSENT" };
type Holiday = { id: string; date: string; name: string };
type Staff = { id: string; name: string | null; email: string };
type Data = { month: string; today: string; role: "OWNER" | "STAFF"; holidays: Holiday[]; records: RecordItem[]; staff: Staff[]; error?: string };

async function readResponse<T extends { error?: string }>(response: Response): Promise<T> {
  const text = await response.text();
  let result: T;
  try { result = JSON.parse(text) as T; }
  catch {
    throw new Error(response.ok
      ? "The attendance service returned an invalid response. Please try again."
      : `The attendance service could not complete the request (${response.status}). Check that the latest database migration is applied.`);
  }
  if (!response.ok) throw new Error(result.error ?? `The attendance service could not complete the request (${response.status}).`);
  return result;
}

const monthLabel = (month: string) => new Date(`${month}-01T12:00:00`).toLocaleDateString("en", { month: "long" });
const prettyDate = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" });
const todayMonth = () => {
  const parts = new Intl.DateTimeFormat("en", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit" }).formatToParts(new Date());
  return `${parts.find(part => part.type === "year")?.value}-${parts.find(part => part.type === "month")?.value}`;
};
const moveMonth = (month: string, offset: number) => { const [year, number] = month.split("-").map(Number); const next = new Date(Date.UTC(year, number - 1 + offset, 1)); return `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}`; };

export default function AttendanceCalendar({ role }: { role: "OWNER" | "STAFF" }) {
  const [month, setMonth] = useState(todayMonth);
  const [data, setData] = useState<Data | null>(null);
  const [staffId, setStaffId] = useState("");
  const [holidayDate, setHolidayDate] = useState("");
  const [holidayName, setHolidayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const refresh = useCallback(async (target = month) => {
    const response = await fetch(`/api/attendance?month=${target}`, { cache: "no-store" });
    const result = await readResponse<Data>(response);
    setData(result);
  }, [month]);
  useEffect(() => {
    let current = true;
    fetch(`/api/attendance?month=${month}`, { cache: "no-store" })
      .then(readResponse<Data>)
      .then(result => { if (current) setData(result); })
      .catch(error => { if (current) setMessage(error instanceof Error ? error.message : "Could not load attendance."); });
    return () => { current = false; };
  }, [month]);
  const attendanceByDate = useMemo(() => new Map((data?.records ?? []).filter(item => role === "STAFF" || item.userId === staffId).map(item => [item.date, item])), [data, role, staffId]);
  const holidaysByDate = useMemo(() => new Map((data?.holidays ?? []).map(item => [item.date, item])), [data]);
  const [year, monthNumber] = month.split("-").map(Number);
  const firstWeekday = new Date(year, monthNumber - 1, 1).getDay();
  const daysInMonth = new Date(year, monthNumber, 0).getDate();
  const dayCells = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)];
  const selectedRecord = attendanceByDate.get(data?.today ?? "");
  const holidayToday = holidaysByDate.has(data?.today ?? "");
  const isSunday = data?.today ? new Date(`${data.today}T12:00:00`).getDay() === 0 : false;
  const isCurrentMonth = month === data?.today.slice(0, 7);
  const presentCount = (data?.records ?? []).filter(item => item.status === "PRESENT" && (role === "STAFF" || item.userId === staffId)).length;
  const absentCount = (data?.records ?? []).filter(item => item.status === "ABSENT" && (role === "STAFF" || item.userId === staffId)).length;

  async function submit(status: "PRESENT" | "ABSENT") {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/attendance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      await readResponse<{ error?: string }>(response);
      await refresh(); setMessage("Attendance submitted and locked for today.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Attendance could not be submitted."); }
    finally { setBusy(false); }
  }
  async function addHoliday(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/attendance", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date: holidayDate, name: holidayName }) });
      await readResponse<{ error?: string }>(response);
      setHolidayDate(""); setHolidayName(""); await refresh(); setMessage("Company holiday added.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Holiday could not be added."); }
    finally { setBusy(false); }
  }
  async function removeHoliday(id: string) {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/attendance", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      await readResponse<{ error?: string }>(response);
      await refresh(); setMessage("Company holiday removed.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Holiday could not be removed."); }
    finally { setBusy(false); }
  }

  return <section className="attendance-panel" aria-label={role === "STAFF" ? "My attendance" : "Staff attendance"}>
    <div className="attendance-heading"><div><div className="page-kicker">{role === "STAFF" ? "MY ATTENDANCE" : "TEAM RECORDS"}</div><h2>{role === "STAFF" ? "Attendance calendar" : "Staff attendance"}</h2><p>{role === "STAFF" ? "Mark today once. Submitted attendance can’t be changed." : "Review staff records and set company holidays."}</p></div><div className="attendance-counts"><span className="attendance-count present-count"><strong>{presentCount}</strong> Present</span><span className="attendance-count absent-count"><strong>{absentCount}</strong> Absent</span></div></div>

    {role === "OWNER" && <div className="attendance-admin-tools"><label>Staff member<select value={staffId} onChange={event => setStaffId(event.target.value)}><option value="">All staff</option>{(data?.staff ?? []).map(person => <option key={person.id} value={person.id}>{person.name ?? person.email}</option>)}</select></label><form className="attendance-holiday-form" onSubmit={addHoliday}><label>Holiday date<input type="date" required value={holidayDate} onChange={event => setHolidayDate(event.target.value)}/></label><label>Holiday name<input maxLength={80} value={holidayName} onChange={event => setHolidayName(event.target.value)} placeholder="Optional"/></label><button type="submit" disabled={busy}><Plus size={15}/> Add holiday</button></form></div>}

    <div className="attendance-calendar-card"><div className="attendance-calendar-top"><div><span>{year}</span><strong>{monthLabel(month)}</strong></div><div className="attendance-month-nav"><button type="button" aria-label="Previous month" onClick={() => setMonth(value => moveMonth(value, -1))}><ChevronLeft size={17}/></button><button type="button" aria-label="Next month" onClick={() => setMonth(value => moveMonth(value, 1))}><ChevronRight size={17}/></button></div></div>
      <div className="attendance-grid" role="grid" aria-label={`${monthLabel(month)} ${year}`}><div className="attendance-weekdays">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => <span key={day} className={day === "Sun" ? "is-holiday" : "is-working"}>{day}</span>)}</div><div className="attendance-days">{dayCells.map((day, index) => {
        if (!day) return <span className="attendance-day blank" key={`blank-${index}`}/>;
        const date = `${month}-${String(day).padStart(2, "0")}`;
        const sunday = new Date(`${date}T12:00:00`).getDay() === 0;
        const holiday = holidaysByDate.get(date);
        const record = attendanceByDate.get(date);
        const statusClass = record ? record.status === "PRESENT" ? "marked-present" : "marked-absent" : "";
        const holidayClass = sunday || holiday ? "day-holiday" : "day-working";
        return <span key={date} className={`attendance-day ${holidayClass} ${statusClass} ${date === data?.today ? "is-today" : ""}`} title={record ? `${record.status === "PRESENT" ? "Present" : "Absent"}${role === "OWNER" ? ` · ${record.name}` : ""}` : holiday ? holiday.name : sunday ? "Sunday · holiday" : "Working day"}><strong>{day}</strong>{record && <i aria-label={record.status === "PRESENT" ? "Present" : "Absent"}/>}</span>;
      })}</div></div>
      <div className="attendance-legend"><span><i className="legend-working"/>Working day</span><span><i className="legend-holiday"/>Holiday</span><span><i className="legend-present"/>Present</span><span><i className="legend-absent"/>Absent</span></div>
      {role === "STAFF" && <div className="attendance-mark-box"><div><strong>{isSunday || holidayToday ? "Today is a holiday" : selectedRecord ? "Attendance recorded" : "Mark today’s attendance"}</strong><span>{data?.today ? prettyDate(data.today) : "Loading date…"}{selectedRecord ? ` · ${selectedRecord.status === "PRESENT" ? "Present" : "Absent"}` : isSunday ? " · Sunday" : holidayToday ? ` · ${holidaysByDate.get(data?.today ?? "")?.name}` : ""}</span></div><div className="attendance-mark-actions"><button type="button" className="mark-present-button" disabled={busy || Boolean(selectedRecord) || holidayToday || isSunday || !isCurrentMonth} onClick={() => void submit("PRESENT")}><Check size={16}/> Present</button><button type="button" className="mark-absent-button" disabled={busy || Boolean(selectedRecord) || holidayToday || isSunday || !isCurrentMonth} onClick={() => void submit("ABSENT")}><X size={16}/> Absent</button></div></div>}
    </div>

    {role === "OWNER" && <div className="attendance-records"><div className="attendance-records-title"><CalendarDays size={16}/><strong>{staffId ? "Selected staff records" : "All attendance records"}</strong><span>{data?.records.filter(item => !staffId || item.userId === staffId).length ?? 0}</span></div>{(data?.records.filter(item => !staffId || item.userId === staffId) ?? []).length ? <div className="attendance-record-list">{data?.records.filter(item => !staffId || item.userId === staffId).map(item => <div key={item.id}><span className={`attendance-record-status ${item.status.toLowerCase()}`}>{item.status === "PRESENT" ? <Check size={14}/> : <X size={14}/>}</span><strong>{item.name}</strong><span>{prettyDate(item.date)}</span><b>{item.status === "PRESENT" ? "Present" : "Absent"}</b></div>)}</div> : <p className="attendance-empty">No attendance has been recorded for this month.</p>}</div>}

    {role === "OWNER" && <div className="attendance-holidays-list"><strong>Company holidays this month</strong>{data?.holidays.length ? data.holidays.map(item => <div key={item.id}><span><b>{prettyDate(item.date)}</b><small>{item.name}</small></span><button type="button" title={`Remove ${item.name}`} disabled={busy} onClick={() => void removeHoliday(item.id)}><Trash2 size={15}/></button></div>) : <p>No company holidays set for this month. Sundays are automatic holidays.</p>}</div>}
    {message && <div className="attendance-message" role="status"><CircleAlert size={15}/>{message}</div>}
  </section>;
}
