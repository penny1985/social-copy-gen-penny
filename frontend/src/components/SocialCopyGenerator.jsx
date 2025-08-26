import React, { useMemo, useState } from "react";

/** 純前端 Prompt Builder（無模型串接、無生成）— 行動優化 + Chips */
const BRAND_BYLINE = "陳沛孺《用AI打造素人影響力》作者";

/* 內嵌 CSS（支援 media queries、chips、固定底欄） */
const CSS = `
:root{
  --bg:#F4EEDF; --green:#1B6B4B; --gold:#8A7A3F;
  --ink:#1a1a1a; --line:#E4D8A8; --muted:#666;
}
*{box-sizing:border-box}
body{background:var(--bg)}
.builder{font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Noto Sans",Arial;color:var(--ink)}
.container{max-width:1120px;margin:0 auto;padding:24px 16px 96px}
.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
.h1{font-size:22px;font-weight:800;margin:0}
.sub{opacity:.7;font-size:13px}
.modeBtn{padding:8px 12px;border-radius:10px;border:1px solid var(--gold);background:var(--green);color:#fff;font-weight:700;cursor:pointer}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:10px}
.col{display:flex;flex-direction:column;gap:12px}
.card{border:1px solid var(--line);border-radius:12px;padding:16px;background:#fff}
.labelRow{display:flex;align-items:center;gap:8px;margin-bottom:6px}
.label{font-size:13px;opacity:.9}
.info{font-size:12px;opacity:.65}
.input,.select,.textarea{width:100%;padding:10px 12px;border-radius:8px;border:1px solid #ddd;font-size:15px;background:#fff}
.textarea{resize:vertical}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.row3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
.output{width:100%;min-height:240px;white-space:pre-wrap;border:1px solid #ddd;border-radius:12px;padding:12px;background:#fafafa;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px}

/* chips */
.chips{display:flex;flex-wrap:wrap;gap:8px}
.chip{border:1px solid #ddd;background:#fff;border-radius:999px;padding:8px 12px;font-size:14px;cursor:pointer;user-select:none;line-height:1}
.chip[aria-pressed="true"]{background:#e9f3ee;border-color:var(--green);color:var(--green);font-weight:700}

/* slider row */
.sliderRow{display:grid;grid-template-columns:110px 1fr 64px 72px;align-items:center;gap:10px;margin:6px 0}
.sliderRow input[type=range]{height:36px}
.stepBtn{height:36px;border-radius:10px;border:1px solid #ddd;background:#fff;cursor:pointer}
.badge{display:inline-block;padding:2px 8px;border-radius:999px;border:1px solid #ddd;font-size:12px}

/* sticky bottom actions (mobile only) */
.fabBar{position:fixed;left:0;right:0;bottom:0;background:#fff;border-top:1px solid #e5e5e5;padding:10px 12px;display:flex;gap:10px;justify-content:space-between}
.fabBar .btn{flex:1;height:48px;border-radius:12px;border:1px solid var(--gold);background:var(--green);color:#fff;font-weight:800}
.fabBar .ghost{flex:1;height:48px;border-radius:12px;border:1px solid #ddd;background:#fff;font-weight:800}

/* responsive */
@media (max-width:768px){
  .grid{grid-template-columns:1fr}
  .row2,.row3{grid-template-columns:1fr}
  .container{padding-bottom:120px} /* 讓底部操作列不擋內容 */
  .header{gap:10px}
}
`;

const PLATFORMS = ["Facebook", "Instagram", "LinkedIn", "X(Twitter)", "TikTok", "LINE OA"];
const PLATFORM_LIMITS = { "Facebook": 63000, "Instagram": 2200, "LinkedIn": 3000, "X(Twitter)": 280, "TikTok": 2200, "LINE OA": 5000 };
const FRAMEWORKS = ["AIDA", "PAS", "BAB", "FAB", "StoryBrand", "4U"];
const HOOKS = ["數據型", "提問型", "故事型", "反直覺", "清單句"];
const ARCHETYPES = ["Innocent","Everyman","Hero","Rebel/Outlaw","Explorer","Creator","Ruler","Magician","Lover","Caregiver","Jester","Sage"];
const PERSONS = ["你/妳/您/貴公司","我（第一人稱）","他/她（故事敘述）"];
const LOCALIZE_ITEMS = ["幣別","量詞與語感","節慶","文化禁忌","Emoji 習慣","自訂"];
const POST_TYPES = ["單圖","輪播","Reels 腳本","LINE OA 群發"];
const FUNNEL = ["TOFU","MOFU","BOFU"];
const AWARENESS = ["不知情","問題覺察","解法覺察","產品覺察","最覺察"];

