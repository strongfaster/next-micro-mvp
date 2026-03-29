import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { openai } from "@/lib/openai";
import { prisma } from "@/lib/prisma";
import { toFile } from "openai";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as Blob;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    // Convert Blob to uploadable file for OpenAI API
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const file = await toFile(buffer, "recording.webm", {
      type: audioFile.type || "audio/webm",
    });

    // Transcribe with Whisper
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
    });

    const text = transcription.text;

    // Check if user is authenticated
    const { userId: clerkId } = await auth();

    if (clerkId) {
      // Get user from DB
      const user = await prisma.user.findUnique({
        where: { clerkId },
      });

      if (user) {
        // Generate ChatGPT response
        const chatCompletion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant that analyzes voice transcriptions. Provide a brief, insightful response about the transcribed text. If it's a question, answer it. If it's a note, summarize or provide relevant insights. Keep responses concise.",
            },
            {
              role: "user",
              content: `Here is a voice transcription:\n\n"${text}"\n\nPlease provide a helpful response.`,
            },
          ],
        });

        const chatResponse = chatCompletion.choices[0]?.message?.content || "";

        // Save to DB
        await prisma.record.create({
          data: {
            userId: user.id,
            transcription: text,
            chatResponse,
          },
        });

        return NextResponse.json({ transcription: text, chatResponse });
      }
    }

    // Anonymous user - just return transcription
    return NextResponse.json({ transcription: text });
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: "Failed to transcribe audio" },
      { status: 500 }
    );
  }
}
