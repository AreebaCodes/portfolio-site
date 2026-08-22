import { google } from '@ai-sdk/google';
import { streamText, convertToModelMessages, smoothStream, type UIMessage } from 'ai';
import { fetchMetaTags } from '../../tools';

const SYSTEM_PROMPT = `You are a helpful assistant embedded on Areeba's frontend developer portfolio site.
Answer questions about her work, specifically the HireIQ project: a CV evaluation tool
where she built the file-upload flow that lets users upload or paste a resume and receive
AI-driven feedback on strengths, weaknesses, and skill match.
Keep answers short (2-4 sentences), friendly, and honest. If you don't know something
specific about her work, say so rather than guessing.

If the user shares a URL or asks you to check a specific webpage, use the fetchMetaTags tool.`;

const MODEL = google('gemini-3.5-flash');

export async function POST(req: Request) {
  const body = await req.json();
  const messages: UIMessage[] = body.messages;

  if (!Array.isArray(messages)) {
    return new Response(
      JSON.stringify({ error: 'messages must be an array' }),
      { status: 400 }
    );
  }

  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: MODEL,
    system: SYSTEM_PROMPT,
    messages: modelMessages,
    tools: { fetchMetaTags },
    experimental_transform: smoothStream({ delayInMs: 25, chunking: 'word' }),
  });

  return result.toUIMessageStreamResponse();
}