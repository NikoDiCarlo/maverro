"use client";

import {
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState
} from "react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Mode =
  | "markets"
  | "research"
  | "code";

type Source = {
  url: string;
  title: string;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
};

type UploadedFile = {
  id: string;
  name: string;
};

const MODES: Record<
  Mode,
  {
    title: string;
    description: string;
    starter: string;
    suggestions: string[];
  }
> = {
  markets: {
    title: "MARKETS",
    description:
      "Understand what is happening.",
    starter:
      "What do you want to know about the market?",
    suggestions: [
      "What mattered in markets today?",
      "What moved software stocks?",
      "Find an unusual earnings reaction"
    ]
  },

  research: {
    title: "RESEARCH",
    description:
      "Investigate evidence and primary sources.",
    starter:
      "What are we investigating? I can search the web, retrieve SEC filings, and analyze documents.",
    suggestions: [
      "Analyze a company",
      "Compare SEC filings",
      "Investigate a thesis"
    ]
  },

  code: {
    title: "CODE",
    description:
      "Turn the idea into quantitative research.",
    starter:
      "Tell me the idea. I can help build it in Python or C++.",
    suggestions: [
      "Build a backtest",
      "Write quantitative Python",
      "Implement a strategy in C++"
    ]
  }
};

function id() {
  return crypto.randomUUID();
}

