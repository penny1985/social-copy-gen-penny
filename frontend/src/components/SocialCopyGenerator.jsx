import React, { useMemo, useState } from "react";

/** 純表單 + Prompt Builder（無任何模型串接、無生成按鈕） */
const S = {
  page: { fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, Arial", color: "#1a1a1a", background:"#F4EEDF" },
  container: { maxWidth: 1100, margin: "0 auto", padding: "24px" },
  h1: { fontSize: 22, fontWeight: 700, marginBottom: 8 },
  sub: { opacity: 0.7, marginBottom: 20, fontSize: 13 },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  col: { display: "flex", flexDirection: "column", gap: 12 },
  card: { border: "1px solid #e5e5e5", borderRadius: 12, padding: 16, background: "#fff" },
  label: { fontSize: 13, marginBottom: 6, opacity: 0.9 },
  input: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14 },
  textarea: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, resize: "vertical" },
  select: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, background: "#fff" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  btn: { padding: "10px 14px", borderRadius: 10, border: "1px solid #8A7A3F", background: "#1B6B4B", color: "#fff", cursor: "pointer", fontWeight: 600 },
  btnGhost: { padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", background: "#fff", color: "#333", cursor: "pointer", fontWeight: 600 },
  badge: { display: "inline-block", padding: "2px 8px", borderRadius: 999, fontSize: 12, border: "1px solid #ddd" },
  output: { width: "100%", minHeight: 240, whiteSpace: "pre-wrap", border: "1px solid #ddd", borderRadius: 12, padding: 12, background: "#fafafa", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", fontSize: 13 },
};

const FRAMEWORKS = ["AIDA", "PAS", "4P", "Story", "Problem-Agitate-Solve", "Before-After-Bridge"];
const PLATFORMS = ["Facebook", "Instagram", "Threads", "LinkedIn", "X(Twitter)", "小紅書", "TikTok"];
const LANGS = ["繁中", "簡中", "英文", "日文"];

export default function SocialCopyGenerator() {
  // 品牌/受眾/調性等（預設用你的綠金米案例）
  const [brand, setBrand] = useState("Penny 綠金米");
  const [audience, setAudience] = useState("25-40 歲注重永續與美感的白領族群");
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [tone, setTone] = useState("溫暖、專業、優雅");
  const [language, setLanguage] = useState("繁中");
  const [goal, setGoal] = useState("提升品牌好感與收藏，次要目標導流官網");
  const [framework, setFramework] = useState("AIDA");
  const [length, setLength] = useState("中等（120-200字）");

  // 內容元素
  const [writerPersona, setWriterPersona] = useState("品牌文案總監，擅長將價值觀轉譯為日常語言");
  const [storyChars, setStoryChars] = useState("主角：小米（品牌粉絲），配角：爸媽、同事");
  const [socialIssue, setSocialIssue] = useState("日常減塑、友善農法、碳足跡");
  const [keyMessages, setKeyMessages] = useState("米香純淨、產地透明、友善耕作、對土地溫柔");
  const [keywords, setKeywords] = useState("綠色生活、低碳飲食、無添加、產地直送");

  // 附加控制
  const [cta, setCta] = useState("點擊收藏，加入綠生活 ☘️");
  const [hashtagCount, setHashtagCount] = useState(5);
  const [useEmoji, setUseEmoji] = useState(true);
  const [variants, setVariants] = useState(2);

  // 自訂 Prompt（可直接覆蓋）
  const [customPrompt, setCustomPrompt] = useState("");
  const [preview, setPreview] = useState("");

  // 組裝 Prompt
  const builtPrompt = useMemo(() => {
    if (customPrompt.trim()) return customPrompt.trim();
    const parts = [
      `你是：${writerPersona}`,
      `品牌：${brand}；平台：${platform}；調性：${tone}；語言：${language}`,
      `目標：${goal}；框架：${framework}；篇幅：${length}`,
      `受眾：${audience}`,
      `故事角色：${storyChars || "（可自行補完）"}`,
      `社會議題（可輕觸）：${socialIssue || "（若不合適可略過）"}`,
      `關鍵訊息：${keyMessages}`,
      `關鍵字：${keywords}`,
      `CTA：${cta}`,
      `格式要求：請產出 ${variants} 則貼文變體；適度使用${useEmoji ? "表情符號" : "不使用表情符號"}；附上 ${hashtagCount} 個精準 hashtag；每則獨立呈現。`,
      `輸出結構：\n- 標題\n- 內文（依 ${framework} 結構）\n- Hashtags`,
    ];
    return parts.join("\n");
  }, [writerPersona, brand, platform, tone, language, goal, framework, length, audience, storyChars, socialIssue, keyMessages, keywords, cta, variants, useEmoji, hashtagCount, customPrompt]);

  return (
    <div style={S.page}>
      <div style={S.container}>
        <h1 style={S.h1}>Social Copy Prompt Builder</h1>
        <div style={S.sub}>僅保留參數表單與 Prompt 組裝、預覽與複製。已移除 GPT/Gemini 串接與生成區塊。</div>

        <div style={S.grid}>
          <div style={S.col}>
            <div style={S.card}>
              <div style={S.label}>品牌名稱</div>
              <input value={brand} onChange={(e)=>setBrand(e.target.value)} style={S.input}/>
              <div style={S.label}>受眾描述</div>
              <input value={audience} onChange={(e)=>setAudience(e.target.value)} style={S.input}/>
              <div style={S.row}>
                <div>
                  <div style={S.label}>平台</div>
                  <select value={platform} onChange={(e)=>setPlatform(e.target.value)} style={S.select}>
                    {PLATFORMS.map(p=><option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <div style={S.label}>語言</div>
                  <select value={language} onChange={(e)=>setLanguage(e.target.value)} style={S.select}>
                    {LANGS.map(l=><option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div style={S.label}>文案調性</div>
              <input value={tone} onChange={(e)=>setTone(e.target.value)} style={S.input}/>
              <div style={S.label}>目標（主/次）</div>
              <input value={goal} onChange={(e)=>setGoal(e.target.value)} style={S.input}/>
              <div style={S.row}>
                <div>
                  <div style={S.label}>框架</div>
                  <select value={framework} onChange={(e)=>setFramework(e.target.value)} style={S.select}>
                    {FRAMEWORKS.map(f=><option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <div style={S.label}>篇幅</div>
                  <input value={length} onChange={(e)=>setLength(e.target.value)} style={S.input}/>
                </div>
              </div>
            </div>

            <div style={S.card}>
              <div style={S.label}>寫手身分（系統提示）</div>
              <input value={writerPersona} onChange={(e)=>setWriterPersona(e.target.value)} style={S.input}/>
              <div style={S.label}>故事角色（可選）</div>
              <input value={storyChars} onChange={(e)=>setStoryChars(e.target.value)} style={S.input}/>
              <div style={S.label}>社會議題（可選）</div>
              <input value={socialIssue} onChange={(e)=>setSocialIssue(e.target.value)} style={S.input}/>
            </div>
          </div>

          <div style={S.col}>
            <div style={S.card}>
              <div style={S.label}>關鍵訊息</div>
              <textarea rows={5} value={keyMessages} onChange={(e)=>setKeyMessages(e.target.value)} style={S.textarea}/>
              <div style={S.label}>關鍵字（逗號分隔）</div>
              <input value={keywords} onChange={(e)=>setKeywords(e.target.value)} style={S.input}/>

              <div style={S.row}>
                <div>
                  <div style={S.label}>Hashtag 數量</div>
                  <input type="number" min={0} max={15} value={hashtagCount} onChange={(e)=>setHashtagCount(Number(e.target.value)||0)} style={S.input}/>
                </div>
                <div>
                  <div style={S.label}>變體數</div>
                  <input type="number" min={1} max={6} value={variants} onChange={(e)=>setVariants(Number(e.target.value)||1)} style={S.input}/>
                </div>
              </div>

              <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:8 }}>
                <span style={S.badge}>表情符號：{useEmoji?"開":"關"}</span>
                <label style={{display:"inline-flex", alignItems:"center", gap:6, cursor:"pointer"}}>
                  <input type="checkbox" checked={useEmoji} onChange={(e)=>setUseEmoji(e.target.checked)}/> 允許使用 Emoji
                </label>
              </div>
            </div>

            <div style={S.card}>
              <div style={S.label}>自訂 Prompt（可留白使用上面表單自動產出）</div>
              <textarea rows={6} value={customPrompt} onChange={(e)=>setCustomPrompt(e.target.value)} style={S.textarea} placeholder="若填寫，將覆蓋上方表單，直接用此 Prompt"/>
              <div style={{ display:"flex", gap:10, marginTop:10 }}>
                <button onClick={()=>setPreview(builtPrompt)} style={S.btnGhost}>預覽 Prompt</button>
                <button onClick={()=>navigator.clipboard?.writeText(builtPrompt)} style={S.btnGhost}>複製 Prompt</button>
              </div>
              {preview && (<div style={{...S.output, marginTop:10}}>{preview}</div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
