import { ScanReport } from "../types";

export async function neuralScan(url: string): Promise<any> {
  const response = await fetch("/api/active-scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Neural scan probe failed.");
  }

  return response.json();
}

export async function analyzeScan(target: string, scanData: any, context?: string): Promise<ScanReport> {
  const response = await fetch("/api/analyze-scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ target, scanData, context }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "AI Analysis probe failed.");
  }

  return response.json();
}

export async function analyzeOSINT(target: string, data: string): Promise<any> {
  const response = await fetch("/api/analyze-osint", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ target, data }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "OSINT synthesis failed.");
  }

  return response.json();
}

export async function streamChatMessage(
  message: string, 
  history: Array<{ role: 'user' | 'assistant'; content: string }>, 
  systemInstruction: string, 
  onChunk: (chunk: string) => void
): Promise<string> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history, systemInstruction }),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => "");
    throw new Error(err || "Chat communication dropped.");
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Streaming reader not available.");
  }

  const decoder = new TextDecoder();
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = decoder.decode(value, { stream: true });
    fullText += text;
    onChunk(text);
  }

  return fullText;
}