function CodeBlock({
  className,
  children,
  ...props
}: any) {
  const language =
    /language-([\w+-]+)/.exec(
      className || ""
    )?.[1];

  const code = String(children).replace(
    /\n$/,
    ""
  );

  if (!language) {
    return (
      <code
        className="inline-code"
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <div className="code-shell">
      <div className="code-head">
        <span>
          {language.toUpperCase()}
        </span>

        <button
          className="copy-button"
          onClick={() =>
            navigator.clipboard.writeText(
              code
            )
          }
          type="button"
        >
          COPY
        </button>
      </div>

      <pre>
        <code className={className}>
          {code}
        </code>
      </pre>
    </div>
  );
}

function Markdown({
  children
}: {
  children: string;
}) {
  return (
    <div className="markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: CodeBlock,

          a({
            children,
            ...props
          }) {
            return (
              <a
                {...props}
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            );
          }
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

export default function Home() {
  const [mode, setMode] =
    useState<Mode | null>(null);

  const [
    messages,
    setMessages
  ] = useState<Message[]>([]);

  const [input, setInput] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [file, setFile] =
    useState<UploadedFile | null>(
      null
    );

  const [
    uploading,
    setUploading
  ] = useState(false);

  const [
    listening,
    setListening
  ] = useState(false);

  const [
    voiceError,
    setVoiceError
  ] = useState("");

  const abortRef =
    useRef<AbortController | null>(
      null
    );

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const bottomRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const pcRef =
    useRef<RTCPeerConnection | null>(
      null
    );

  const dcRef =
    useRef<RTCDataChannel | null>(
      null
    );

  const mediaRef =
    useRef<MediaStream | null>(
      null
    );

  const voiceBaseRef =
    useRef("");

  const voicePartialRef =
    useRef("");

  const voiceCloseTimerRef =
    useRef<
      ReturnType<typeof setTimeout> |
        undefined
    >(undefined);

  const activeMode =
    mode || "research";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end"
    });
  }, [messages, status]);

  /*
   * Clean up microphone/WebRTC if the user
   * leaves the page.
   */
  useEffect(() => {
    return () => {
      if (
        voiceCloseTimerRef.current
      ) {
        clearTimeout(
          voiceCloseTimerRef.current
        );
      }

      mediaRef.current
        ?.getTracks()
        .forEach((track) =>
          track.stop()
        );

      dcRef.current?.close();
      pcRef.current?.close();
    };
  }, []);

  function selectMode(next: Mode) {
    setMode(next);
  }

  function useSuggestion(
    value: string
  ) {
    setInput(value);
  }

  async function uploadPdf(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const selected =
      event.target.files?.[0];

    event.target.value = "";

    if (!selected) return;

    if (
      selected.type !==
      "application/pdf"
    ) {
      setStatus("PDF files only");
      return;
    }

    if (
      selected.size >
      8 * 1024 * 1024
    ) {
      setStatus("PDF limit: 8 MB");
      return;
    }

    setUploading(true);
    setStatus(
      "Uploading document"
    );

    try {
      const form = new FormData();

      form.append(
        "file",
        selected
      );

      const response = await fetch(
        "/api/upload",
        {
          method: "POST",
          body: form
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Upload failed."
        );
      }

      setFile({
        id: result.id,
        name: result.name
      });

      setMode(
        (current) =>
          current || "research"
      );

      setStatus("");
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Upload failed"
      );
    } finally {
      setUploading(false);
    }
  }

  async function removeFile() {
    const existing = file;

    setFile(null);

    if (!existing) return;

    fetch(
      `/api/upload?id=${encodeURIComponent(
        existing.id
      )}`,
      {
        method: "DELETE"
      }
    ).catch(() => {});
  }

  function cleanupVoice() {
    if (
      voiceCloseTimerRef.current
    ) {
      clearTimeout(
        voiceCloseTimerRef.current
      );

      voiceCloseTimerRef.current =
        undefined;
    }

    mediaRef.current
      ?.getTracks()
      .forEach((track) =>
        track.stop()
      );

    try {
      dcRef.current?.close();
    } catch {
      // Already closed.
    }

    try {
      pcRef.current?.close();
    } catch {
      // Already closed.
    }

    mediaRef.current = null;
    dcRef.current = null;
    pcRef.current = null;

    setListening(false);
  }

  async function waitForDataChannel(
    dc: RTCDataChannel
  ) {
    if (dc.readyState === "open") {
      return;
    }

    await new Promise<void>(
      (resolve, reject) => {
        const timeout = setTimeout(
          () => {
            cleanup();
            reject(
              new Error(
                "Voice connection timed out."
              )
            );
          },
          7000
        );

        const cleanup = () => {
          clearTimeout(timeout);

          dc.removeEventListener(
            "open",
            handleOpen
          );

          dc.removeEventListener(
            "error",
            handleError
          );
        };

        const handleOpen = () => {
          cleanup();
          resolve();
        };

        const handleError = () => {
          cleanup();

          reject(
            new Error(
              "Voice connection failed."
            )
          );
        };

        dc.addEventListener(
          "open",
          handleOpen
        );

        dc.addEventListener(
          "error",
          handleError
        );
      }
    );
  }

  async function startVoice() {
    if (listening) {
      stopVoice();
      return;
    }

    setVoiceError("");
    setStatus(
      "Opening microphone"
    );

    try {
      /*
       * 1. Ask Maverro's Vercel backend for
       *    a temporary OpenAI Realtime key.
       */
      const tokenResponse =
        await fetch(
          "/api/realtime-token",
          {
            method: "POST",
            cache: "no-store"
          }
        );

      const token =
        await tokenResponse.json();

      if (
        !tokenResponse.ok ||
        !token.value
      ) {
        throw new Error(
          token.error ||
            "Voice could not start."
        );
      }

      /*
       * 2. Ask the browser for microphone
       *    permission.
       */
      const media =
        await navigator.mediaDevices.getUserMedia(
          {
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          }
        );

      mediaRef.current = media;

      /*
       * 3. Establish WebRTC.
       */
      const pc =
        new RTCPeerConnection();

      pcRef.current = pc;

      media
        .getAudioTracks()
        .forEach((track) => {
          pc.addTrack(
            track,
            media
          );
        });

      /*
       * No remote audio is expected.
       * Maverro is voice-in / text-out.
       */
      const dc =
        pc.createDataChannel(
          "oai-events"
        );

      dcRef.current = dc;

      voiceBaseRef.current =
        input.trim()
          ? `${input.trim()} `
          : "";

      voicePartialRef.current =
        "";

      /*
       * 4. Receive live transcript deltas.
       */
      dc.addEventListener(
        "message",
        (event) => {
          try {
            const message =
              JSON.parse(
                event.data
              );

            if (
              message.type ===
              "conversation.item.input_audio_transcription.delta"
            ) {
              voicePartialRef.current +=
                message.delta || "";

              setInput(
                voiceBaseRef.current +
                  voicePartialRef.current
              );
            }

            if (
              message.type ===
              "conversation.item.input_audio_transcription.completed"
            ) {
              const transcript =
                message.transcript ||
                voicePartialRef.current;

              voicePartialRef.current =
                transcript;

              setInput(
                voiceBaseRef.current +
                  transcript.trim()
              );

              /*
               * We have the final committed transcript.
               * Close the voice transport shortly after.
               */
              voiceCloseTimerRef.current =
                setTimeout(
                  cleanupVoice,
                  150
                );
            }

            if (
              message.type ===
              "conversation.item.input_audio_transcription.failed"
            ) {
              setVoiceError(
                message?.error?.message ||
                  "I couldn't transcribe that. Try again."
              );
            }

            if (
              message.type === "error"
            ) {
              console.error(
                "Realtime voice event error:",
                message
              );

              setVoiceError(
                message?.error?.message ||
                  "Voice transcription encountered an error."
              );
            }
          } catch {
            /*
             * Ignore unrelated or malformed
             * realtime events.
             */
          }
        }
      );

      /*
       * 5. Generate the local SDP offer.
       */
      const offer =
        await pc.createOffer();

      await pc.setLocalDescription(
        offer
      );

      if (!offer.sdp) {
        throw new Error(
          "Could not initialize voice."
        );
      }

      /*
       * 6. Connect directly to the current
       *    OpenAI Realtime WebRTC endpoint
       *    using ONLY the temporary key.
       */
      const sdpResponse =
        await fetch(
          "https://api.openai.com/v1/realtime/calls",
          {
            method: "POST",

            body: offer.sdp,

            headers: {
              Authorization:
                `Bearer ${token.value}`,

              "Content-Type":
                "application/sdp"
            }
          }
        );

      const answerSdp =
        await sdpResponse.text();

      if (!sdpResponse.ok) {
        console.error(
          "OpenAI Realtime SDP error:",
          sdpResponse.status,
          answerSdp
        );

        throw new Error(
          "Realtime voice connection failed."
        );
      }

      await pc.setRemoteDescription({
        type: "answer",
        sdp: answerSdp
      });

      /*
       * Do not claim we're listening until
       * the Realtime data channel is usable.
       */
      await waitForDataChannel(dc);

      setListening(true);
      setStatus("");
    } catch (error) {
      cleanupVoice();

      const text =
        error instanceof Error
          ? error.message
          : "Voice unavailable.";

      /*
       * Keep the voice error local to the
       * composer instead of duplicating it
       * in the global activity indicator.
       */
      setVoiceError(text);
      setStatus("");
    }
  }

  function stopVoice() {
    /*
     * Change visual state immediately.
     */
    setListening(false);

    /*
     * Stop adding new microphone audio.
     */
    mediaRef.current
      ?.getAudioTracks()
      .forEach((track) => {
        track.enabled = false;
      });

    /*
     * Because turn_detection is disabled in
     * the transcription session, Maverro
     * explicitly commits the captured turn.
     */
    try {
      if (
        dcRef.current?.readyState ===
        "open"
      ) {
        dcRef.current.send(
          JSON.stringify({
            type:
              "input_audio_buffer.commit"
          })
        );
      }
    } catch (error) {
      console.error(
        "Voice commit error:",
        error
      );
    }

    /*
     * Give the final transcription event
     * enough time to return.
     *
     * The completed-event handler usually
     * closes the connection earlier.
     */
    voiceCloseTimerRef.current =
      setTimeout(
        cleanupVoice,
        3000
      );
  }

  async function sendMessage() {
    const text = input.trim();

    if (!text || loading) {
      return;
    }

    if (listening) {
      stopVoice();
    }

    setVoiceError("");

    const userMessage: Message = {
      id: id(),
      role: "user",
      content: text
    };

    const assistantId = id();

    const assistantMessage: Message =
      {
        id: assistantId,
        role: "assistant",
        content: ""
      };

    const nextMessages = [
      ...messages,
      userMessage
    ].slice(-14);

    setMessages([
      ...nextMessages,
      assistantMessage
    ]);

    setInput("");
    setLoading(true);
    setStatus("Working");

    const controller =
      new AbortController();

    abortRef.current =
      controller;

    try {
      const response = await fetch(
        "/api/ask",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          signal:
            controller.signal,

          body: JSON.stringify({
            mode: activeMode,
            fileId:
              file?.id || null,

            messages:
              nextMessages.map(
                ({
                  role,
                  content
                }) => ({
                  role,
                  content
                })
              )
          })
        }
      );

      if (!response.ok) {
        const error =
          await response
            .json()
            .catch(() => ({}));

        throw new Error(
          error.error ||
            `Request failed (${response.status})`
        );
      }

      if (!response.body) {
        throw new Error(
          "No response stream."
        );
      }

      const reader =
        response.body.getReader();

      const decoder =
        new TextDecoder();

      let buffer = "";

      while (true) {
        const {
          value,
          done
        } = await reader.read();

        if (done) break;

        buffer += decoder.decode(
          value,
          {
            stream: true
          }
        );

        const lines =
          buffer.split("\n");

        buffer =
          lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) {
            continue;
          }

          let event: any;

          try {
            event =
              JSON.parse(line);
          } catch {
            continue;
          }

          if (
            event.type ===
            "status"
          ) {
            setStatus(
              event.text
            );
          }

          if (
            event.type ===
            "delta"
          ) {
            setStatus("");

            setMessages(
              (current) =>
                current.map(
                  (message) =>
                    message.id ===
                    assistantId
                      ? {
                          ...message,
                          content:
                            message.content +
                            event.text
                        }
                      : message
                )
            );
          }

          if (
            event.type ===
            "sources"
          ) {
            setMessages(
              (current) =>
                current.map(
                  (message) =>
                    message.id ===
                    assistantId
                      ? {
                          ...message,
                          sources:
                            event.sources
                        }
                      : message
                )
            );
          }

          if (
            event.type ===
            "error"
          ) {
            throw new Error(
              event.text
            );
          }

          if (
            event.type ===
            "done"
          ) {
            setStatus("");
          }
        }
      }
    } catch (error) {
      if (
        error instanceof
          DOMException &&
        error.name ===
          "AbortError"
      ) {
        setStatus("");
      } else {
        const text =
          error instanceof Error
            ? error.message
            : "Maverro encountered an error.";

        setStatus("");

        setMessages(
          (current) =>
            current.map(
              (message) =>
                message.id ===
                assistantId
                  ? {
                      ...message,
                      content:
                        message.content ||
                        `**Temporary error:** ${text}`
                    }
                  : message
            )
        );
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  function stopGeneration() {
    abortRef.current?.abort();

    setLoading(false);
    setStatus("");
  }

  function onKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      sendMessage();
    }
  }

  const hasConversation =
    messages.length > 0;

  return (
    <main
      className="shell"
      data-mode={
        mode || "neutral"
      }
    >
      <div className="ambient-grid" />

      <div className="app">
        <header className="topbar">
          <div className="brand">
            <img
              src="/favicon.ico"
              alt=""
              aria-hidden="true"
            />

            <span>
              MAVERRO
            </span>
          </div>

          <div className="status-pill">
            <span className="status-dot" />
            SESSION ONLY
          </div>
        </header>

        <section
          className={`hero ${
            hasConversation
              ? "compact"
              : ""
          }`}
        >
          {!hasConversation && (
            <div className="hero-kicker">
              FINANCIAL INTELLIGENCE
            </div>
          )}

          <h1>
            {hasConversation
              ? "Maverro"
              : "Research at market speed."}
          </h1>

          {!hasConversation && (
            <p>
              A high-speed,
              voice-first AI research
              copilot for markets,
              investment research,
              and quantitative
              development.
            </p>
          )}
        </section>

        <section className="mode-grid">
          {(
            Object.keys(
              MODES
            ) as Mode[]
          ).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() =>
                selectMode(key)
              }
              className={`mode-card ${
                mode === key
                  ? "active"
                  : ""
              }`}
            >
              <span className="mode-name">
                {
                  MODES[key]
                    .title
                }
              </span>

              <span className="mode-description">
                {
                  MODES[key]
                    .description
                }
              </span>
            </button>
          ))}
        </section>

        {!hasConversation &&
          mode && (
            <>
              <div className="starter">
                {
                  MODES[mode]
                    .starter
                }
              </div>

              <div className="suggestions">
                {MODES[
                  mode
                ].suggestions.map(
                  (
                    suggestion
                  ) => (
                    <button
                      key={
                        suggestion
                      }
                      className="suggestion"
                      type="button"
                      onClick={() =>
                        useSuggestion(
                          suggestion
                        )
                      }
                    >
                      {
                        suggestion
                      }
                    </button>
                  )
                )}
              </div>
            </>
          )}

        <section className="conversation">
          {messages.map(
            (message) => (
              <article
                key={
                  message.id
                }
                className={`message ${message.role}`}
              >
                <div className="message-inner">
                  {message.role ===
                    "assistant" && (
                    <div className="message-label">
                      MAVERRO
                    </div>
                  )}

                  {message.role ===
                  "assistant" ? (
                    <Markdown>
                      {message.content ||
                        (loading
                          ? ""
                          : "…")}
                    </Markdown>
                  ) : (
                    <div>
                      {
                        message.content
                      }
                    </div>
                  )}

                  {!!message.sources
                    ?.length && (
                    <div className="sources">
                      {message.sources.map(
                        (
                          source,
                          index
                        ) => (
                          <a
                            className="source"
                            key={`${source.url}-${index}`}
                            href={
                              source.url
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            title={
                              source.title
                            }
                          >
                            {index +
                              1}
                            .{" "}
                            {source.title ||
                              "Source"}
                          </a>
                        )
                      )}
                    </div>
                  )}
                </div>
              </article>
            )
          )}

          {status && (
            <div className="activity">
              <span className="activity-pulse" />

              {status}
            </div>
          )}

          <div
            ref={bottomRef}
          />
        </section>

        <section className="composer-wrap">
          {file && (
            <div className="file-chip">
              <span>
                PDF ·{" "}
                {file.name}
              </span>

              <button
                type="button"
                onClick={
                  removeFile
                }
                aria-label="Remove PDF"
              >
                ×
              </button>
            </div>
          )}

          <div className="composer">
            <textarea
              value={input}
              rows={2}
              placeholder={
                listening
                  ? "Listening…"
                  : "Ask Maverro…"
              }
              onChange={(
                event
              ) =>
                setInput(
                  event.target
                    .value
                )
              }
              onKeyDown={
                onKeyDown
              }
            />

            <div className="composer-bottom">
              <div className="composer-tools">
                <button
                  className="tool-button"
                  type="button"
                  title="Attach PDF"
                  aria-label="Attach PDF"
                  disabled={
                    uploading
                  }
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                >
                  +
                </button>

                <input
                  className="hidden-input"
                  ref={
                    fileInputRef
                  }
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={
                    uploadPdf
                  }
                />

                <button
                  className={`tool-button ${
                    listening
                      ? "listening"
                      : ""
                  }`}
                  type="button"
                  title={
                    listening
                      ? "Stop listening"
                      : "Talk to Maverro"
                  }
                  aria-label={
                    listening
                      ? "Stop listening"
                      : "Talk to Maverro"
                  }
                  onClick={
                    startVoice
                  }
                >
                  {listening
                    ? "■"
                    : "●"}
                </button>

                {listening && (
                  <span className="voice-wave">
                    <i />
                    <i />
                    <i />
                  </span>
                )}

                {voiceError && (
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 10,
                      color:
                        "#8b9099"
                    }}
                  >
                    {
                      voiceError
                    }
                  </span>
                )}
              </div>

              <button
                className="send-button"
                type="button"
                disabled={
                  !input.trim() &&
                  !loading
                }
                onClick={
                  loading
                    ? stopGeneration
                    : sendMessage
                }
                title={
                  loading
                    ? "Stop"
                    : "Send"
                }
                aria-label={
                  loading
                    ? "Stop generation"
                    : "Send message"
                }
              >
                {loading
                  ? "■"
                  : "↑"}
              </button>
            </div>
          </div>
        </section>
      </div>

      <div className="copyright">
        © 2026 Niko DiCarlo
      </div>
    </main>
  );
}
