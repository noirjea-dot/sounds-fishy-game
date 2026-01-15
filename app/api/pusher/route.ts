// ไฟล์: app/api/pusher/route.ts
import { NextResponse } from "next/server";
import Pusher from "pusher";

export async function POST(req: Request) {
  try {
    const { event, roomCode, data } = await req.json();

    // ใส่ค่าจาก Pusher ลงไปตรงๆ เพื่อทดสอบ
    const pusher = new Pusher({
      appId: "2102462",
      key: "c8dd0c376bfaa5d569b0",
      secret: "1155b175097110b57a99",
      cluster: "ap1",
      useTLS: true,
    });

    await pusher.trigger(`room-${roomCode}`, event, data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Pusher Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}