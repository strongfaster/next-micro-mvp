import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses?: { email_address: string }[];
    first_name?: string;
    last_name?: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const payload: ClerkWebhookEvent = await req.json();

    switch (payload.type) {
      case "user.created": {
        const { id, email_addresses, first_name, last_name } = payload.data;
        const email = email_addresses?.[0]?.email_address;

        if (!email) break;

        await prisma.user.upsert({
          where: { clerkId: id },
          create: {
            clerkId: id,
            email,
            name: `${first_name || ""} ${last_name || ""}`.trim() || null,
          },
          update: {
            email,
            name: `${first_name || ""} ${last_name || ""}`.trim() || null,
          },
        });
        break;
      }

      case "user.updated": {
        const { id, email_addresses, first_name, last_name } = payload.data;
        const email = email_addresses?.[0]?.email_address;

        await prisma.user.updateMany({
          where: { clerkId: id },
          data: {
            ...(email && { email }),
            name: `${first_name || ""} ${last_name || ""}`.trim() || null,
          },
        });
        break;
      }

      case "user.deleted": {
        const { id } = payload.data;
        await prisma.user.deleteMany({
          where: { clerkId: id },
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Clerk webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
