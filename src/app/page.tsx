"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Mic, Zap, Shield, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VoiceRecorder } from "@/components/voice-recorder";

const FREE_RECORD_KEY = "voicescribe_free_used";

export default function HomePage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [transcription, setTranscription] = useState<string | null>(null);
  const [freeUsed, setFreeUsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(FREE_RECORD_KEY) === "true";
    }
    return false;
  });

  const handleTranscription = useCallback(
    (text: string) => {
      setTranscription(text);
      if (!freeUsed) {
        localStorage.setItem(FREE_RECORD_KEY, "true");
        setFreeUsed(true);
      }
    },
    [freeUsed]
  );

  const shouldShowRecorder = !freeUsed && !isSignedIn;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Mic className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">VoiceScribe</span>
          </div>
          <div className="flex items-center gap-3">
            {isSignedIn ? (
              <Button onClick={() => router.push("/dashboard")}>
                Dashboard
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => router.push("/sign-in")}>
                  Sign In
                </Button>
                <Button onClick={() => router.push("/sign-up")}>
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 text-center">
          <Badge variant="secondary" className="mb-4">
            Powered by OpenAI Whisper & GPT
          </Badge>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            Voice to Text with{" "}
            <span className="text-primary">AI Intelligence</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Record your voice and get instant, accurate transcriptions powered by
            OpenAI Whisper. Get AI-powered insights and chat about your recordings.
          </p>

          {/* Voice Recorder / CTA */}
          <div className="mx-auto mt-12 max-w-md">
            {shouldShowRecorder ? (
              <Card>
                <CardContent className="p-8">
                  <Badge variant="outline" className="mb-4">
                    1 Free Recording
                  </Badge>
                  <VoiceRecorder onTranscription={handleTranscription} />
                  {transcription && (
                    <div className="mt-6 rounded-lg bg-muted p-4 text-left">
                      <p className="mb-1 text-xs font-medium text-muted-foreground">
                        Transcription
                      </p>
                      <p className="text-sm">{transcription}</p>
                      <div className="mt-4 border-t pt-4">
                        <p className="text-sm text-muted-foreground">
                          Want unlimited recordings with AI chat?
                        </p>
                        <Button
                          className="mt-2 w-full"
                          onClick={() => router.push("/sign-up")}
                        >
                          Sign up for full access
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : freeUsed && !isSignedIn ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="mb-4 text-muted-foreground">
                    You&apos;ve used your free recording. Sign up to continue!
                  </p>
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={() => router.push("/sign-up")}
                  >
                    Sign Up for Unlimited Access
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Button
                size="lg"
                className="w-full"
                onClick={() => router.push("/dashboard")}
              >
                Go to Dashboard
              </Button>
            )}
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-muted/30 py-20">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold">
              How It Works
            </h2>
            <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
              <FeatureCard
                icon={<Mic className="h-6 w-6" />}
                title="Record"
                description="Click the mic button and speak. We'll capture your audio in high quality."
              />
              <FeatureCard
                icon={<Zap className="h-6 w-6" />}
                title="Transcribe"
                description="OpenAI Whisper converts your speech to text with incredible accuracy."
              />
              <FeatureCard
                icon={<MessageSquare className="h-6 w-6" />}
                title="Chat & Analyze"
                description="Get AI-powered insights about your recordings in a ChatGPT-like interface."
              />
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-4 text-3xl font-bold">Simple Pricing</h2>
            <p className="mb-12 text-muted-foreground">
              Start free, upgrade when you need more
            </p>
            <div className="mx-auto grid max-w-3xl gap-8 md:grid-cols-2">
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold">Free</h3>
                  <p className="mt-2 text-3xl font-bold">$0</p>
                  <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                    <li>1 voice recording</li>
                    <li>Basic transcription</li>
                    <li>No account needed</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-primary">
                <CardContent className="p-8">
                  <Badge className="mb-2">Pro</Badge>
                  <h3 className="text-xl font-bold">Pro</h3>
                  <p className="mt-2 text-3xl font-bold">
                    $9<span className="text-sm font-normal">/mo</span>
                  </p>
                  <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                    <li>Unlimited recordings</li>
                    <li>AI-powered transcription</li>
                    <li>ChatGPT analysis</li>
                    <li>Recording history</li>
                  </ul>
                  <Button
                    className="mt-6 w-full"
                    onClick={() => router.push("/sign-up")}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-1">
            <Shield className="h-4 w-4" />
            <span>Built with Next.js, OpenAI, Clerk & Stripe</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
