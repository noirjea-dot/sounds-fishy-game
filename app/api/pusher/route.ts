import { NextResponse } from "next/server";
import Pusher from "pusher";

// สร้าง Instance ของ Pusher สำหรับฝั่ง Server
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(req: Request) {
  try {
    // รับข้อมูลจากหน้าเว็บ (Frontend)
    const { event, roomCode, data } = await req.json();

    // ส่งข้อมูลต่อเข้าไปใน Channel ของห้องนั้นๆ
    // ชื่อ Channel จะเป็น 'room-XXXXXX'
    await pusher.trigger(`room-${roomCode}`, event, data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Pusher Error:", error);
    return NextResponse.json({ success: false, error: "ส่งข้อมูลไม่สำเร็จ" }, { status: 500 });
  }
}