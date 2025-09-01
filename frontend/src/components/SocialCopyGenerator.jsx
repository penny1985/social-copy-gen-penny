import React, { useMemo, useState, useEffect } from "react";

/** 純前端 Prompt Builder（手機優化、名詞解釋、原型預設、單選規則、平台篇幅選單、主題欄位 + 來源素材改寫） */
const BRAND_BYLINE = "陳沛孺《用AI打造素人影響力》作者";

/* =============================== 內嵌 CSS =============================== */
const CSS = `
:root{
  --bg:#F4EEDF; --green:#1B6B4B; --gold:#8A7A3F;
  --ink:#1a1a1a; --line:#E4D8A8; --muted:#666;
}
*{box-sizing:border-box}
.builder{font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Noto Sans",Arial;color:var(--ink)}
.container{max-width:1120px;margin:0 auto;padding:24px 16px 120px}
.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;gap:10px}
.h1{font-size:22px;font-weight:800;margin:0}
.sub{opacity:.7;font-size:13px}
.modeBtn{padding:8px 12px;border-radius:10px;border:1px solid var(--gold);background:var(--green);color:#fff;font-weight:700;cursor:pointer}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:10px}
.col{display:flex;flex-direction:column;gap:12px}
.card{border:1px solid var(--line);border-radius:12px;padding:16px;background:#fff}
.labelRow{display:flex;align-items:center;gap:8px;margin-bottom:6px}
.label{font-size:13px;opacity:.9}
.info{opacity:.7;font-size:12px}
.input,.select,.textarea{width:100%;padding:10px 12px;border-radius:8px;border:1px solid #ddd;font-size:15px;background:#fff}
.textarea{resize:vertical}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.row3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
.output{width:100%;min-height:260px;white-space:pre-wrap;border:1px solid #ddd;border-radius:12px;padding:12px;background:#fafafa;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px}

/* chips（仍保留活動情境多選） */
.chips{display:flex;flex-wrap:wrap;gap:8px}
.chip{border:1px solid #ddd;background:#fff;border-radius:999px;padding:8px 12px;font-size:14px;cursor:pointer;user-select:none;line-height:1}
.chip[aria-pressed="true"]{background:#e9f3ee;border-color:var(--green);color:var(--green);font-weight:700}

/* slider row */
.sliderRow{display:grid;grid-template-columns:110px 1fr 64px 76px;align-items:center;gap:10px;margin:6px 0}
.sliderRow input[type=range]{height:36px}
.stepBtn{height:36px;border-radius:10px;border:1px solid #ddd;background:#fff;cursor:pointer}
.badge{display:inline-block;padding:2px 8px;border-radius:999px;border:1px solid #ddd;font-size:12px}

/* popover */
.ipop{position:relative;display:inline-block}
.infoBtn{width:22px;height:22px;border-radius:8px;border:1px solid #ddd;background:#fff;font-size:12px;cursor:pointer;line-height:1}
.pop{position:absolute;z-index:50;top:28px;left:0;max-width:340px;background:#fff;border:1px solid #ddd;border-radius:10px;padding:10px;box-shadow:0 6px 24px rgba(0,0,0,.08)}
.pop h4{margin:0 0 6px 0;font-size:13px}
.pop p,.pop li{font-size:12px;line-height:1.5;color:#333}
.pop ul{padding-left:18px;margin:6px 0}

/* 手機底部操作列：手機顯示、桌機隱藏；含「複製」「回頂」 */
.fabBar{position:fixed;left:0;right:0;bottom:0;background:#fff;border-top:1px solid #e5e5e5;padding:10px 12px;display:flex;gap:10px;justify-content:space-between}
.fabBar .btn,.fabBar .ghost{flex:1;height:48px;border-radius:12px;border:1px solid var(--gold);background:var(--green);color:#fff;font-weight:800}
.fabBar .ghost{border-color:#ddd;background:#fff;color:#333}
.fabBar .btn[disabled]{opacity:.5;cursor:not-allowed}
@media (min-width:769px){ .fabBar{display:none} } /* 桌機不顯示整條底欄 */

/* 桌機懸浮回頂小鈕（右側） */
.floatTop{position:fixed;right:16px;bottom:20px;width:42px;height:42px;border-radius:50%;border:1px solid #ddd;background:#fff;box-shadow:0 4px 16px rgba(0,0,0,.1);cursor:pointer;display:none}
.floatTop span{display:block;text-align:center;line-height:42px;font-size:18px}
@media (min-width:769px){ .floatTop{display:block} } /* 只在桌機顯示 */

@media (max-width:768px){
  .grid{grid-template-columns:1fr}
  .row2,.row3{grid-template-columns:1fr}
}
`;

/* ============================= 常數與選項 ============================== */
const PLATFORMS = ["Facebook", "Instagram", "LinkedIn", "X(Twitter)", "TikTok", "LINE OA"];
const PLATFORM_LIMITS = { "Facebook": 63000, "Instagram": 2200, "LinkedIn": 3000, "X(Twitter)": 280, "TikTok": 2200, "LINE OA": 5000 };

/* 平台對應「篇幅」選單（短/中/長） */
const LENGTH_PRESETS = {
  "Facebook": [
    "短（120–200字）","中（300–600字）","長（800–1500字）"
  ],
  "Instagram": [
    "短（80–140字）","中（150–300字）","長（500–1000字）"
  ],
  "LinkedIn": [
    "短（140–250字）","中（300–800字）","長（1200–2000字）"
  ],
  "X(Twitter)": [
    "短（70–120字）","中（140–220字）","長（240–280字）"
  ],
  "TikTok": [
    "短（80–120字）","中（150–300字）","長（400–600字）"
  ],
  "LINE OA": [
    "短（80–120字）","中（150–300字）","長（400–800字）"
  ]
};

