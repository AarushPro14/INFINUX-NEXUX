import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      status: string;
      companyId: string | null;
    } & DefaultSession["user"];
  }
}

import type { DefaultSession } from "next-auth";

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    status?: string;
    companyId?: string | null;
  }
}
