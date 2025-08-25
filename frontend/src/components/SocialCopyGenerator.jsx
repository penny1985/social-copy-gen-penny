import React, { useState } from "react";

/** 同網域呼叫，保持空字串即可 */
const API_BASE = "";

export default function SocialCopyGenerator() {
  const [provider, setProvider] = useState("OpenAI");
  const [model, setModel] = useState("gpt-4o-mini");
  const [apiKey, setApiKey] = useState("");
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const openAIModels = ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini"];
  const geminiModels = ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-1.0-pro"];

  const handleProviderChange = (p) => {
    setProvider(p);
    setModel(p === "OpenAI" ? openAIModels[0] : geminiModels[0]);
  };

  async function handleGenerate() {
    setLoading(true);
    setOutput("");
    try {
      const res = await fetch(`${API_BASE}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          model,
          prompt,
          apiKey,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");
      setOutput(data?.text || JSON.stringify(data?.raw, null, 2));
    } catch (e) {
      setOutput(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen px-6 py-8 max-w-5xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Social Copy Generator</h1>
        <p className="text-sm opacity-70">OpenAI / Gemini，使用者自帶 API Key</p>
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        {/* 設定區 */}
        <aside className="md:col-span-1 space-y-4">
          <div>
            <label className="block text-sm mb-1">供應商</label>
            <select
              value={provider}
              onChange={(e) => handleProviderChange(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option>OpenAI</option>
              <option>Gemini</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">模型</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              {(provider === "OpenAI" ? openAIModels : geminiModels).map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">你的 API Key</label>
            <input
              type="password"
              placeholder={provider === "OpenAI" ? "sk-..." : "AIza..."}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </aside>

        {/* 輸入與結果 */}
        <main className="md:col-span-2 space-y-4">
          <div>
            <label className="block text-sm mb-1">你的 Prompt</label>
            <textarea
              rows={8}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="在這裡貼上或編寫你的 prompt..."
              classNam
