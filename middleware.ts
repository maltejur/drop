export const config = {
  matcher: ["/api/drop/:function*", "/api/upload/:function*", "/api/auth"],
};

import { isValidPass } from "lib/auth";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  if (!isValidPass(req.cookies.get("pass")?.value)) {
    return new Response("Unauthorized", { status: 401 });
  }
}
