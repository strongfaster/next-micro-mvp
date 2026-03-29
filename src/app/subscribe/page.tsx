"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Check, Loader2, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SubscribePage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [loading, setLoading] = useState(false);

  if (!isSignedIn) {
    router.push("/sign-up");
    return null;
  }

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
      });
      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="mb-8 flex items-center gap-2">
        <Mic className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold">VoiceScribe</span>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Badge className="mx-auto mb-2 w-fit">Pro Plan</Badge>
          <CardTitle className="text-2xl">Unlock Full Access</CardTitle>
          <p className="text-muted-foreground">
            Get unlimited voice recordings with AI-powered transcription and chat
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <span className="text-4xl font-bold">$9</span>
            <span className="text-muted-foreground">/month</span>
          </div>

          <ul className="space-y-3">
            {[
              "Unlimited voice recordings",
              "AI-powered transcription (OpenAI Whisper)",
              "ChatGPT analysis & insights",
              "Full recording history",
              "Priority support",
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                {feature}
              </li>
            ))}
          </ul>

          <Button
            className="w-full"
            size="lg"
            onClick={handleSubscribe}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecting to checkout...
              </>
            ) : (
              "Subscribe Now"
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Secure payment powered by Stripe. Cancel anytime.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
