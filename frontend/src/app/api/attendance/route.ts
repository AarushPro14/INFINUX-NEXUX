import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceUser } from "@/lib/server-session";

const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });
function monthRange(value: string | null) {
  const month = value && /^\d{4}-\d{2}$/.test(value) ? value : currentDate().slice(0, 7);
  const [year, number] = month.split("-").map(Number);
  if (number < 1 || number > 12) return null;
  return { month, start: new Date(Date.UTC(year, number - 1, 1)), end: new Date(Date.UTC(year, number, 1)) };
}
function currentDate() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const get = (type: string) => parts.find(part => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}
function dayDate(value: string) { return new Date(`${value}T00:00:00.000Z`); }

async function activeUser() {
  const session = await requireWorkspaceUser();
  return prisma.user.findUnique({ where: { id: session.id }, select: { id: true, name: true, email: true, role: true, status: true, companyId: true } });
}

export async function GET(request: Request) {
  const user = await activeUser();
  if (!user || user.status !== "ACTIVE" || !user.companyId || !["OWNER", "STAFF"].includes(user.role)) return fail("Active workspace access required.", 403);
  const range = monthRange(new URL(request.url).searchParams.get("month"));
  if (!range) return fail("Choose a valid month.");
  try {
    const [holidays, records, staff] = await Promise.all([
      prisma.attendanceHoliday.findMany({ where: { companyId: user.companyId, date: { gte: range.start, lt: range.end } }, orderBy: { date: "asc" } }),
      prisma.attendanceRecord.findMany({ where: { companyId: user.companyId, date: { gte: range.start, lt: range.end }, ...(user.role === "STAFF" ? { userId: user.id } : {}) }, include: { user: { select: { id: true, name: true, email: true } } }, orderBy: [{ date: "asc" }, { user: { name: "asc" } }] }),
      user.role === "OWNER" ? prisma.user.findMany({ where: { companyId: user.companyId, role: "STAFF", status: "ACTIVE" }, select: { id: true, name: true, email: true }, orderBy: { name: "asc" } }) : Promise.resolve([]),
    ]);
    return NextResponse.json({ month: range.month, today: currentDate(), role: user.role, holidays: holidays.map(item => ({ id: item.id, date: item.date.toISOString().slice(0, 10), name: item.name })), records: records.map(item => ({ id: item.id, userId: item.userId, name: item.user.name ?? item.user.email, email: item.user.email, date: item.date.toISOString().slice(0, 10), status: item.status })), staff });
  } catch {
    return fail("Attendance storage is unavailable. Apply the latest database migration and try again.", 503);
  }
}

export async function POST(request: Request) {
  const user = await activeUser();
  if (!user || user.status !== "ACTIVE" || user.role !== "STAFF" || !user.companyId) return fail("Only active staff can submit attendance.", 403);
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return fail("Invalid request."); }
  if (body.status !== "PRESENT" && body.status !== "ABSENT") return fail("Choose Present or Absent.");
  const date = currentDate();
  const dateValue = dayDate(date);
  if (dateValue.getUTCDay() === 0) return fail("Sunday is a holiday. Attendance is unavailable.");
  const holiday = await prisma.attendanceHoliday.findUnique({ where: { companyId_date: { companyId: user.companyId, date: dateValue } }, select: { id: true } });
  if (holiday) return fail("Today is a company holiday. Attendance is unavailable.");
  try {
    const record = await prisma.attendanceRecord.create({ data: { companyId: user.companyId, userId: user.id, date: dateValue, status: body.status } });
    return NextResponse.json({ record: { id: record.id, date, status: record.status } }, { status: 201 });
  } catch (error) {
    if ((error as { code?: string })?.code === "P2002") return fail("Attendance has already been submitted for today and cannot be changed.", 409);
    return fail("Attendance storage is unavailable. Apply the latest database migration and try again.", 503);
  }
}

export async function PUT(request: Request) {
  const user = await activeUser();
  if (!user || user.status !== "ACTIVE" || user.role !== "OWNER" || !user.companyId) return fail("Only the Boss can manage holidays.", 403);
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return fail("Invalid request."); }
  const date = typeof body.date === "string" ? body.date : "";
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 80) : "Company holiday";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(dayDate(date).getTime()) || dayDate(date).toISOString().slice(0, 10) !== date) return fail("Choose a valid holiday date.");
  if (dayDate(date).getUTCDay() === 0) return fail("Sundays are already holidays.");
  try {
    const holiday = await prisma.attendanceHoliday.create({ data: { companyId: user.companyId, date: dayDate(date), name: name || "Company holiday" } });
    return NextResponse.json({ holiday: { id: holiday.id, date, name: holiday.name } }, { status: 201 });
  } catch (error) {
    if ((error as { code?: string })?.code === "P2002") return fail("A holiday is already set for that date.", 409);
    return fail("Attendance storage is unavailable. Apply the latest database migration and try again.", 503);
  }
}

export async function DELETE(request: Request) {
  const user = await activeUser();
  if (!user || user.status !== "ACTIVE" || user.role !== "OWNER" || !user.companyId) return fail("Only the Boss can manage holidays.", 403);
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return fail("Invalid request."); }
  const result = await prisma.attendanceHoliday.deleteMany({ where: { id: typeof body.id === "string" ? body.id : "", companyId: user.companyId } });
  if (!result.count) return fail("Holiday not found.", 404);
  return NextResponse.json({ ok: true });
}