const FRAMEWORKS = ["AIDA", "PAS", "BAB", "FAB", "StoryBrand", "4U"]; // 單選
const HOOKS = ["數據型", "提問型", "故事型", "反直覺", "清單句"]; // 單選
const FUNNEL = ["TOFU","MOFU","BOFU"];
const AWARENESS = ["不知情","問題覺察","解法覺察","產品覺察","最覺察"];
const PERSONS = ["你/妳/您/貴公司","我（第一人稱）","他/她（故事敘述）"]; // 單選

/* 在地化下拉（含「歐美」，去除 Easter/Back to School） */
const DIALECT_OPTS = ["台灣","香港","日本","歐美"];
const FESTIVAL_OPTS = [
  "台灣—農曆新年","台灣—端午節","台灣—中秋節","台灣—七夕","台灣—雙11","台灣—雙12",
  "日本—白色情人節","日本—黃金週","日本—七夕(7/7)","日本—お盆","日本—聖誕",
  "歐美—Valentine’s Day","歐美—Black Friday","歐美—Cyber Monday","歐美—Halloween","歐美—Christmas","歐美—New Year"
];
const EMOJI_OPTS = ["台灣常用","日系顏文字","歐美極簡","不使用"];

/* 活動情境（多選 chips） */
const SCENARIOS = ["新品上市","限時促銷","節慶行銷","會員專屬活動","實體活動/講座/展會","UGC 徵件","品牌週年/里程碑","案例/見證分享","教育型貼文","互動問答/投票","合作聯名","公益/CSR 活動","自訂","無"];

/* 品牌原型（中文顯示、最多 2 個）+ 更鮮明預設滑桿 */
const ARCHETYPES = [
  ["Innocent","純真者"],["Everyman","平凡人"],["Hero","英雄"],["Rebel/Outlaw","反叛者"],
  ["Explorer","探索者"],["Creator","創造者"],["Ruler","領導者"],["Magician","魔法師"],
  ["Lover","愛人"],["Caregiver","守護者"],["Jester","小丑"],["Sage","智者"]
];
const ARCH_PRESET = {
  "純真者": { 專業度:45, 溫度:90, 幽默感:35, 權威性:20, 活潑度:60, 緊迫感:15, 故事感:65, 說服力:55 },
  "平凡人": { 專業度:50, 溫度:80, 幽默感:50, 權威性:35, 活潑度:55, 緊迫感:25, 故事感:50, 說服力:55 },
  "英雄":   { 專業度:80, 溫度:60, 幽默感:15, 權威性:85, 活潑度:60, 緊迫感:80, 故事感:70, 說服力:90 },
  "反叛者": { 專業度:50, 溫度:50, 幽默感:45, 權威性:30, 活潑度:80, 緊迫感:85, 故事感:80, 說服力:75 },
  "探索者": { 專業度:60, 溫度:55, 幽默感:30, 權威性:40, 活潑度:70, 緊迫感:45, 故事感:85, 說服力:65 },
  "創造者": { 專業度:65, 溫度:60, 幽默感:30, 權威性:35, 活潑度:60, 緊迫感:35, 故事感:90, 說服力:70 },
  "領導者": { 專業度:90, 溫度:45, 幽默感:5,  權威性:95, 活潑度:25, 緊迫感:50, 故事感:35, 說服力:90 },
  "魔法師": { 專業度:65, 溫度:60, 幽默感:25, 權威性:60, 活潑度:55, 緊迫感:45, 故事感:90, 說服力:80 },
  "愛人":   { 專業度:45, 溫度:95, 幽默感:25, 權威性:30, 活潑度:55, 緊迫感:35, 故事感:70, 說服力:80 },
  "守護者": { 專業度:65, 溫度:95, 幽默感:20, 權威性:55, 活潑度:35, 緊迫感:30, 故事感:65, 說服力:75 },
  "小丑":   { 專業度:35, 溫度:75, 幽默感:95, 權威性:10, 活潑度:95, 緊迫感:30, 故事感:70, 說服力:60 },
  "智者":   { 專業度:95, 溫度:50, 幽默感:5,  權威性:85, 活潑度:20, 緊迫感:20, 故事感:45, 說服力:85 },
};

/* ============================== 小工具元件 ============================== */
function mapLevel(v){ return v<=33?"低":v<=66?"中":"高"; }

function Chips({options, value=[], onChange}) {
  function toggle(item){
    const s = new Set(value);
    s.has(item) ? s.delete(item) : s.add(item);
    onChange(Array.from(s));
  }
  return (
    <div className="chips" role="group">
      {options.map(opt=>(
        <button type="button" key={opt} className="chip"
          aria-pressed={value.includes(opt)}
          onClick={()=>toggle(opt)}>{opt}</button>
      ))}
    </div>
  );
}

function SliderRow({label, value, setValue, min=0, max=100, step=1, suffix=""}) {
  const inc = (d)=> setValue(Math.max(min, Math.min(max, value + d)));
  return (
    <div className="sliderRow">
      <span>{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e=>setValue(Number(e.target.value))}/>
      <button className="stepBtn" onClick={()=>inc(-5)}>-5</button>
      <div className="badge">{mapLevel(value)}（{value}{suffix}）</div>
    </div>
  );
}

function InfoPopover({title, children}) {
  const [open,setOpen]=useState(false);
  return (
    <span className="ipop">
      <button className="infoBtn" onClick={()=>setOpen(o=>!o)} aria-expanded={open} title={title}>ⓘ</button>
      {open && <div className="pop"><h4>{title}</h4><div>{children}</div></div>}
    </span>
  );
}

