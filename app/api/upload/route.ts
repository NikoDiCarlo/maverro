import OpenAI from "openai";
import { rateLimit, sameOrigin } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_FILE_BYTES = 8 * 1024 * 1024;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }

  const limit = rateLimit(request, "upload", 8, 10 * 60 * 1000);

  if (!limit.ok) {
    return Response.json(
      { error: "Upload limit reached. Try again shortly." },
      { status: 429 }
    );
  }

  try {
    const data = await request.formData();
    const file = data.get("file");

    if (!(file instanceof File)) {
      return Response.json(
        { error: "No PDF was provided." },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return Response.json(
        { error: "Maverro currently accepts PDF files only." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_BYTES) {
      return Response.json(
        { error: "PDFs are limited to 8 MB in this demo." },
        { status: 413 }
      );
    }

    const uploaded = await openai.files.create({
      file,
      purpose: "user_data",
      expires_after: {
        anchor: "created_at",
        seconds: 3600
      }
    });

    return Response.json(
      {
        id: uploaded.id,
        name: file.name
      },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (error) {
    console.error("Upload error:", error);

    return Response.json(
      { error: "The PDF could not be uploaded." },
      { status: 502 }
    );
  }
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }

  const id = new URL(request.url).searchParams.get("id");

  if (!id || !/^file[-_][A-Za-z0-9_-]+$/.test(id)) {
    return Response.json({ ok: true });
  }

  try {
    await openai.files.delete(id);
  } catch {
    // Files also expire automatically.
  }

  return Response.json({ ok: true });
}
