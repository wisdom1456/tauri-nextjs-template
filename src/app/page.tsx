"use client";
import { RoundedButton } from "@/components/RoundedButton";
import { invoke } from "@tauri-apps/api/core";
import { useCallback, useState } from "react";

export default function Home() {
  const [message, setMessage] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const sendMessage = useCallback(async (): Promise<void> => {
    if (!message.trim()) return;
    
    setLoading(true);
    setResponse("");
    
    try {
      const result = await invoke<string>("chat", { message });
      setResponse(result);
    } catch (err: unknown) {
      console.error(err);
      setResponse("Error: Failed to get a response from the model.");
    } finally {
      setLoading(false);
    }
  }, [message]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  }, [sendMessage]);

  return (
    <div className="grid grid-rows-[auto_1fr_auto] h-screen p-8 font-[family-name:var(--font-geist-sans)]">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Mistral.rs Chat Demo</h1>
        <p className="text-sm text-gray-500">Using Phi-3.5-mini-instruct model</p>
      </header>
      
      <main className="overflow-auto border rounded-lg p-6 mb-6 bg-gray-50 dark:bg-gray-900">
        {response ? (
          <div className="whitespace-pre-wrap">{response}</div>
        ) : (
          <div className="text-gray-400 italic">
            {loading ? "Generating response..." : "Send a message to get a response from the AI"}
          </div>
        )}
      </main>

      <footer className="flex gap-2">
        <textarea
          value={message}
          onChange={(e) => { setMessage(e.target.value); }}
          onKeyDown={handleKeyPress}
          placeholder="Type your message here..."
          className="flex-grow p-3 border rounded resize-none h-20"
          disabled={loading}
        />
        <div className="flex flex-col justify-end">
          <RoundedButton
            onClick={() => void sendMessage()}
            title={loading ? "Loading..." : "Send"}
          />
        </div>
      </footer>
    </div>
  );
}
