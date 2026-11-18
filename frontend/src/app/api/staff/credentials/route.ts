import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { hasEntryAccess } from "@/lib/gate";
import { decryptCredential } from "@/lib/credential-vault";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (!(await hasEntryAccess())) return NextResponse.json({ error: "Workspace access required." }, { status: 403 });
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in to view your staff credentials." }, { status: 401 });
  const credential = await prisma.staffCredential.findUnique({ where: { claimedByUserId: session.user.id } });
  if (!credential || !credential.active || !credential.passwordCiphertext || !credential.privateCodeCiphertext) {
    return NextResponse.json({ error: "No active Boss-assigned staff credentials are available for this account." }, { status: 404 });
  }
  return NextResponse.json({ credentials: { infxName: credential.infxName, staffId: credential.staffId, password: decryptCredential(credential.passwordCiphertext), privateCode: decryptCredential(credential.privateCodeCiphertext) } });
}
