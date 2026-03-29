import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json({ hasSubscription: false });
    }

    const hasSubscription =
      user.subscription?.status === "active" &&
      user.subscription?.stripeCurrentPeriodEnd &&
      new Date(user.subscription.stripeCurrentPeriodEnd) > new Date();

    return NextResponse.json({ hasSubscription });
  } catch (error) {
    console.error("Subscription check error:", error);
    return NextResponse.json(
      { error: "Failed to check subscription" },
      { status: 500 }
    );
  }
}
