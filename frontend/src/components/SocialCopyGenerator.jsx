import React, { useMemo, useState } from "react";

const FRAMEWORK_TEMPLATES = {
  AIDA: ["吸引注意（開頭鉤子）","引發興趣（痛點/共鳴）","激發慾望（價值/好處）","促進行動（CTA）"],
  PAS: ["Problem 問題","Agitation 擴大問題情緒","Solution 解方（含產品/服務/觀點）"],
  FAB: ["Feature 特色","Advantage 優勢","Benefit 受益（對讀者的好處）"],
  "故事三幕式": ["起：場景/主角/衝突","承：嘗試/障礙/轉折","轉：洞見/解法/關鍵證據","合：行動呼籲/下一步"],
};

const PLATFORM_HINTS = {
  Facebook: "建議 150~300 字，段落清楚、可含表情符號與 Hashtag",
  Instagram: "建議 100~180 字，前 2 行要有鉤子，Hashtag 3~8 個",
  LinkedIn: "建議 300~600 字，專業口吻、條列清楚",
  "LINE 社群": "建議 60~120 字，直接明確、強 CTA",
  X: "建議 100~200 字，精煉有力",
};

const DEFAULT_MODELS = {
  OpenAI: "gpt-4o-mini",
  Gemini: "gemini-1.5-pro",
};

function Label({ children }) {
  return <label className="block text-sm font-medium text-gray-700 mb-1">{children}</label>;
}
function TextInput(props) {
  return <input {...props} className={`w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 shadow-sm ${props.className||""}`} />;
}
function TextArea(props) {
  return <textarea {...props} className={`w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 shadow-sm min-h-[88px] ${props.className||""}`} />;
}
function Select(props) {
  return <select {...props} className={`w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 shadow-sm ${props.className||""}`} />;
}
function Section({ title, children }) {
  return (
    <div className="card p-5">
      <div className="text-base font-semibold mb-3">{title}</div>
      {children}
    </div>
  );
}

