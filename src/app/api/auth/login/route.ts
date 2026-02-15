import { NextResponse } from "next/server";
import { verifyAdmin, createAdminSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    if (!password) {
      return NextResponse.json(
        { error: "رمز عبور الزامی است" },
        { status: 400 }
      );
    }

    const isValid = await verifyAdmin(password);
    if (!isValid) {
      return NextResponse.json(
        { error: "رمز عبور نادرست است" },
        { status: 401 }
      );
    }

    await createAdminSession();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "خطا در ورود" },
      { status: 500 }
    );
  }
}
