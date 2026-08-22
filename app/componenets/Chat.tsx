'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { MetaTagsCard } from './MetaTagsCard';

export function Chat() {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const isPinnedToBottom = useRef(true);

  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });

  const isStreaming = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    const el = scrollRef.current;
    if (el && isPinnedToBottom.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isPinnedToBottom.current = distanceFromBottom < 50;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput('');
    isPinnedToBottom.current = true;
  }

  return (
    <div className="chat-container">
      <div className="chat-messages" ref={scrollRef} onScroll={handleScroll}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={message.role === 'user' ? 'chat-msg chat-msg-user' : 'chat-msg chat-msg-assistant'}
          >
            {message.parts.map((part, i) => {
              if (part.type === 'text') {
                return <span key={i}>{part.text}</span>;
              }

              if (part.type === 'tool-fetchMetaTags') {
                switch (part.state) {
                  case 'input-streaming':
                    return (
                      <div key={i} className="tool-card tool-card-loading">
                        <div className="tool-card-spinner" />
                        <span>Preparing to check a link...</span>
                      </div>
                    );
                  case 'input-available':
                    return (
                      <div key={i} className="tool-card tool-card-loading">
                        <div className="tool-card-spinner" />
                        <span>Checking {part.input?.url ?? 'the page'}...</span>
                      </div>
                    );
                  case 'output-available': {
                    const output = part.output as
                      | { success: true; url: string; title: string; description: string }
                      | { success: false; error: string };
                    if (!output.success) {
                      return (
                        <div key={i} className="tool-card tool-card-error">
                          <strong>Couldn't check that page</strong>
                          <p>{output.error}</p>
                        </div>
                      );
                    }
                    return <MetaTagsCard key={i} data={output} />;
                  }
                  case 'output-error':
                    return (
                      <div key={i} className="tool-card tool-card-error">
                        <strong>Something went wrong</strong>
                        <p>{part.errorText ?? 'The tool failed to run.'}</p>
                      </div>
                    );
                  default:
                    return null;
                }
              }

              return null;
            })}
          </div>
        ))}

        {status === 'submitted' && (
          <div className="chat-msg chat-msg-assistant chat-thinking">Thinking...</div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="chat-input-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about my work, or paste a link..."
          className="chat-input"
          disabled={isStreaming}
        />
        {isStreaming ? (
          <button type="button" onClick={stop} className="chat-btn chat-btn-stop">
            Stop
          </button>
        ) : (
          <button type="submit" className="chat-btn chat-btn-send">
            Send
          </button>
        )}
      </form>
    </div>
  );
}