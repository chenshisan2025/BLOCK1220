import { NextResponse } from "next/server";
import { z } from "zod";
import { eventConfigRepoPg } from "../../../../../src/server/repo/eventConfigRepo";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const repo = eventConfigRepoPg();
    const row = await repo.getById(params.id);
    if (!row) return NextResponse.json({ code: "NOT_FOUND", message: "not found" }, { status: 404 });
    return NextResponse.json({ event: row });
  } catch (e: any) {
    return NextResponse.json({ code: "SERVER_ERROR", message: e?.message || "error" }, { status: 500 });
  }
}

const statusSchema = z.object({ status: z.enum(["active", "inactive"]) });

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const parsed = statusSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ code: "BAD_REQUEST", message: "invalid status" }, { status: 400 });
    const repo = eventConfigRepoPg();
    await repo.setStatus(params.id, parsed.data.status);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ code: "SERVER_ERROR", message: e?.message || "error" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const repo = eventConfigRepoPg();
    await repo.remove(params.id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ code: "SERVER_ERROR", message: e?.message || "error" }, { status: 500 });
  }
}