export default function SocialCopyGenerator() {
  const [writerPersona, setWriterPersona] = useState("品牌創辦人、朋友般口吻");
  const [audience, setAudience] = useState("30-45 歲的創業者與個人品牌經營者");
  const [topic, setTopic] = useState("AI 工具幫助小型品牌提升產能與溝通效率");
  const [framework, setFramework] = useState("故事三幕式");
  const [keywords, setKeywords] = useState("AI、自媒體、品牌色、工作流");
  const [keyMessage, setKeyMessage] = useState("即使資源有限，也能用 AI 穩定產出、傳遞價值");
  const [tone, setTone] = useState("溫暖、具體、鼓勵、避免行話");
  const [platform, setPlatform] = useState("Facebook");
  const [length, setLength] = useState("300 字內");
  const [cta, setCta] = useState("留言分享你的經驗 / 點擊連結了解課程");
  const [versions, setVersions] = useState(2);

  const [mustInclude, setMustInclude] = useState("品牌名稱、#品牌色、網址");
  const [forbidden, setForbidden] = useState("過度承諾、誇大療效、敏感比較");
  const [emojis, setEmojis] = useState(true);
  const [hashtags, setHashtags] = useState(true);
  const [locale, setLocale] = useState("zh-TW");

  // Provider & model
  const [provider, setProvider] = useState("OpenAI");
  const [model, setModel] = useState(DEFAULT_MODELS.OpenAI);
  // User-provided API key (won't be stored)
  const [apiKey, setApiKey] = useState("");

  // Modes & outputs
  const [testMode, setTestMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [outputs, setOutputs] = useState(null);
  const [error, setError] = useState(null);

  const frameworkSteps = FRAMEWORK_TEMPLATES[framework] || [];
  const platformHint = PLATFORM_HINTS[platform] || "";

  const prompt = useMemo(() => {
    const kws = keywords.split(/[，,\\n]/).map(s=>s.trim()).filter(Boolean).join("、");
    const steps = frameworkSteps.length ? `\n鋪陳結構（${framework}）：\n- ${frameworkSteps.join("\n- ")}` : "";
    return (
      `請作為【${writerPersona}】撰寫一篇發佈於【${platform}】的社群文案，${length}，語言【${locale}】；語氣風格：【${tone}】。\n`+
      `目標受眾：【${audience}】；主題切角：【${topic}】。\n`+
      `文案必須強化的核心訊息：【${keyMessage}】。\n`+
      (kws?`需自然帶入關鍵字：【${kws}】。\n`:"")+
      `必須包含（若合理）：【${mustInclude}】；避免用語/做法：【${forbidden}】。\n`+
      `是否可用表情符號：${emojis?"可":"不可"}；是否自動產出 Hashtag：${hashtags?"是（3~8 個、與品牌/主題相關）":"否"}。\n`+
      `最後附上 CTA：【${cta}】。\n`+
      steps+
      `\n請輸出【${versions}】種不同切角的版本（分段清楚、容易複製）。`
    );
  }, [writerPersona, platform, length, locale, tone, audience, topic, keyMessage, keywords, mustInclude, forbidden, emojis, hashtags, cta, framework, frameworkSteps, versions]);

  function copy(text) { navigator.clipboard.writeText(text); }

  async function handleGenerate() {
    setOutputs(null); setError(null);
    if (testMode) {
      copy(prompt);
      setOutputs("（測試模式）已複製 Prompt 至剪貼簿。\n\n"+prompt);
      return;
    }
    if (!apiKey) { setError("請先輸入 API Key"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/generate`, {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, model, prompt, apiKey }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setOutputs(data.text || data.output || JSON.stringify(data, null, 2));
    } catch (e) {
      setError(e.message || "生成失敗，請稍後再試");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-beige to-white text-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="badge badge-gold">Penny</div>
            <h1 className="text-xl font-semibold">社群文案生成器</h1>
          </div>
          <div className="text-sm text-gray-600">綠金米配色｜簡潔高雅</div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* 左：表單 */}
          <div className="xl:col-span-2 space-y-4">
            <Section title="基本參數（必要）">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>寫手身分 / 口吻</Label><TextInput value={writerPersona} onChange={e=>setWriterPersona(e.target.value)} /></div>
                <div><Label>目標受眾</Label><TextInput value={audience} onChange={e=>setAudience(e.target.value)} /></div>
                <div className="md:col-span-2"><Label>社會議題 / 故事切角</Label><TextInput value={topic} onChange={e=>setTopic(e.target.value)} /></div>
                <div><Label>文案框架</Label><Select value={framework} onChange={e=>setFramework(e.target.value)}>{Object.keys(FRAMEWORK_TEMPLATES).map(k=><option key={k} value={k}>{k}</option>)}</Select></div>
                <div><Label>字數限制</Label><TextInput value={length} onChange={e=>setLength(e.target.value)} /></div>
                <div><Label>發佈平台</Label><Select value={platform} onChange={e=>setPlatform(e.target.value)}>{Object.keys(PLATFORM_HINTS).map(k=><option key={k} value={k}>{k}</option>)}</Select><div className="text-[12px] text-gray-500 mt-1">平台建議：{platformHint}</div></div>
                <div><Label>語氣 / 風格</Label><TextInput value={tone} onChange={e=>setTone(e.target.value)} /></div>
                <div className="md:col-span-2"><Label>重點訊息（核心觀點）</Label><TextArea value={keyMessage} onChange={e=>setKeyMessage(e.target.value)} /></div>
                <div className="md:col-span-2"><Label>品牌關鍵字（逗號分隔）</Label><TextInput value={keywords} onChange={e=>setKeywords(e.target.value)} /></div>
                <div className="md:col-span-2"><Label>CTA（行動呼籲）</Label><TextInput value={cta} onChange={e=>setCta(e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div><Label>版本數量（1~3）</Label><TextInput type="number" min={1} max={3} value={versions} onChange={e=>setVersions(parseInt(e.target.value||"1"))} /></div>
                <div><Label>含表情符號</Label><Select value={String(emojis)} onChange={e=>setEmojis(e.target.value==="true")}><option value="true">是</option><option value="false">否</option></Select></div>
                <div><Label>自動 Hashtag</Label><Select value={String(hashtags)} onChange={e=>setHashtags(e.target.value==="true")}><option value="true">是</option><option value="false">否</option></Select></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div><Label>必須包含</Label><TextInput value={mustInclude} onChange={e=>setMustInclude(e.target.value)} /></div>
                <div><Label>避免用語/做法</Label><TextInput value={forbidden} onChange={e=>setForbidden(e.target.value)} /></div>
              </div>
            </Section>

            <Section title="Prompt 預覽">
              <div className="flex items-center gap-2 mb-2">
                <button onClick={()=>copy(prompt)} className="btn btn-primary">複製 Prompt</button>
                <span className="text-xs text-gray-500">（可直接貼到任何模型測試）</span>
              </div>
              <pre className="bg-[#0b1020] text-[#e6f3ff] rounded-2xl p-4 overflow-auto text-xs leading-relaxed whitespace-pre-wrap border">{prompt}</pre>
            </Section>
          </div>

          {/* 右：模型設定與輸出 */}
          <div className="space-y-4">
            <Section title="模型設定與生成">
              <div className="grid grid-cols-1 gap-3">
                <div><Label>供應商</Label><Select value={provider} onChange={e=>{const p=e.target.value; setProvider(p); setModel(DEFAULT_MODELS[p]);}}><option value="OpenAI">OpenAI</option><option value="Gemini">Gemini</option></Select></div>
                <div><Label>模型</Label><TextInput value={model} onChange={e=>setModel(e.target.value)} placeholder="gpt-4o-mini / gemini-1.5-pro" /></div>
                <div><Label>你的 API Key（不會被儲存）</Label><TextInput value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder="sk-... 或 AIza..." /></div>
                <div className="flex items-center gap-2"><input id="testMode" type="checkbox" checked={testMode} onChange={e=>setTestMode(e.target.checked)} /><label htmlFor="testMode" className="text-sm text-gray-700">測試模式（不打 API，只複製 Prompt）</label></div>
                <button onClick={handleGenerate} disabled={loading} className="btn btn-primary">{loading?"生成中…":"生成文案"}</button>
                <div className="text-xs text-gray-500">提醒：正式上線請透過 Worker 代理 API 請求，前端不儲存任何金鑰。</div>
              </div>
            </Section>
            <Section title="輸出結果">
              <div className="flex items-center gap-2 mb-2">
                <button onClick={()=>outputs && copy(outputs)} disabled={!outputs} className="btn btn-ghost disabled:opacity-40">複製輸出</button>
              </div>
              {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 mb-2">{error}</div>}
              <pre className="bg-white text-gray-800 rounded-2xl p-4 overflow-auto text-sm leading-relaxed whitespace-pre-wrap border min-h-[200px]">{outputs || "（尚無輸出）"}</pre>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}

// 將此常數改為你的 Worker URL，例如：
// const API_BASE = "https://your-worker-subdomain.workers.dev";
const API_BASE = "";
