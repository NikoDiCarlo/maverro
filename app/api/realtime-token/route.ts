import OpenAI from "openai";
import { rateLimit, sameOrigin } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 15;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }

  const limit = rateLimit(request, "voice", 12, 10 * 60 * 1000);

  if (!limit.ok) {
    return Response.json(
      { error: "Voice limit reached. Try again shortly." },
      {
        status: 429,
        headers: {
          "Retry-After": String(limit.retryAfter)
        }
      }
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      { error: "OpenAI is not configured." },
      { status: 500 }
    );
  }

  try {
    const session =
      await openai.beta.realtime.transcriptionSessions.create({
        input_audio_format: "pcm16",
        input_audio_noise_reduction: {
          type: "near_field"
        },
        input_audio_transcription: {
          model: "gpt-live-transcribe",
          language: "en",
          prompt:
            "Financial markets, equities, hedge funds, SEC filings, quantitative finance, Python, C++, tickers, company names and investment terminology."
        },
        turn_detection: {
          type: "server_vad",
          threshold: 0.45,
          prefix_padding_ms: 250,
          silence_duration_ms: 500
        }
      } as any);

    return Response.json(
      {
        value: session.client_secret.value,
        expiresAt: session.client_secret.expires_at
      },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (error) {
    console.error("Realtime token error:", error);

    return Response.json(
      { error: "Voice transcription is temporarily unavailable." },
      { status: 502 }
    );
  }
}
