import {
  rateLimit,
  sameOrigin
} from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 15;

export async function POST(
  request: Request
) {
  if (!sameOrigin(request)) {
    return Response.json(
      {
        error: "Forbidden."
      },
      {
        status: 403
      }
    );
  }

  const limit = rateLimit(
    request,
    "voice",
    12,
    10 * 60 * 1000
  );

  if (!limit.ok) {
    return Response.json(
      {
        error:
          "Voice limit reached. Try again shortly."
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            limit.retryAfter
          )
        }
      }
    );
  }

  const apiKey =
    process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return Response.json(
      {
        error: "OpenAI is not configured."
      },
      {
        status: 500
      }
    );
  }

  try {
    /*
     * Current Realtime API architecture:
     *
     * Permanent OpenAI key stays here on Vercel.
     * This route creates a short-lived client secret.
     * The browser receives only that temporary credential.
     *
     * Maverro uses a transcription-only session:
     * voice in -> text out.
     */
    const response = await fetch(
      "https://api.openai.com/v1/realtime/client_secrets",
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${apiKey}`,
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({
          session: {
            type: "transcription",

            audio: {
              input: {
                /*
                 * Realtime transcription uses 24 kHz PCM.
                 */
                format: {
                  type: "audio/pcm",
                  rate: 24000
                },

                /*
                 * Laptop microphones are a far-field
                 * use case.
                 */
                noise_reduction: {
                  type: "far_field"
                },

                transcription: {
                  model:
                    "gpt-live-transcribe",

                  language: "en",

                  /*
                   * Domain hints improve recognition of
                   * financial and programming terminology.
                   */
                  keywords: [
                    "Maverro",
                    "SEC",
                    "EDGAR",
                    "10-K",
                    "10-Q",
                    "8-K",
                    "EBITDA",
                    "cRPO",
                    "RPO",
                    "free cash flow",
                    "earnings",
                    "guidance",
                    "basis points",
                    "Treasury",
                    "Federal Reserve",
                    "S&P 500",
                    "Nasdaq",
                    "Salesforce",
                    "NVIDIA",
                    "Python",
                    "C++",
                    "backtest",
                    "quantitative"
                  ]
                },

                /*
                 * Maverro is push-to-talk / click-to-talk.
                 *
                 * The browser explicitly commits the turn
                 * when the user stops the microphone.
                 * This avoids double commits from VAD.
                 */
                turn_detection: null
              }
            }
          }
        }),

        cache: "no-store"
      }
    );

    const raw = await response.text();

    if (!response.ok) {
      console.error(
        "OpenAI realtime client-secret error:",
        response.status,
        raw
      );

      return Response.json(
        {
          error:
            "Voice transcription is temporarily unavailable."
        },
        {
          status: 502
        }
      );
    }

    let data: any;

    try {
      data = JSON.parse(raw);
    } catch {
      console.error(
        "Invalid realtime client-secret response:",
        raw
      );

      return Response.json(
        {
          error:
            "Voice transcription is temporarily unavailable."
        },
        {
          status: 502
        }
      );
    }

    if (
      typeof data?.value !== "string"
    ) {
      console.error(
        "Realtime client secret missing value:",
        data
      );

      return Response.json(
        {
          error:
            "Voice transcription is temporarily unavailable."
        },
        {
          status: 502
        }
      );
    }

    return Response.json(
      {
        value: data.value,
        expiresAt:
          data.expires_at || null
      },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate"
        }
      }
    );
  } catch (error) {
    console.error(
      "Realtime token error:",
      error
    );

    return Response.json(
      {
        error:
          "Voice transcription is temporarily unavailable."
      },
      {
        status: 502
      }
    );
  }
}