function mapLevel(v){ return v<=33?"低":v<=66?"中":"高"; }

/* 小元件：Chips 多選 */
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

/* 小元件：±5 微調滑桿 */
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

export default function SocialCopyGenerator(){
  const [simpleMode, setSimpleMode] = useState(true);

  /** 1. 目標與情境 */
  const [goal, setGoal] = useState("曝光");
  const [funnel, setFunnel] = useState("TOFU");
  const [scenarios, setScenarios] = useState([]);
  const [deadline, setDeadline] = useState("");
  const [qtyLimit, setQtyLimit] = useState("");

  /** 2. 受眾精細化 */
  const [awareness, setAwareness] = useState("問題覺察");
  const [pains, setPains] = useState(["","",""]);
  const [persons, setPersons] = useState(["我（第一人稱）"]); // 預設我
  const [colloquial, setColloquial] = useState(55);
  const [localizeSelected, setLocalizeSelected] = useState([]);
  const [localizeCustom, setLocalizeCustom] = useState("");
  const [audience, setAudience] = useState("");

  /** 3. 品牌聲音 & 風格 */
  const [brandName, setBrandName] = useState("");
  const [slogan, setSlogan] = useState("");
  const [positioning, setPositioning] = useState("");
  const [proofPoints, setProofPoints] = useState("");
  const [noWords, setNoWords] = useState("唯一, 保證");
  const [archetype, setArchetype] = useState("Creator");
  const [style, setStyle] = useState({ 專業度:70, 溫度:70, 幽默感:30, 權威性:60, 活潑度:40, 緊迫感:30, 故事感:60, 說服力:70 });

  /** 4. 平台規格 */
  const [platform, setPlatform] = useState("Instagram");
  const platformLimit = PLATFORM_LIMITS[platform];
  const limitTip = `此平台建議不超過 ${platformLimit} 字（僅提醒，不會自動截斷）。`;

  /** 5. 內容結構 */
  const [frameworks, setFrameworks] = useState(["AIDA"]);
  const [hooks, setHooks] = useState(["提問型"]);
  const [evidence, setEvidence] = useState({數據:"",案例:"",見證:"",媒體背書:""});
  const [benefitRatio, setBenefitRatio] = useState(70);
  const [ctaStrength, setCtaStrength] = useState("中性");
  const [lengthSpec, setLengthSpec] = useState("中等（120–200字）");
  const [tone, setTone] = useState("溫暖、專業、優雅");

  /** 6. 視覺聯動 */
  const [postType, setPostType] = useState("輪播");
  const [visualBrief, setVisualBrief] = useState("");
  const [coverMin, setCoverMin] = useState(6);
  const [coverMax, setCoverMax] = useState(10);
  const [altText, setAltText] = useState("");

  /** 7. SEO */
  const [mainKw, setMainKw] = useState("");
  const [secKw, setSecKw] = useState("");

  /** 8. 法遵 */
  const [compliance, setCompliance] = useState({醫療:true,財務:true,保健品:true,性愛:true,未成年:true});
  const [claims, setClaims] = useState({比較:false,功效:false});

  /** 9. 實驗與變體 */
  const [variants, setVariants] = useState(3);
  const [diffAxes, setDiffAxes] = useState(["鉤子","益處排序"]);
  const [creativity, setCreativity] = useState(50);
  const [titleTest, setTitleTest] = useState("短/中/長各一");

  /** 10. 發佈與追蹤 */
  const [publishTime, setPublishTime] = useState("");
  const [utm, setUtm] = useState({來源:"",媒介:"",活動:"",內容:"",關鍵字:""});
  const [shortLink, setShortLink] = useState("");
  const [coupon, setCoupon] = useState("");
  const [cta, setCta] = useState("立即收藏、瞭解更多");

  /** hashtag 策略（比例） */
  const [hashtagRatio, setHashtagRatio] = useState("品牌:題材:地區 = 2:5:1");
  const [hashtagTotal, setHashtagTotal] = useState(6);

  function setPain(i,v){ const a=[...pains]; a[i]=v; setPains(a); }
  function toggleObj(obj,key,setter){ setter({...obj,[key]:!obj[key]}); }

  /** 風格文字 */
  const styleLines = Object.entries(style).map(([k,v])=>`${k}:${mapLevel(v)}(${v})`).join("、");

  /** 在地化描述 */
  const localDesc = useMemo(()=>{
    const base = localizeSelected.join("、");
    return localizeCustom ? (base ? `${base}；自訂：${localizeCustom}` : `自訂：${localizeCustom}`) : base;
  }, [localizeSelected, localizeCustom]);

  /** Prompt 組裝 */
  const builtPrompt = useMemo(()=>{
    const lines = [];
    lines.push(`# 任務`);
    lines.push(`請依下列條件，撰寫社群貼文文案（產出 ${variants} 則變體；差異軸：${diffAxes.join("、")}；創意幅度：${mapLevel(creativity)}）。`);

    lines.push(`\n# 目標與情境`);
    lines.push(`轉換目標：${goal}；漏斗位置：${funnel}。`);
    if (scenarios.length) lines.push(`活動情境：${scenarios.join("、")}`);
    if (deadline) lines.push(`時效性：截止日 ${deadline}`);
    if (qtyLimit) lines.push(`時效性：限量 ${qtyLimit}，可適度插入「限時/限量」。`);

    lines.push(`\n# 受眾`);
    lines.push(`受眾描述：${audience || "（你可補充基本輪廓）"}`);
    lines.push(`受眾成熟度：${awareness}；人稱：${persons.join("、")}；口語度：${mapLevel(colloquial)}(${colloquial})。`);
    const ps = pains.filter(Boolean); if (ps.length) lines.push(`痛點/渴望：${ps.join("；")}`);
    if (localDesc) lines.push(`在地化注意事項：${localDesc}`);

    lines.push(`\n# 品牌聲音與風格`);
    lines.push(`品牌：${brandName || "（未指定）"}；Slogan/主張：${slogan || "（未指定）"}；定位：${positioning || "（未指定）"}`);
    if (proofPoints) lines.push(`證據點：${proofPoints}`);
    lines.push(`品牌原型：${archetype}；風格：${styleLines}`);
    if (noWords.trim()) lines.push(`禁語清單：${noWords}`);

    lines.push(`\n# 平台規格`);
    lines.push(`平台：${platform}（建議不超過 ${platformLimit} 字；僅提醒，不會自動截斷）`);
    lines.push(`Hashtag 策略：${hashtagRatio}；總數：${hashtagTotal || "（依平台調整）"}`);

    lines.push(`\n# 內容結構`);
    lines.push(`框架：${frameworks.join("、")}；鉤子類型：${hooks.join("、")}`);
    const ev = Object.entries(evidence).filter(([k,v])=>v && v.trim()).map(([k,v])=>`${k}：${v.trim()}`);
    if (ev.length) lines.push(`證據模塊（由使用者提供，需真實）：${ev.join("；")}`);
    lines.push(`益處/功能比例：${benefitRatio}:${100-benefitRatio}；CTA 強度：${ctaStrength}；篇幅：${lengthSpec}`);
    if (mainKw || secKw) lines.push(`SEO：主關鍵字「${mainKw}」；次關鍵字「${secKw}」（文首 140 字內前置）。`);

    lines.push(`\n# 視覺聯動`);
    lines.push(`貼文型態：${postType}；視覺簡述：${visualBrief || "（未指定）"}`);
    lines.push(`封面鉤子：請產出 ${coverMin}-${coverMax} 字內的封面鉤子；並提供 ALT 文字：${altText || "（圖片描述 125 字內）"}`);

    const compOn = Object.entries(compliance).filter(([,v])=>v).map(([k])=>k);
    if (compOn.length || !claims.比較 || !claims.功效){
      lines.push(`\n# 法遵與風險控管`);
      if (compOn.length) lines.push(`產業規範注意：${compOn.join("、")}（必要時加註免責/避免醫療或財務建議）。`);
      lines.push(`宣稱開關：比較=${claims.比較?"開":"關"}；功效=${claims.功效?"開":"關"}（預設關）。`);
    }

    lines.push(`\n# 實驗與變體`);
    lines.push(`變體數：${variants}；標題長度測試：${titleTest}；差異軸：${diffAxes.join("、")}`);

    lines.push(`\n# 發佈與追蹤`);
    if (publishTime) lines.push(`發佈時段：${publishTime}`);
    const utmFilled = Object.entries(utm).filter(([,v])=>v && v.trim()).map(([k,v])=>`${k}=${v.trim()}`);
    if (utmFilled.length) lines.push(`UTM：${utmFilled.join("&")}`);
    if (shortLink) lines.push(`短網址：${shortLink}`);
    if (coupon) lines.push(`折扣碼：${coupon}`);

    lines.push(`\n# 輸出格式`);
    lines.push(`- 產出 ${variants} 則貼文（以 "---" 分隔）。`);
    lines.push(`- 每則包含：標題、開頭鉤子、內文（依所選框架）、Hashtags（依比例分佈）。`);
    lines.push(`- 語氣：${tone}；CTA：${cta}。`);
    lines.push(`- 嚴禁違法規與禁語；無法驗證的證據請標示為「示例」或移除。`);

    return lines.join("\\n");
  }, [
    goal,funnel,scenarios,deadline,qtyLimit,audience,awareness,persons,colloquial,pains,localDesc,
    brandName,slogan,positioning,proofPoints,noWords,archetype,styleLines,
    platform,hashtagRatio,hashtagTotal,frameworks,hooks,evidence,benefitRatio,ctaStrength,lengthSpec,tone,
    mainKw,secKw,postType,visualBrief,coverMin,coverMax,altText,
    compliance,claims,variants,diffAxes,creativity,titleTest,
    publishTime,utm,shortLink,coupon,cta,platformLimit
  ]);

  const platformNote = `平台：${platform}（建議不超過 ${platformLimit} 字；僅提醒，不會自動截斷）`;

  function copyPrompt(){ navigator.clipboard?.writeText(builtPrompt); }
  function toTop(){ window.scrollTo({top:0,behavior:"smooth"}); }

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

        {/* 簡易模式：手機單欄、桌機雙欄 */}
        {simpleMode ? (
          <div className="grid">
            <div className="col">
              <div className="card">
                <div className="labelRow"><span className="label">品牌名稱</span></div>
                <input className="input" value={brandName} onChange={e=>setBrandName(e.target.value)} placeholder="你的品牌"/>

                <div className="labelRow"><span className="label">受眾描述</span></div>
                <input className="input" value={audience} onChange={e=>setAudience(e.target.value)} placeholder="例：25-40 歲、注重效率與質感"/>

                <div className="row2">
                  <div>
                    <div className="labelRow"><span className="label">平台</span> <span className="info">{limitTip}</span></div>
                    <select className="select" value={platform} onChange={e=>setPlatform(e.target.value)}>
                      {PLATFORMS.map(p=><option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <div className="labelRow"><span className="label">框架</span></div>
                    <select className="select" value={frameworks[0]} onChange={e=>setFrameworks([e.target.value])}>
                      {FRAMEWORKS.map(f=><option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                </div>

                <div className="labelRow"><span className="label">語氣</span></div>
                <input className="input" value={tone} onChange={e=>setTone(e.target.value)} placeholder="例：溫暖、專業、優雅"/>

                <div className="row2">
                  <div>
                    <div className="labelRow"><span className="label">篇幅</span></div>
                    <input className="input" value={lengthSpec} onChange={e=>setLengthSpec(e.target.value)} placeholder="例：中等（120–200字）"/>
                  </div>
                  <div>
                    <div className="labelRow"><span className="label">CTA</span></div>
                    <input className="input" value={cta} onChange={e=>setCta(e.target.value)} placeholder="例：立即收藏、瞭解更多"/>
                  </div>
                </div>
              </div>
            </div>

            <div className="col">
              <div className="card">
                <div className="labelRow"><span className="label">封面鉤子（6–10 字）</span></div>
                <div className="row2">
                  <input type="number" className="input" min={1} value={coverMin} onChange={e=>setCoverMin(Number(e.target.value)||6)}/>
                  <input type="number" className="input" min={1} value={coverMax} onChange={e=>setCoverMax(Number(e.target.value)||10)}/>
                </div>
                <div className="labelRow"><span className="label">ALT 文字（125 字內）</span></div>
                <input className="input" value={altText} onChange={e=>setAltText(e.target.value)} placeholder="例：黑貓戴耳機，在木桌前用筆電工作"/>
              </div>

              <div className="card">
                <div style={{display:"flex",gap:10,marginBottom:8}}>
                  <button className="modeBtn" onClick={copyPrompt} style={{background:"#fff",color:"#333",border:"1px solid #ddd"}}>複製 Prompt</button>
                </div>
                <div className="output">{builtPrompt}</div>
                <div className="info" style={{marginTop:8}}>{platformNote}</div>
              </div>
            </div>
          </div>
        ) : (
          /* 進階模式（全部預設摺疊） */
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
                  <div className="labelRow"><span className="label">漏斗位置</span> <span className="info" title="TOFU=認知、MOFU=比較、BOFU=轉換">ⓘ</span></div>
                  <select className="select" value={funnel} onChange={e=>setFunnel(e.target.value)}>{FUNNEL.map(x=><option key={x}>{x}</option>)}</select>
                </div>
                <div>
                  <div className="labelRow"><span className="label">截止日</span></div>
                  <input type="date" className="input" value={deadline} onChange={e=>setDeadline(e.target.value)}/>
                </div>
              </div>

              <div style={{marginTop:8}}>
                <div className="labelRow"><span className="label">活動情境（多選 Chips）</span></div>
                <Chips
                  options={["新品上市","限時促銷","節慶行銷","會員專屬活動","實體活動/講座/展會","UGC 徵件","品牌週年/里程碑","案例/見證分享","教育型貼文","互動問答/投票","合作聯名","公益/CSR 活動","自訂","無"]}
                  value={scenarios} onChange={setScenarios}/>
              </div>

              <div className="row2" style={{marginTop:8}}>
                <div>
                  <div className="labelRow"><span className="label">限量（數量）</span></div>
                  <input className="input" value={qtyLimit} onChange={e=>setQtyLimit(e.target.value)} placeholder="例：100 組"/>
                </div>
                <div>
                  <div className="labelRow"><span className="label">平台</span> <span className="info">{limitTip}</span></div>
                  <select className="select" value={platform} onChange={e=>setPlatform(e.target.value)}>{PLATFORMS.map(p=><option key={p}>{p}</option>)}</select>
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
                  <div className="labelRow"><span className="label">人稱（多選 Chips）</span></div>
                  <Chips options={PERSONS} value={persons} onChange={setPersons}/>
                </div>

                <div>
                  <div className="labelRow"><span className="label">受眾描述</span></div>
                  <textarea className="textarea" rows={6} value={audience} onChange={e=>setAudience(e.target.value)} placeholder="受眾輪廓、生活情境、內容偏好..."/>
                </div>
              </div>

              <div className="row2" style={{marginTop:8}}>
                <div>
                  <div className="labelRow"><span className="label">痛點/渴望（1–3）</span></div>
                  {[0,1,2].map(i=><input key={i} className="input" style={{marginBottom:6}} value={pains[i]} onChange={e=>setPain(i,e.target.value)} placeholder={`條目 ${i+1}`}/>)}
                </div>
                <div>
                  <div className="labelRow"><span className="label">在地化（多選 Chips）</span></div>
                  <Chips options={LOCALIZE_ITEMS} value={localizeSelected} onChange={setLocalizeSelected}/>
                  <input className="input" style={{marginTop:6}} value={localizeCustom} onChange={e=>setLocalizeCustom(e.target.value)} placeholder="自訂在地化說明"/>
                </div>
              </div>
            </details>

            {/* 3 品牌聲音 & 風格 */}
            <details className="card">
              <summary><b>3) 品牌聲音 & 風格</b></summary>
              <div className="row3" style={{marginTop:8}}>
                <div><div className="labelRow"><span className="label">品牌名稱</span></div><input className="input" value={brandName} onChange={e=>setBrandName(e.target.value)}/></div>
                <div><div className="labelRow"><span className="label">Slogan/主張</span></div><input className="input" value={slogan} onChange={e=>setSlogan(e.target.value)}/></div>
                <div><div className="labelRow"><span className="label">定位</span></div><input className="input" value={positioning} onChange={e=>setPositioning(e.target.value)}/></div>
              </div>
              <div className="row2">
                <div>
                  <div className="labelRow"><span className="label">證據點</span></div>
                  <textarea className="textarea" rows={4} value={proofPoints} onChange={e=>setProofPoints(e.target.value)} placeholder="如：第三方檢測、數據、得獎紀錄"/>
                </div>
                <div>
                  <div className="labelRow"><span className="label">品牌原型</span> <span className="info" title="用人格原型定義語氣，如 Creator=創造力">ⓘ</span></div>
                  <select className="select" value={archetype} onChange={e=>setArchetype(e.target.value)}>{ARCHETYPES.map(x=><option key={x}>{x}</option>)}</select>
                  <div style={{marginTop:10}}>
                    {Object.keys(style).map(k=>(
                      <SliderRow key={k} label={k} value={style[k]} setValue={v=>setStyle({...style,[k]:v})}/>
                    ))}
                  </div>
                </div>
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
                  <div className="labelRow"><span className="label">平台</span> <span className="info">{limitTip}</span></div>
                  <select className="select" value={platform} onChange={e=>setPlatform(e.target.value)}>{PLATFORMS.map(p=><option key={p}>{p}</option>)}</select>
                </div>
                <div>
                  <div className="labelRow"><span className="label">Hashtag 比例</span></div>
                  <input className="input" value={hashtagRatio} onChange={e=>setHashtagRatio(e.target.value)} placeholder="品牌:題材:地區 = 2:5:1"/>
                </div>
                <div>
                  <div className="labelRow"><span className="label">Hashtag 總數（可選）</span></div>
                  <input type="number" min={0} max={20} className="input" value={hashtagTotal} onChange={e=>setHashtagTotal(Number(e.target.value)||0)}/>
                </div>
              </div>
              <div className="info">可及性：字幕/逐字稿、ALT 文字、對比色提醒（輸出說明會提示）</div>
            </details>

            {/* 5 內容結構 */}
            <details className="card">
              <summary><b>5) 內容結構</b></summary>
              <div className="row2" style={{marginTop:8}}>
                <div>
                  <div className="labelRow"><span className="label">框架（多選）</span></div>
                  <Chips options={FRAMEWORKS} value={frameworks} onChange={setFrameworks}/>
                </div>
                <div>
                  <div className="labelRow"><span className="label">鉤子類型（多選）</span></div>
                  <Chips options={HOOKS} value={hooks} onChange={setHooks}/>
                </div>
              </div>
              <div className="row2">
                <div>
                  <div className="labelRow"><span className="label">篇幅</span></div>
                  <input className="input" value={lengthSpec} onChange={e=>setLengthSpec(e.target.value)} placeholder="短/中/長 或字數範圍"/>
                  <div className="labelRow"><span className="label">CTA 強度</span></div>
                  <select className="select" value={ctaStrength} onChange={e=>setCtaStrength(e.target.value)}>{["柔和","中性","強烈"].map(x=><option key={x}>{x}</option>)}</select>
                </div>
                <div>
                  <div className="labelRow"><span className="label">益處 vs 功能</span></div>
                  <SliderRow label="比例（左益處/右功能）" value={benefitRatio} setValue={setBenefitRatio}/>
                </div>
              </div>
              <div className="row2">
                <div>
                  <div className="labelRow"><span className="label">證據模塊（最多 2 條）</span></div>
                  <textarea className="textarea" rows={3} value={evidence.數據} onChange={e=>setEvidence({...evidence,數據:e.target.value})} placeholder="數據（來源/時間）"/>
                  <textarea className="textarea" rows={3} value={evidence.案例} onChange={e=>setEvidence({...evidence,案例:e.target.value})} placeholder="案例"/>
                  <textarea className="textarea" rows={3} value={evidence.見證} onChange={e=>setEvidence({...evidence,見證:e.target.value})} placeholder="客戶見證"/>
                  <textarea className="textarea" rows={3} value={evidence.媒體背書} onChange={e=>setEvidence({...evidence,媒體背書:e.target.value})} placeholder="媒體背書"/>
                </div>
                <div>
                  <div className="labelRow"><span className="label">語氣</span></div>
                  <input className="input" value={tone} onChange={e=>setTone(e.target.value)} placeholder="例：溫暖、專業、優雅"/>
                </div>
              </div>
            </details>

            {/* 6 視覺聯動 */}
            <details className="card">
              <summary><b>6) 視覺聯動</b></summary>
              <div className="row3" style={{marginTop:8}}>
                <div>
                  <div className="labelRow"><span className="label">貼文型態</span></div>
                  <select className="select" value={postType} onChange={e=>setPostType(e.target.value)}>{POST_TYPES.map(x=><option key={x}>{x}</option>)}</select>
                </div>
                <div>
                  <div className="labelRow"><span className="label">封面鉤子字數</span></div>
                  <div className="row2">
                    <input type="number" className="input" min={1} value={coverMin} onChange={e=>setCoverMin(Number(e.target.value)||6)}/>
                    <input type="number" className="input" min={1} value={coverMax} onChange={e=>setCoverMax(Number(e.target.value)||10)}/>
                  </div>
                </div>
                <div>
                  <div className="labelRow"><span className="label">ALT 文字</span> <span className="info" title="125字內圖片描述，用於 SEO 與視障友善">ⓘ</span></div>
                  <input className="input" value={altText} onChange={e=>setAltText(e.target.value)} placeholder="例：黑貓戴耳機，在木桌前用筆電工作"/>
                </div>
              </div>
              <div>
                <div className="labelRow"><span className="label">視覺簡述</span></div>
                <textarea className="textarea" rows={3} value={visualBrief} onChange={e=>setVisualBrief(e.target.value)} placeholder="主畫面焦點、品牌色、留白/安全邊界提醒..."/>
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
                  <div className="labelRow"><span className="label">產業規範（預設勾選）</span></div>
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
                <div className="info">⚠️ 禁止違反地方法規；若需提及，請以中性敘述並附免責。</div>
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
              <div style={{marginTop:8}}>
                <div className="labelRow"><span className="label">差異軸（多選 Chips）</span></div>
                <Chips options={["鉤子","益處排序","CTA","語氣"]} value={diffAxes} onChange={setDiffAxes}/>
              </div>
            </details>

            {/* 10 發佈與追蹤 */}
            <details className="card">
              <summary><b>10) 發佈與追蹤</b></summary>
              <div className="row3" style={{marginTop:8}}>
                <div><div className="labelRow"><span className="label">發佈時段</span></div><input className="input" value={publishTime} onChange={e=>setPublishTime(e.target.value)} placeholder="例：平日 12:00–13:30"/></div>
                <div><div className="labelRow"><span className="label">短網址</span></div><input className="input" value={shortLink} onChange={e=>setShortLink(e.target.value)} placeholder="選填"/></div>
                <div><div className="labelRow"><span className="label">折扣碼</span></div><input className="input" value={coupon} onChange={e=>setCoupon(e.target.value)} placeholder="選填"/></div>
              </div>
              <div className="row3">
                {Object.keys(utm).map(k=>(
                  <div key={k}>
                    <div className="labelRow"><span className="label">UTM：{k}</span></div>
                    <input className="input" value={utm[k]} onChange={e=>setUtm({...utm,[k]:e.target.value})} placeholder={`utm_${k}`}/>
                  </div>
                ))}
              </div>
            </details>

            {/* 預覽 */}
            <div className="card">
              <div style={{display:"flex",gap:10,marginBottom:8}}>
                <button className="modeBtn" onClick={copyPrompt} style={{background:"#fff",color:"#333",border:"1px solid #ddd"}}>複製 Prompt</button>
              </div>
              <div className="output">{builtPrompt}</div>
              <div className="info" style={{marginTop:8}}>{platformNote}</div>
            </div>
          </div>
        )}
      </div>

      {/* 手機底部固定操作列 */}
      <div className="fabBar" aria-label="mobile actions" role="group">
        <button className="btn" onClick={copyPrompt}>複製 Prompt</button>
        <button className="ghost" onClick={toTop}>回到頂端</button>
      </div>
    </div>
  );
}
