import React, { useMemo, useState } from "react";

/** ���P���� API�]Cloudflare Pages Functions�^�A�O���Ŧr�� */
const API_BASE = "";

/** ²�椺�ؼ˦��]�קK�̿� Tailwind �y�������ǩζýX�^ */
const S = {
  page: { fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, Arial", color: "#1a1a1a" },
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
  row3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 },
  btn: { padding: "10px 14px", borderRadius: 10, border: "1px solid #0f5132", background: "#11694a", color: "#fff", cursor: "pointer", fontWeight: 600 },
  btnGhost: { padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", background: "#fff", color: "#333", cursor: "pointer", fontWeight: 600 },
  badge: { display: "inline-block", padding: "2px 8px", borderRadius: 999, fontSize: 12, border: "1px solid #ddd" },
  output: { width: "100%", minHeight: 240, whiteSpace: "pre-wrap", border: "1px solid #ddd", borderRadius: 12, padding: 12, background: "#fafafa", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", fontSize: 13 },
};

const OPENAI_MODELS = ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini"];
const GEMINI_MODELS = ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-1.0-pro"];
const FRAMEWORKS = ["AIDA", "PAS", "4P", "Story", "Problem-Agitate-Solve", "Before-After-Bridge"];
const TONES = ["�ŷx", "�M�~", "�N��", "�v��", "����", "��¡", "����"];
const PLATFORMS = ["Facebook", "Instagram", "Threads", "LinkedIn", "X(Twitter)", "�p����", "TikTok"];
const LANGS = ["�c��", "²��", "�^��", "���"];

export default function SocialCopyGenerator() {
  // ������/�ҫ�/API Key
  const [provider, setProvider] = useState("OpenAI");
  const [model, setModel] = useState(OPENAI_MODELS[0]);
  const [apiKey, setApiKey] = useState("");

  // �~�P/����/�թʵ�
  const [brand, setBrand] = useState("Penny �����");
  const [audience, setAudience] = useState("25-40 ���`������P���P���ջ�ڸs");
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [tone, setTone] = useState("�ŷx�B�M�~�B�u��");
  const [language, setLanguage] = useState("�c��");
  const [goal, setGoal] = useState("���ɫ~�P�n�P�P���áA���n�ؼоɬy�x��");
  const [framework, setFramework] = useState("AIDA");
  const [length, setLength] = useState("�����]120-200�r�^");

  // ?�e����
  const [writerPersona, setWriterPersona] = useState("�~�P����`�ʡA�ժ��N�����[��Ķ����`�y��");
  const [storyChars, setStoryChars] = useState("�D���G�p�̡]�~�P�����^�A�t���G�����B�P��");
  const [socialIssue, setSocialIssue] = useState("��`���B�͵��A�k�B�Ҩ���");
  const [keyMessages, setKeyMessages] = useState("�̭��²b�B���a�z���B�͵��ѧ@�B��g�a�ŬX");
  const [keywords, setKeywords] = useState("���ͬ��B�C�Ҷ����B�L�K�[�B���a���e");

  // ���[����
  const [cta, setCta] = useState("�I�����áA�[�J��ͬ� ??");
  const [hashtagCount, setHashtagCount] = useState(5);
  const [useEmoji, setUseEmoji] = useState(true);
  const [variants, setVariants] = useState(2);

  // �ۭq Prompt�]�i�����л\�^
  const [customPrompt, setCustomPrompt] = useState("");

  // ���G/���A
  const [preview, setPreview] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  // �����Ӥ����ɦ۰ʴ��ҫ�
  const handleProvider = (p) => {
    setProvider(p);
    setModel(p === "OpenAI" ? OPENAI_MODELS[0] : GEMINI_MODELS[0]);
  };

  // �ո� Prompt
  const builtPrompt = useMemo(() => {
    if (customPrompt.trim()) return customPrompt.trim();
    const parts = [
      `�A�O�G${writerPersona}`,
      `�~�P�G${brand}�F���x�G${platform}�F�թʡG${tone}�F�y���G${language}`,
      `�ؼСG${goal}�F�ج[�G${framework}�F�g�T�G${length}`,
      `�����G${audience}`,
      `�G�ƨ���G${storyChars || "�]�i�ۦ�ɧ��^"}`,
      `���|ĳ�D�]�i��Ĳ�^�G${socialIssue || "�]�Y���X�A�i���L�^"}`,
      `����T���G${keyMessages}`,
      `����r�G${keywords}`,
      `CTA�G${cta}`,
      `�榡�n�D�G�в��X ${variants} �h�K������F�קK�B�ػP����/�~�ɩӿաF�A�רϥ�${useEmoji ? "���Ÿ�" : "���ϥΪ��Ÿ�"}�F���W ${hashtagCount} �Ӻ�� hashtag�F�C�h�W�ߧe�{�C`,
      `��X���c�G\n- ���D\n- ����]�� ${framework} ���c�^\n- Hashtags`,
    ];
    return parts.join("\n");
  }, [writerPersona, brand, platform, tone, language, goal, framework, length, audience, storyChars, socialIssue, keyMessages, keywords, cta, variants, useEmoji, hashtagCount, customPrompt]);

  function doPreview() {
    setPreview(builtPrompt);
  }

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
          apiKey,
          prompt: builtPrompt + "\n\n�п�`��X���c�A���鶡�Ρy---�z���j�C",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "�ШD����");
      setOutput(data?.text || JSON.stringify(data?.raw, null, 2));
    } catch (e) {
      setOutput("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard?.writeText(text);
  }

  return (
    <div style={S.page}>
      <div style={S.container}>
        <h1 style={S.h1}>Social Copy Generator�]������^</h1>
        <div style={S.sub}>OpenAI / Gemini�]�ϥΪ̦۱a API Key�^�C����̰t�⨫²�䰪���G���ز`����s�P�L��I���C</div>

        {/* ������ / �ҫ� / Key */}
        <div style={{...S.card, marginBottom: 16}}>
          <div style={S.row3}>
            <div>
              <div style={S.label}>������</div>
              <select value={provider} onChange={(e)=>handleProvider(e.target.value)} style={S.select}>
                <option>OpenAI</option>
                <option>Gemini</option>
              </select>
            </div>
            <div>
              <div style={S.label}>�ҫ�</div>
              <select value={model} onChange={(e)=>setModel(e.target.value)} style={S.select}>
                {(provider==="OpenAI"?OPENAI_MODELS:GEMINI_MODELS).map(m=> <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <div style={S.label}>�A�� API Key</div>
              <input type="password" placeholder={provider==="OpenAI"?"sk-...":"AIza..."} value={apiKey} onChange={(e)=>setApiKey(e.target.value)} style={S.input}/>
            </div>
          </div>
        </div>

        {/* �D�n��� */}
        <div style={S.grid}>
          <div style={S.col}>
            <div style={S.card}>
              <div style={S.label}>�~�P�W��</div>
              <input value={brand} onChange={(e)=>setBrand(e.target.value)} style={S.input}/>
              <div style={S.label}>�����y�z</div>
              <input value={audience} onChange={(e)=>setAudience(e.target.value)} style={S.input}/>
              <div style={S.row}>
                <div>
                  <div style={S.label}>���x</div>
                  <select value={platform} onChange={(e)=>setPlatform(e.target.value)} style={S.select}>
                    {PLATFORMS.map(p=><option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <div style={S.label}>�y��</div>
                  <select value={language} onChange={(e)=>setLanguage(e.target.value)} style={S.select}>
                    {LANGS.map(l=><option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div style={S.label}>��׽թ�</div>
              <input value={tone} onChange={(e)=>setTone(e.target.value)} style={S.input} placeholder="�ҡG�ŷx�B�M�~�B�u��"/>

              <div style={S.label}>�ؼС]�D/���^</div>
              <input value={goal} onChange={(e)=>setGoal(e.target.value)} style={S.input} placeholder="�ҡG���ɦ���/���ʡB�ɬy�x��"/>

              <div style={S.row}>
                <div>
                  <div style={S.label}>�ج[</div>
                  <select value={framework} onChange={(e)=>setFramework(e.target.value)} style={S.select}>
                    {FRAMEWORKS.map(f=><option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <div style={S.label}>�g�T</div>
                  <input value={length} onChange={(e)=>setLength(e.target.value)} style={S.input} placeholder="�u/��/�� �Φr�ƽd��"/>
                </div>
              </div>
            </div>

            <div style={S.card}>
              <div style={S.label}>�g�⨭���]�t�δ��ܡ^</div>
              <input value={writerPersona} onChange={(e)=>setWriterPersona(e.target.value)} style={S.input}/>

              <div style={S.label}>�G�ƨ���]�i��^</div>
              <input value={storyChars} onChange={(e)=>setStoryChars(e.target.value)} style={S.input}/>

              <div style={S.label}>���|ĳ�D�]�i��^</div>
              <input value={socialIssue} onChange={(e)=>setSocialIssue(e.target.value)} style={S.input}/>
            </div>
          </div>

          <div style={S.col}>
            <div style={S.card}>
              <div style={S.label}>����T��</div>
              <textarea rows={5} value={keyMessages} onChange={(e)=>setKeyMessages(e.target.value)} style={S.textarea}/>
              <div style={S.label}>����r�]�r�����j�^</div>
              <input value={keywords} onChange={(e)=>setKeywords(e.target.value)} style={S.input}/>

              <div style={S.row}>
                <div>
                  <div style={S.label}>Hashtag �ƶq</div>
                  <input type="number" min={0} max={15} value={hashtagCount} onChange={(e)=>setHashtagCount(Number(e.target.value)||0)} style={S.input}/>
                </div>
                <div>
                  <div style={S.label}>�����</div>
                  <input type="number" min={1} max={6} value={variants} onChange={(e)=>setVariants(Number(e.target.value)||1)} style={S.input}/>
                </div>
              </div>

              <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:8 }}>
                <span style={S.badge}>���Ÿ��G{useEmoji?"�}":"��"}</span>
                <label style={{display:"inline-flex", alignItems:"center", gap:6, cursor:"pointer"}}>
                  <input type="checkbox" checked={useEmoji} onChange={(e)=>setUseEmoji(e.target.checked)}/>
                  ���\�ϥ� Emoji
                </label>
              </div>
            </div>

            <div style={S.card}>
              <div style={S.label}>�ۭq Prompt�]�i�d�ըϥΤW�����۰ʲ��X�^</div>
              <textarea rows={6} value={customPrompt} onChange={(e)=>setCustomPrompt(e.target.value)} style={S.textarea} placeholder="�Y��g�A�N�л\�W����A�����Φ� Prompt �ͦ�"/>
              <div style={{ display:"flex", gap:10, marginTop:10 }}>
                <button onClick={doPreview} style={S.btnGhost}>�w�� Prompt</button>
                <button onClick={()=>copyToClipboard(builtPrompt)} style={S.btnGhost}>�ƻs Prompt</button>
              </div>
              {preview && (
                <div style={{...S.output, marginTop:10}}>{preview}</div>
              )}
            </div>
          </div>
        </div>

        {/* �ʧ@ / ��X */}
        <div style={{ display:"flex", gap:12, marginTop:16 }}>
          <button onClick={handleGenerate} disabled={loading || !apiKey} style={{...S.btn, opacity: (loading||!apiKey)?0.6:1}}>
            {loading ? "�ͦ����K" : "�ͦ����"}
          </button>
          <button onClick={()=>copyToClipboard(output)} disabled={!output} style={{...S.btnGhost, opacity: output?1:0.6}}>�ƻs��X</button>
        </div>

        <div style={{...S.card, marginTop:16}}>
          <div style={{...S.label, marginBottom:8}}>��X</div>
          <div style={S.output}>{output || "�]�ͦ����e�|�X�{�b�o�̡^"}</div>
        </div>
      </div>
    </div>
  );
}