/* ================================ 主元件 ================================ */
export default function SocialCopyGenerator(){
  const [simpleMode, setSimpleMode] = useState(true);
  const [prompt, setPrompt] = useState(""); // 預設空白

  /* 1. 目標與情境 */
  const [goal, setGoal] = useState("");
  const [funnel, setFunnel] = useState("");
  const [topic, setTopic] = useState(""); // ✅ 新增：這篇文章要講什麼（書/禮物/餐廳…）
  const [scenarios, setScenarios] = useState([]);
  const [deadline, setDeadline] = useState("");
  const [qtyLimit, setQtyLimit] = useState("");

  /* 來源素材（使用者貼文 → 改寫） */
  const [sourceText, setSourceText] = useState("");        // ✅ 新增
  const [rewriteStrict, setRewriteStrict] = useState(70);  // ✅ 新增：改寫幅度（保留事實、重寫語句）

  /* 2. 受眾精細化 */
  const [awareness, setAwareness] = useState("");
  const [pains, setPains] = useState(["","",""]);
  const [person, setPerson] = useState(""); // 單選
  const [colloquial, setColloquial] = useState(55);
  const [dialect, setDialect] = useState("");
  const [festival, setFestival] = useState("");
  const [emojiStyle, setEmojiStyle] = useState("");
  const [audience, setAudience] = useState("");

  /* 3. 品牌風格 */
  const [brandName, setBrandName] = useState("");
  const [slogan, setSlogan] = useState("");
  const [positioning, setPositioning] = useState("");
  const [proofPoints, setProofPoints] = useState("");
  const [noWords, setNoWords] = useState("唯一, 保證");
  const [archetypes, setArchetypes] = useState([]); // 中文名，最多 2
  const [followArch, setFollowArch] = useState(true);
  const [style, setStyle] = useState({ 專業度:70, 溫度:70, 幽默感:30, 權威性:60, 活潑度:40, 緊迫感:30, 故事感:60, 說服力:70 });

  /* 4. 平台規格 + 篇幅選單（依平台） */
  const [platform, setPlatform] = useState("Instagram");
  const platformLimit = PLATFORM_LIMITS[platform];
  const platformNote = `平台：${platform}（建議不超過 ${platformLimit} 字；僅提醒，不會自動截斷）`;
  const lengthOptions = LENGTH_PRESETS[platform] || ["中（120–200字）"];
  const [lengthSpec, setLengthSpec] = useState(lengthOptions[1] || lengthOptions[0]); // 預設「中」

  /* 5. 內容結構（單選） */
  const [framework, setFramework] = useState("AIDA");
  const [hook, setHook] = useState("提問型");
  const [evidence, setEvidence] = useState({數據:"",案例:"",見證:"",媒體背書:""});
  const [benefitRatio, setBenefitRatio] = useState(70);
  const [ctaStrength, setCtaStrength] = useState("中性");
  const [tone, setTone] = useState("溫暖、專業、優雅"); // 本次貼文微調

  /* 7. SEO */
  const [mainKw, setMainKw] = useState("");
  const [secKw, setSecKw] = useState("");

  /* 8. 法遵（預設全不選） */
  const [compliance, setCompliance] = useState({醫療:false,財務:false,保健品:false,未成年:false});
  const [claims, setClaims] = useState({比較:false,功效:false}); // 預設關

  /* 9. 實驗與變體（無差異軸） */
  const [variants, setVariants] = useState(3);
  const [creativity, setCreativity] = useState(50);
  const [titleTest, setTitleTest] = useState("短/中/長各一");

  function setPain(i,v){ const a=[...pains]; a[i]=v; setPains(a); }
  function toggleObj(obj,key,setter){ setter({...obj,[key]:!obj[key]}); }

  /* ===== 原型 → 滑桿自動預設（最多 2 個；平均合成） ===== */
  useEffect(()=>{
    if(!followArch) return;
    if(archetypes.length===0) return;
    const keys = Object.keys(style);
    const acc = {};
    keys.forEach(k=>acc[k]=0);
    archetypes.slice(0,2).forEach(name=>{
      const preset = ARCH_PRESET[name];
      keys.forEach(k=>{ acc[k] += (preset?.[k] ?? 50); });
    });
    keys.forEach(k=>{ acc[k] = Math.round(acc[k] / archetypes.length); });
    setStyle(acc);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [archetypes, followArch]);

  function onManualStyleChange(k, v){
    setStyle({...style, [k]: v});
    if(followArch) setFollowArch(false); // 手動即關閉跟隨
  }

  /* 平台改變時，更新篇幅選單的預設值（取中） */
  useEffect(()=>{
    const opts = LENGTH_PRESETS[platform] || [];
    if(opts.length && !opts.includes(lengthSpec)){
      setLengthSpec(opts[1] || opts[0]);
    }
  }, [platform]);

  /* =============================== Prompt 產生 =============================== */
  function mapLevelText() {
    return Object.entries(style).map(([k,v])=>`${k}:${mapLevel(v)}(${v})`).join("、");
  }

  function buildPromptNow(){
    const sections = [];

    // 任務 + 實驗
    const mission = [];
    if(variants){ mission.push(`請依下列條件，撰寫社群貼文文案（產出 ${variants} 則變體；創意幅度：${mapLevel(creativity)}）。`); }
    if(mission.length) sections.push(["# 任務", mission]);

    // 1 目標與情境（含主題）
    const s1 = [];
    if(goal) s1.push(`轉換目標：${goal}`);
    if(funnel) s1.push(`漏斗位置：${funnel}`);
    if(topic) s1.push(`主題/主打內容：${topic}`);
    if(scenarios.length) s1.push(`活動情境：${scenarios.join("、")}`);
    if(deadline) s1.push(`時效性：截止日 ${deadline}`);
    if(qtyLimit) s1.push(`時效性：限量 ${qtyLimit}，可適度插入「限時/限量」。`);
    if(s1.length) sections.push(["\n# 目標與情境", s1]);

    // ✅ 來源素材（原文 → 改寫）
    if(sourceText && sourceText.trim()){
      const guide = [
        `改寫規則：在不抄襲的前提下，依本任務所有參數重寫；可重組段落／改寫語句／補上銜接，保留可驗證的事實、數據與專有名詞；移除個資與敏感資訊。`,
        `改寫幅度：${rewriteStrict}%（數值越高，語句與結構改動越大；仍需維持原文重點與事實正確）。`,
        `如來源素材不足以支撐所選框架的段落，請以「（示例）」標示補充處，避免杜撰。`,
      ];
      sections.push(["\n# 來源素材（供改寫使用）", guide.concat([
        "＜原文開始＞",
        sourceText.trim(),
        "＜原文結束＞",
      ])]);
    }

    // 2 受眾
    const s2 = [];
    if(audience) s2.push(`受眾描述：${audience}`);
    if(awareness) s2.push(`受眾成熟度：${awareness}`);
    if(person) s2.push(`人稱：${person}`);
    s2.push(`口語度：${mapLevel(colloquial)}(${colloquial})`);
    const ps = pains.filter(Boolean);
    if(ps.length) s2.push(`痛點/渴望：${ps.join("；")}`);
    if(dialect || festival || emojiStyle){
      const locBits = [];
      if(dialect) locBits.push(`量詞與語感：${dialect}`);
      if(festival) locBits.push(`節慶：${festival}`);
      if(emojiStyle) locBits.push(`Emoji 習慣：${emojiStyle}`);
      if(locBits.length) s2.push(`在地化注意事項：${locBits.join("；")}`);
    }
    if(s2.filter(Boolean).length) sections.push(["\n# 受眾", s2]);

    // 3 品牌風格
    const s3 = [];
    if(brandName) s3.push(`品牌：${brandName}`);
    if(slogan) s3.push(`Slogan/主張：${slogan}`);
    if(positioning) s3.push(`定位：${positioning}`);
    if(proofPoints) s3.push(`證據點：${proofPoints}`);
    if(archetypes.length) s3.push(`品牌原型：${archetypes.join("、")}`);
    const styleTxt = mapLevelText();
    if(styleTxt) s3.push(`風格：${styleTxt}`);
    if(noWords && noWords.trim()) s3.push(`禁語清單：${noWords}`);
    if(s3.length) sections.push(["\n# 品牌風格", s3]);

    // 4 平台規格（含篇幅選單）
    const s4 = [];
    if(platform) s4.push(`平台：${platform}（建議不超過 ${platformLimit} 字；僅提醒，不會自動截斷）`);
    if(lengthSpec) s4.push(`篇幅：${lengthSpec}`);
    if(s4.length) sections.push(["\n# 平台規格", s4]);

    // 5 內容結構
    const s5 = [];
    if(framework) s5.push(`框架：${framework}`);
    if(hook) s5.push(`鉤子類型：${hook}`);
    const ev = Object.entries(evidence).filter(([,v])=>v && v.trim()).map(([k,v])=>`${k}：${v.trim()}`);
    if(ev.length) s5.push(`證據模塊（由使用者提供，需真實）：${ev.join("；")}`);
    s5.push(`益處/功能比例：${benefitRatio}:${100-benefitRatio}`);
    if(ctaStrength) s5.push(`CTA 強度：${ctaStrength}`);
    if(mainKw || secKw) s5.push(`SEO：${mainKw?`主關鍵字「${mainKw}」`:""}${mainKw&&secKw?"；":""}${secKw?`次關鍵字「${secKw}」`:""}（文首 140 字內前置）`);
    if(tone) s5.push(`語氣（本次微調）：${tone}`);
    if(s5.filter(Boolean).length) sections.push(["\n# 內容結構", s5]);

    // 8 法遵（預設全不選）
    const s8 = [];
    const compOn = Object.entries(compliance).filter(([,v])=>v).map(([k])=>k);
    if(compOn.length) s8.push(`產業規範注意：${compOn.join("、")}（必要時加註免責/避免醫療或財務建議）。`);
    s8.push(`宣稱開關：比較=${claims.比較?"開":"關"}；功效=${claims.功效?"開":"關"}（預設關）。`);
    if(s8.filter(Boolean).length) sections.push(["\n# 法遵與風險控管", s8]);

    if(!sections.length) return ""; // 全空則維持空白

    const outFmt = [
      "- 產出貼文以 \"---\" 分隔。",
      "- 每則包含：標題、開頭鉤子、內文（依所選框架）、Hashtags（依比例分佈）。",
      "- 若有「來源素材」，必須以其為主體進行改寫（避免逐句同義改寫造成抄襲相似度過高），保留可驗證事實並加強結構與CTA。",
      "- 嚴禁違法與禁語；無法驗證的證據請標示為「示例」或移除。"
    ];
    sections.push(["\n# 輸出格式", outFmt]);

    const lines = [];
    sections.forEach(([title, arr])=>{
      if(arr.length){
        lines.push(title);
        arr.forEach(l=>lines.push(l));
      }
    });
    return lines.join("\n");
  }

  function handleGenerate(){ setPrompt(buildPromptNow()); }
  function handleCopy(){ if(prompt) navigator.clipboard?.writeText(prompt); }

  return (
    <div className="builder">
      <style>{CSS}</style>
      <div className="container">
        <div className="header">
          <div>
            <h1 className="h1">社群文案 Prompt Builder</h1>
            <div className="sub">{BRAND_BYLINE}｜綠金米配色・純前端・可複製</div>
          </div>
          <button className="modeBtn" onClick={()=>setSimpleMode(!simpleMode)}>
            {simpleMode ? "⚡ 進階模式" : "↩︎ 簡易模式"}
          </button>
        </div>

        {/* 簡易模式 */}
        {simpleMode ? (
          <div className="grid">
            <div className="col">
              <div className="card">
                <div className="labelRow"><span className="label">品牌名稱</span></div>
                <input className="input" value={brandName} onChange={e=>setBrandName(e.target.value)} placeholder="你的品牌"/>

                <div className="labelRow"><span className="label">主題/主打內容</span></div>
                <input className="input" value={topic} onChange={e=>setTopic(e.target.value)} placeholder="這篇文章主要在講什麼？例如：新書推薦、禮物清單、餐廳介紹"/>

                {/* ✅ 新增：來源素材（貼原文就能改寫） */}
                <div className="labelRow">
                  <span className="label">來源素材（貼上原文，可選）</span>
                  <InfoPopover title="如何使用？">
                    <p>把你想改寫的文章貼進來；系統會依你設定的品牌/框架/平台等參數重寫。</p>
                    <p>下方可調整「改寫幅度」：越高表示語句與結構改動越大，但會保留事實。</p>
                  </InfoPopover>
                </div>
                <textarea className="textarea" rows={8} value={sourceText} onChange={e=>setSourceText(e.target.value)} placeholder="在這裡貼上你的文章（可包含重點、段落、數據、引文來源等）"/>
                <div style={{marginTop:8}}>
                  <SliderRow label="改寫幅度" value={rewriteStrict} setValue={setRewriteStrict}/>
                </div>

                <div className="labelRow"><span className="label">受眾描述</span></div>
                <input className="input" value={audience} onChange={e=>setAudience(e.target.value)} placeholder="例：25–40 歲、注重效率與質感"/>

                <div className="row2">
                  <div>
                    <div className="labelRow"><span className="label">平台</span></div>
                    <select className="select" value={platform} onChange={e=>setPlatform(e.target.value)}>
                      {PLATFORMS.map(p=><option key={p} value={p}>{p}</option>)}
                    </select>
                    <div className="info" style={{marginTop:6}}>{platformNote}</div>
                  </div>
                  <div>
                    <div className="labelRow"><span className="label">篇幅（依平台）</span></div>
                    <select className="select" value={lengthSpec} onChange={e=>setLengthSpec(e.target.value)}>
                      {lengthOptions.map(opt=><option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>

                <div className="row2">
                  <div>
                    <div className="labelRow"><span className="label">框架</span></div>
                    <select className="select" value={framework} onChange={e=>setFramework(e.target.value)}>
                      {FRAMEWORKS.map(f=><option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <div className="labelRow"><span className="label">鉤子</span></div>
                    <select className="select" value={hook} onChange={e=>setHook(e.target.value)}>
                      {HOOKS.map(h=><option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                </div>

                <div className="row2">
                  <div>
                    <div className="labelRow"><span className="label">CTA 強度</span></div>
                    <select className="select" value={ctaStrength} onChange={e=>setCtaStrength(e.target.value)}>{["柔和","中性","強烈"].map(x=><option key={x}>{x}</option>)}</select>
                  </div>
                  <div>
                    <div className="labelRow"><span className="label">語氣（本次微調）</span></div>
                    <input className="input" value={tone} onChange={e=>setTone(e.target.value)} placeholder="例：溫暖、專業、優雅"/>
                  </div>
                </div>

              </div>
            </div>

            <div className="col">
              <div className="card">
                <div style={{display:"flex",gap:10,marginBottom:8}}>
                  <button className="modeBtn" onClick={handleGenerate} style={{background: "#1B6B4B"}}>產生 Prompt</button>
                  <button className="modeBtn" onClick={handleCopy} disabled={!prompt} style={{background:"#fff",color:"#333",border:"1px solid #ddd"}}>複製 Prompt</button>
                </div>
                <div className="output">{prompt}</div>
              </div>
            </div>
          </div>
        ) : (
          /* 進階模式（預設摺疊） */
          <div className="adv">
            {/* 1 目標與情境 */}
            <details className="card">
              <summary><b>1) 目標與情境</b></summary>
              <div className="row3" style={{marginTop:8}}>
                <div>
                  <div className="labelRow"><span className="label">轉換目標</span></div>
                  <select className="select" value={goal} onChange={e=>setGoal(e.target.value)}>
                    {["曝光","點擊","私訊","報名","加入社群","留資","加購"].map(x=><option key={x}>{x}</option>)}
                  </select>
                </div>
                <div>
                  <div className="labelRow">
                    <span className="label">漏斗位置</span>
                    <InfoPopover title="漏斗位置（TOFU/MOFU/BOFU）">
                      <p><b>TOFU</b>：認知階段，提升品牌認知；常用教育/趣味/分享型內容。</p>
                      <p><b>MOFU</b>：比較階段，強調差異化、案例、FAQ。</p>
                      <p><b>BOFU</b>：轉換階段，明確 CTA + 稀缺感，驅動購買。</p>
                      <p class="info">⚠️ 漏斗定位錯誤會導致文案調性偏差、降低轉換率。</p>
                    </InfoPopover>
                  </div>
                  <select className="select" value={funnel} onChange={e=>setFunnel(e.target.value)}>{FUNNEL.map(x=><option key={x}>{x}</option>)}</select>
                </div>
                <div>
                  <div className="labelRow"><span className="label">截止日</span></div>
                  <input type="date" className="input" value={deadline} onChange={e=>setDeadline(e.target.value)}/>
                </div>
              </div>

              <div className="row2" style={{marginTop:8}}>
                <div>
                  <div className="labelRow"><span className="label">主題/主打內容</span></div>
                  <input className="input" value={topic} onChange={e=>setTopic(e.target.value)} placeholder="這篇文章主要在講什麼？例如：新書推薦、禮物清單、餐廳介紹"/>
                </div>
                <div>
                  <div className="labelRow"><span className="label">活動情境（多選）</span></div>
                  <Chips options={SCENARIOS} value={scenarios} onChange={setScenarios}/>
                </div>
              </div>

              <div className="row3" style={{marginTop:8}}>
                <div>
                  <div className="labelRow"><span className="label">限量（數量）</span></div>
                  <input className="input" value={qtyLimit} onChange={e=>setQtyLimit(e.target.value)} placeholder="例：100 組"/>
                </div>
                <div>
                  <div className="labelRow"><span className="label">平台</span></div>
                  <select className="select" value={platform} onChange={e=>setPlatform(e.target.value)}>{PLATFORMS.map(p=><option key={p}>{p}</option>)}</select>
                  <div className="info" style={{marginTop:6}}>{platformNote}</div>
                </div>
                <div>
                  <div className="labelRow"><span className="label">篇幅（依平台）</span></div>
                  <select className="select" value={lengthSpec} onChange={e=>setLengthSpec(e.target.value)}>
                    {lengthOptions.map(opt=><option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>
            </details>

            {/* 2 受眾精細化 */}
            <details className="card">
              <summary><b>2) 受眾精細化</b></summary>
              <div className="row3" style={{marginTop:8}}>
                <div>
                  <div className="labelRow"><span className="label">成熟度</span></div>
                  <select className="select" value={awareness} onChange={e=>setAwareness(e.target.value)}>{AWARENESS.map(x=><option key={x}>{x}</option>)}</select>
                  <div style={{marginTop:10}}>
                    <SliderRow label="口語度" value={colloquial} setValue={setColloquial}/>
                  </div>
                </div>

                <div>
                  <div className="labelRow"><span className="label">人稱（單選）</span></div>
                  <select className="select" value={person} onChange={e=>setPerson(e.target.value)}>
                    <option value=""></option>
                    {PERSONS.map(x=><option key={x}>{x}</option>)}
                  </select>
                </div>

                <div>
                  <div className="labelRow"><span className="label">受眾描述</span></div>
                  <textarea className="textarea" rows={6} value={audience} onChange={e=>setAudience(e.target.value)} placeholder="受眾輪廓、生活情境、內容偏好..."/>
                </div>
              </div>

              <div className="row3" style={{marginTop:8}}>
                <div>
                  <div className="labelRow">
                    <span className="label">量詞與語感</span>
                    <InfoPopover title="在地化（量詞/語感）">
                      <p>不同地區的語詞使用會影響親近感，例如：</p>
                      <ul><li>台灣：珍奶、便當</li><li>香港：奶茶、飯盒</li><li>日本：カフェ、お弁当</li><li>歐美：boba、to-go</li></ul>
                    </InfoPopover>
                  </div>
                  <select className="select" value={dialect} onChange={e=>setDialect(e.target.value)}>
                    <option value=""></option>
                    {DIALECT_OPTS.map(x=><option key={x}>{x}</option>)}
                  </select>
                </div>
                <div>
                  <div className="labelRow">
                    <span className="label">節慶</span>
                    <InfoPopover title="在地化（節慶）">
                      <p>依市場選常見節慶，確保檔期與語氣對齊。</p>
                    </InfoPopover>
                  </div>
                  <select className="select" value={festival} onChange={e=>setFestival(e.target.value)}>
                    <option value=""></option>
                    {FESTIVAL_OPTS.map(x=><option key={x}>{x}</option>)}
                  </select>
                </div>
                <div>
                  <div className="labelRow">
                    <span className="label">Emoji 習慣</span>
                    <InfoPopover title="在地化（Emoji）">
                      <p>台灣偏多 Emoji（如 😂🤣🙏✨）、日系偏顏文字（(≧▽≦)）、歐美較節制。</p>
                    </InfoPopover>
                  </div>
                  <select className="select" value={emojiStyle} onChange={e=>setEmojiStyle(e.target.value)}>
                    <option value=""></option>
                    {EMOJI_OPTS.map(x=><option key={x}>{x}</option>)}
                  </select>
                </div>
              </div>

              <div className="row2" style={{marginTop:8}}>
                <div>
                  <div className="labelRow"><span className="label">痛點/渴望（1–3）</span></div>
                  {[0,1,2].map(i=><input key={i} className="input" style={{marginBottom:6}} value={pains[i]} onChange={e=>setPain(i,e.target.value)} placeholder={`條目 ${i+1}`}/>)}
                </div>
              </div>
            </details>

            {/* 3 品牌風格 */}
            <details className="card">
              <summary><b>3) 品牌風格</b></summary>
              <div className="row3" style={{marginTop:8}}>
                <div><div className="labelRow"><span className="label">品牌名稱</span></div><input className="input" value={brandName} onChange={e=>setBrandName(e.target.value)}/></div>
                <div><div className="labelRow"><span className="label">Slogan/主張</span></div><input className="input" value={slogan} onChange={e=>setSlogan(e.target.value)}/></div>
                <div><div className="labelRow"><span className="label">定位</span></div><input className="input" value={positioning} onChange={e=>setPositioning(e.target.value)}/></div>
              </div>

              <div className="row2">
                <div>
                  <div className="labelRow">
                    <span className="label">品牌原型（至多 2）</span>
                    <InfoPopover title="品牌原型（12 Archetypes）">
                      <p>用人格角色定義語氣（長期調性）。例如：</p>
                      <ul>
                        <li>創造者：創意靈感、敘事強</li>
                        <li>領導者：權威專業、決策明確</li>
                        <li>小丑：幽默活潑、娛樂性高</li>
                        <li>智者：知識權威、理性說服</li>
                      </ul>
                      <p>可勾選 1–2 個，系統會自動帶入 8 維度預設，你仍可微調。</p>
                    </InfoPopover>
                  </div>
                  <div className="chips" role="group" aria-label="品牌原型">
                    {ARCHETYPES.map(([id,label])=>{
                      const active = archetypes.includes(label);
                      const disabled = !active && archetypes.length>=2;
                      return (
                        <button key={id} type="button"
                          className="chip"
                          aria-pressed={active}
                          disabled={disabled}
                          onClick={()=>{
                            const set = new Set(archetypes);
                            active ? set.delete(label) : set.add(label);
                            setArchetypes(Array.from(set));
                            if(!followArch) setFollowArch(true); // 重新跟隨
                          }}>
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  <label style={{display:"block",marginTop:8,fontSize:13}}>
                    <input type="checkbox" checked={followArch} onChange={()=>setFollowArch(!followArch)}/> 跟隨原型自動設定 8 維滑桿
                  </label>
                </div>

                <div>
                  {Object.keys(style).map(k=>(
                    <SliderRow key={k} label={k} value={style[k]} setValue={(v)=>onManualStyleChange(k,v)}/>
                  ))}
                </div>
              </div>

              <div>
                <div className="labelRow"><span className="label">證據點</span></div>
                <textarea className="textarea" rows={3} value={proofPoints} onChange={e=>setProofPoints(e.target.value)} placeholder="如：第三方檢測、數據、得獎紀錄"/>
              </div>

              <div>
                <div className="labelRow"><span className="label">禁語清單（逗號分隔）</span></div>
                <input className="input" value={noWords} onChange={e=>setNoWords(e.target.value)}/>
              </div>
            </details>

            {/* 4 平台規格 */}
            <details className="card">
              <summary><b>4) 平台規格</b></summary>
              <div className="row3" style={{marginTop:8}}>
                <div>
                  <div className="labelRow"><span className="label">平台</span></div>
                  <select className="select" value={platform} onChange={e=>setPlatform(e.target.value)}>{PLATFORMS.map(p=><option key={p}>{p}</option>)}</select>
                  <div className="info" style={{marginTop:6}}>{platformNote}</div>
                </div>
                <div>
                  <div className="labelRow"><span className="label">篇幅（依平台）</span></div>
                  <select className="select" value={lengthSpec} onChange={e=>setLengthSpec(e.target.value)}>
                    {lengthOptions.map(opt=><option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <div className="labelRow"><span className="label">（選填）Hashtag 提示</span></div>
                  <input className="input" placeholder="例如：品牌:題材:地區 = 2:5:1"/>
                </div>
              </div>
              <div className="info" style={{marginTop:6}}>
                <InfoPopover title="可及性（Accessibility）">
                  <p>提高友善度與可讀性：</p>
                  <ul>
                    <li>字幕/逐字稿（聽障友善）</li>
                    <li>ALT 文字（視障友善）</li>
                    <li>對比色提醒（避免低可讀性）</li>
                  </ul>
                </InfoPopover>
              </div>
            </details>

            {/* 5 內容結構 */}
            <details className="card">
              <summary><b>5) 內容結構</b></summary>
              <div className="row2" style={{marginTop:8}}>
                <div>
                  <div className="labelRow"><span className="label">框架（單選）</span></div>
                  <select className="select" value={framework} onChange={e=>setFramework(e.target.value)}>
                    {FRAMEWORKS.map(f=><option key={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <div className="labelRow"><span className="label">鉤子（單選）</span></div>
                  <select className="select" value={hook} onChange={e=>setHook(e.target.value)}>
                    {HOOKS.map(h=><option key={h}>{h}</option>)}
                  </select>
                </div>
              </div>

              <div className="row2">
                <div>
                  <div className="labelRow"><span className="label">CTA 強度</span></div>
                  <select className="select" value={ctaStrength} onChange={e=>setCtaStrength(e.target.value)}>{["柔和","中性","強烈"].map(x=><option key={x}>{x}</option>)}</select>
                  <div className="labelRow" style={{marginTop:10}}><span className="label">益處 vs 功能</span></div>
                  <SliderRow label="比例（左益處/右功能）" value={benefitRatio} setValue={setBenefitRatio}/>
                </div>
                <div>
                  <div className="labelRow"><span className="label">語氣（本次微調）</span></div>
                  <input className="input" value={tone} onChange={e=>setTone(e.target.value)} placeholder="例：更玩味/更權威/更溫暖"/>
                  <div className="info" style={{marginTop:6}}>說明：<b>品牌風格滑桿</b>＝長期調性；<b>語氣</b>＝本次貼文微調。</div>
                </div>
              </div>

              <div className="row2">
                <div>
                  <div className="labelRow"><span className="label">證據模塊（可填 0–2）</span></div>
                  <textarea className="textarea" rows={3} value={evidence.數據} onChange={e=>setEvidence({...evidence,數據:e.target.value})} placeholder="數據（來源/時間）"/>
                  <textarea className="textarea" rows={3} value={evidence.案例} onChange={e=>setEvidence({...evidence,案例:e.target.value})} placeholder="案例"/>
                </div>
                <div>
                  <div className="labelRow" style={{visibility:"hidden"}}><span className="label">占位</span></div>
                  <textarea className="textarea" rows={3} value={evidence.見證} onChange={e=>setEvidence({...evidence,見證:e.target.value})} placeholder="客戶見證"/>
                  <textarea className="textarea" rows={3} value={evidence.媒體背書} onChange={e=>setEvidence({...evidence,媒體背書:e.target.value})} placeholder="媒體背書"/>
                </div>
              </div>

              <div className="info" style={{marginTop:6}}>
                <InfoPopover title="ALT 文字是什麼？">
                  <p>125 字內的圖片描述，用於 SEO 與視障友善。例：「黑貓戴耳機，在木桌前用筆電工作」。</p>
                </InfoPopover>
              </div>
            </details>

            {/* ✅ 6 來源素材（貼原文 → 改寫） */}
            <details className="card">
              <summary><b>6) 來源素材（貼上原文）</b></summary>
              <div className="labelRow">
                <span className="label">把要改寫的文章貼在這裡</span>
                <InfoPopover title="改寫原則">
                  <p>保留事實、數據與專有名詞；允許重組結構與語句，避免抄襲；不足之處以「（示例）」標示，不要杜撰。</p>
                </InfoPopover>
              </div>
              <textarea className="textarea" rows={10} value={sourceText} onChange={e=>setSourceText(e.target.value)} placeholder="貼上你的文章、逐字稿、重點彙整……"/>
              <div style={{marginTop:8}}>
                <SliderRow label="改寫幅度" value={rewriteStrict} setValue={setRewriteStrict}/>
              </div>
            </details>

            {/* 7 SEO */}
            <details className="card">
              <summary><b>7) SEO / 可發現性</b></summary>
              <div className="row2" style={{marginTop:8}}>
                <div><div className="labelRow"><span className="label">主關鍵字</span></div><input className="input" value={mainKw} onChange={e=>setMainKw(e.target.value)}/></div>
                <div><div className="labelRow"><span className="label">次關鍵字</span></div><input className="input" value={secKw} onChange={e=>setSecKw(e.target.value)}/></div>
              </div>
            </details>

            {/* 8 法遵 */}
            <details className="card">
              <summary><b>8) 法遵與風險控管</b></summary>
              <div className="row3" style={{marginTop:8}}>
                <div>
                  <div className="labelRow"><span className="label">產業規範（預設不勾選）</span></div>
                  {Object.keys(compliance).map(k=>(
                    <label key={k} style={{display:"block",fontSize:13}}>
                      <input type="checkbox" checked={compliance[k]} onChange={()=>toggleObj(compliance,k,setCompliance)}/> {k}
                    </label>
                  ))}
                </div>
                <div>
                  <div className="labelRow"><span className="label">宣稱開關</span></div>
                  {Object.keys(claims).map(k=>(
                    <label key={k} style={{display:"block",fontSize:13}}>
                      <input type="checkbox" checked={claims[k]} onChange={()=>toggleObj(claims,k,setClaims)}/> {k}（預設關）
                    </label>
                  ))}
                </div>
                <div className="info">⚠️ 禁止違反地方法規；如需提及，請以中性敘述並附免責。</div>
              </div>
            </details>

            {/* 9 實驗與變體 */}
            <details className="card">
              <summary><b>9) 實驗與變體</b></summary>
              <div className="row3" style={{marginTop:8}}>
                <div>
                  <div className="labelRow"><span className="label">變體數</span></div>
                  <input type="number" min={2} max={5} className="input" value={variants} onChange={e=>setVariants(Math.min(5,Math.max(2,Number(e.target.value)||2)))}/>
                </div>
                <div>
                  <div className="labelRow"><span className="label">創意幅度</span></div>
                  <SliderRow label="保守↔大膽" value={creativity} setValue={setCreativity}/>
                </div>
                <div>
                  <div className="labelRow"><span className="label">標題長度測試</span></div>
                  <select className="select" value={titleTest} onChange={e=>setTitleTest(e.target.value)}>
                    {["短","中","長","短/中/長各一"].map(x=><option key={x}>{x}</option>)}
                  </select>
                </div>
              </div>
            </details>

            {/* 預覽：產生/複製 */}
            <div className="card">
              <div style={{display:"flex",gap:10,marginBottom:8}}>
                <button className="modeBtn" onClick={handleGenerate} style={{background: "#1B6B4B"}}>產生 Prompt</button>
                <button className="modeBtn" onClick={handleCopy} disabled={!prompt} style={{background:"#fff",color:"#333",border:"1px solid #ddd"}}>複製 Prompt</button>
              </div>
              <div className="output">{prompt}</div>
            </div>
          </div>
        )}
      </div>

      {/* 手機：底部固定操作列 */}
      <div className="fabBar" aria-label="mobile actions" role="group">
        <button className="btn" onClick={handleCopy} disabled={!prompt}>複製 Prompt</button>
        <button className="ghost" onClick={()=>window.scrollTo({top:0,behavior:"smooth"})}>回到頂端</button>
      </div>

      {/* 桌機：懸浮回頂小鈕 */}
      <button className="floatTop" onClick={()=>window.scrollTo({top:0,behavior:"smooth"})} title="回到頂端" aria-label="回到頂端">
        <span>↑</span>
      </button>
    </div>
  );
}
