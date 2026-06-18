import { useState, useRef } from "react";

const LIKERT = { it: ["Fortemente in disaccordo","In disaccordo","Neutro","D'accordo","Fortemente d'accordo"], en: ["Strongly disagree","Disagree","Neutral","Agree","Strongly agree"] };
const FREQ = { it: ["Mai","Raramente","A volte","Spesso","Molto spesso"], en: ["Never","Rarely","Sometimes","Often","Very often"] };
const KNOW = { it: ["Nessuna","Base","Discreta","Buona","Esperta"], en: ["None","Basic","Some","Good","Expert"] };
const CUE = { it: ["Scoraggia molto","Scoraggia","Nessun effetto","Incoraggia","Incoraggia molto"], en: ["Discourages a lot","Discourages","No effect","Encourages","Encourages a lot"] };
const GENDERS = { it: ["Donna","Uomo","Non binario","Preferisco non dirlo"], en: ["Female","Male","Non-binary","Prefer not to say"] };
const EDU = { it: ["Scuola secondaria","Laurea triennale","Laurea magistrale","Dottorato","Altro"], en: ["Secondary school","Bachelor's","Master's","PhD","Other"] };

const CATS = {
  wine: { noun: { it: "vino", en: "wine" } },
  beer: { noun: { it: "birra artigianale", en: "craft beer" } },
  spirits: { noun: { it: "distillati artigianali", en: "craft spirits" } }
};

const CAT_THEME = {
  wine: { name: { it: "Vino", en: "Wine" }, desc: { it: "Vino fermo e spumante", en: "Still & sparkling wine" }, band: "#5C1A2A", accentBg: "#7C2638" },
  beer: { name: { it: "Birra artigianale", en: "Craft beer" }, desc: { it: "Birrifici indipendenti e artigianali", en: "Independent & craft breweries" }, band: "#6B3A14", accentBg: "#8A4E1C" },
  spirits: { name: { it: "Distillati artigianali", en: "Craft spirits" }, desc: { it: "Gin, whisky, rum artigianali e altro", en: "Artisanal gin, whisky, rum & more" }, band: "#0C3A4A", accentBg: "#13586E" }
};

function percGroups(noun, lang) {
  const C = noun.charAt(0).toUpperCase() + noun.slice(1);
  if (lang === "it") {
    return [
      { title: "Heritage e complessità", subtitle: "Quanto sembra richiedere conoscenze preliminari", sts: [
        { id: "hc1", text: `Capire il ${noun} richiede molta conoscenza preliminare.` },
        { id: "hc2", text: `C'è così tanto da imparare sul ${noun} che può risultare opprimente.` },
        { id: "hc3", text: `Il ${noun} comporta una terminologia complessa difficile da seguire.` },
        { id: "hc4", text: `Scegliere un buon ${noun} mi sembra complicato.` }
      ]},
      { title: "Sentirsi inclusi", subtitle: "Se la categoria sembra aperta a te", sts: [
        { id: "cb1", text: `A volte mi sento fuori posto quando acquisto o ordino ${noun}.` },
        { id: "cb2", text: `Il mondo del ${noun} sembra rivolto a persone più sofisticate di me.` },
        { id: "cb3", text: `Mi preoccupo di essere giudicato per le mie scelte riguardo al ${noun}.` },
        { id: "cb4", text: `Il mondo del ${noun} può sembrare esclusivo o elitario.` }
      ]},
      { title: "Sentirsi a proprio agio", subtitle: "Quanto ti senti comodo e sicuro", sts: [
        { id: "fa1", text: `Mi sento a mio agio nello scegliere un ${noun} da solo/a.` },
        { id: "fa2", text: `Mi sento sicuro/a nel parlare di ${noun} con altre persone.` },
        { id: "fa3", text: `Il ${noun} mi sembra accessibile e accogliente.` },
        { id: "fa4", text: `Posso apprezzare il ${noun} senza dover essere un esperto/a.` }
      ]}
    ];
  }
  return [
    { title: "Heritage & complexity", subtitle: "How much it seems to require prior knowledge", sts: [
      { id: "hc1", text: `Understanding ${noun} requires a lot of prior knowledge.` },
      { id: "hc2", text: `There is so much to learn about ${noun} that it can feel overwhelming.` },
      { id: "hc3", text: `${C} involves complex terminology that is hard to follow.` },
      { id: "hc4", text: `Choosing a good ${noun} feels complicated to me.` }
    ]},
    { title: "Feeling included", subtitle: "Whether the category feels open to you", sts: [
      { id: "cb1", text: `I sometimes feel out of place when buying or ordering ${noun}.` },
      { id: "cb2", text: `${C} feels aimed at people more sophisticated than me.` },
      { id: "cb3", text: `I worry about being judged for my choices when it comes to ${noun}.` },
      { id: "cb4", text: `The world of ${noun} can feel exclusive or elitist.` }
    ]},
    { title: "Feeling at ease", subtitle: "How comfortable and confident you feel", sts: [
      { id: "fa1", text: `I feel comfortable choosing a ${noun} on my own.` },
      { id: "fa2", text: `I feel confident talking about ${noun} with other people.` },
      { id: "fa3", text: `${C} feels approachable and welcoming to someone like me.` },
      { id: "fa4", text: `I can enjoy ${noun} without needing to be an expert.` }
    ]}
  ];
}

const ANX = {
  it: [
    { id: "an1", text: "Mi sento ansioso/a quando devo scegliere un vino al ristorante o in negozio." },
    { id: "an2", text: "Spesso evito di comprare vino per paura di sbagliare scelta." },
    { id: "an3", text: "Mi preoccupo di scegliere un vino che gli altri considererebbero una scelta sbagliata." },
    { id: "an4", text: "La paura di scegliere il vino sbagliato riduce il mio piacere nel berlo." }
  ],
  en: [
    { id: "an1", text: "I feel anxious when I have to choose a wine in a restaurant or shop." },
    { id: "an2", text: "I often avoid buying wine because I am afraid of making the wrong choice." },
    { id: "an3", text: "I worry about picking a wine that others will think is a bad choice." },
    { id: "an4", text: "The fear of choosing the wrong wine takes away from my enjoyment of it." }
  ]
};

const CUES = {
  it: [
    { id: "origin", text: "Origine geografica — la regione o il paese di provenienza" },
    { id: "family", text: "La storia della famiglia o del produttore" },
    { id: "method", text: "Il metodo di produzione — come viene realizzato" },
    { id: "score", text: "Un punteggio o una valutazione di esperti" },
    { id: "organic", text: "Una certificazione biologica" },
    { id: "vintage", text: "L'annata o il millesimo" },
    { id: "price", text: "Un prezzo elevato" }
  ],
  en: [
    { id: "origin", text: "Geographic origin — the region or country it comes from" },
    { id: "family", text: "The history of the family or producer behind it" },
    { id: "method", text: "The production method — how it is made" },
    { id: "score", text: "An expert score or rating" },
    { id: "organic", text: "An organic or bio certification" },
    { id: "vintage", text: "The vintage or year" },
    { id: "price", text: "A high price" }
  ]
};

const T = {
  it: {
    eyebrow: "Studio su Heritage e Accessibilità",
    introKicker: "MSc Wine Management · Ricerca di tesi",
    title: "Quanto sono davvero accessibili vino, birra e distillati?",
    subtitle: "Un breve sondaggio anonimo su come i giovani consumatori vivono queste bevande — e su come le storie che raccontano la loro heritage influenzano questa esperienza.",
    minutes: m => `~${m} minuti`,
    anon: "Completamente anonimo",
    ages: "Età 18–30",
    begin: "Inizia il sondaggio",
    back: "Indietro",
    continueLabel: "Continua",
    submitLabel: "Invia",
    yourAge: "La tua età",
    agePh: "es. 24",
    excludedTitle: "Grazie per l'interesse",
    excludedBody: "Questo studio si concentra su consumatori tra 18 e 30 anni che non lavorano professionalmente nel settore vino, birra o distillati. In base alle tue risposte, non rientri in questo gruppo, quindi non c'è altro da compilare. Grazie per il tempo dedicato.",
    startOver: "Ricomincia",
    thankTitle: "Grazie",
    thankBody: "Le tue risposte sono state registrate. Il tuo contributo aiuta davvero questa ricerca — grazie per il tempo che hai dedicato.",
    reference: "Riferimento",
    footer: "MSc Wine Management — ricerca",
    sectionOf: (n) => `Sezione ${n} di 6`,
    sections: {
      screening: { eb: "Sezione 1 · Idoneità", t: "Prima di iniziare", s: "Un paio di domande veloci per assicurarci che questo sondaggio sia adatto a te." },
      profile: { eb: "Sezione 2 · Su di te", t: "Qualcosa su di te", s: "Le tue abitudini e il tuo background. Non ci sono risposte giuste o sbagliate." },
      perc_wine: { eb: "Sezione 3 · Vino", t: "Come percepisci il vino", s: "Indica quanto sei d'accordo con ciascuna affermazione." },
      perc_beer: { eb: "Sezione 3 · Birra artigianale", t: "Come percepisci la birra artigianale", s: "Indica quanto sei d'accordo con ciascuna affermazione." },
      perc_spirits: { eb: "Sezione 3 · Distillati artigianali", t: "Come percepisci i distillati artigianali", s: "Indica quanto sei d'accordo con ciascuna affermazione." },
      anxiety: { eb: "Sezione 4 · Scegliere il vino", t: "Scegliere un vino", s: "Pensando specificamente al vino, quanto sei d'accordo?" },
      cues: { eb: "Sezione 5 · Cosa ti guida", t: "Cosa ti dà sicurezza?", s: "Quando scegli un vino, come influisce ciascuno di questi elementi sulla tua sicurezza?" },
      open: { eb: "Sezione 6 · Nelle tue parole", t: "Alcune domande aperte", s: "Facoltative — ma le tue parole aiutano questa ricerca più di tutto il resto." }
    },
    workQ: "Lavori professionalmente nel settore vino, birra o distillati?",
    yes: "Sì", no: "No",
    genderLabel: "Genere",
    eduLabel: "Livello di istruzione più alto raggiunto",
    consumptionTitle: "Quanto spesso bevi ciascuna di queste bevande?",
    consumptionSub: "Nell'ultimo anno",
    knowledgeTitle: "Come valuteresti la tua conoscenza?",
    knowledgeSub: "Sii sincero/a — non c'è una risposta sbagliata",
    wineLabel: "Vino", beerLabel: "Birra artigianale", spiritsLabel: "Distillati artigianali",
    catOf: (n) => `Categoria ${n} di 3`,
    catInstruction: "Valuta ciascuna affermazione da 1 (fortemente in disaccordo) a 5 (fortemente d'accordo).",
    anxTitle: "Ansia nella scelta del vino",
    anxSub: "Quanto sei d'accordo con ciascuna affermazione?",
    cuesTitle: "Indicatori di heritage",
    cuesSub: "Per ciascuno, scoraggia o incoraggia la tua sicurezza?",
    openFields: [
      { label: "Quando pensi al vino, cosa ti viene in mente — e che sensazione ti dà?", ph: "Scrivi quanto vuoi…" },
      { label: "Tra vino, birra artigianale e distillati artigianali, con quale ti senti più a tuo agio, e perché?", ph: "La tua risposta…" },
      { label: "Cosa ti farebbe sentire più sicuro/a nella scelta di un vino?", ph: "La tua risposta…" }
    ],
    langToggle: "EN",
    researcherTitle: "Accesso ricercatore",
    researcherSub: "Inserisci la password per visualizzare le risposte raccolte.",
    pwPh: "Password",
    unlock: "Sblocca",
    cancel: "Annulla",
    wrongPw: "Password errata.",
    dashboardTitle: "Risposte raccolte",
    dashboardEb: "Pannello ricercatore",
    totalResponses: "Risposte totali",
    mostRecent: "Più recenti",
    refresh: "Aggiorna",
    noResponses: "Nessuna risposta raccolta finora.",
    downloadExcel: "Scarica tutti i dati (Excel)",
    close: "Chiudi",
    age: "Età"
  },
  en: {
    eyebrow: "Heritage & Accessibility Study",
    introKicker: "MSc Wine Management · Thesis research",
    title: "How approachable do wine, beer and spirits really feel?",
    subtitle: "A short, anonymous survey on how young consumers experience these drinks — and how the stories they tell about their heritage shape that experience.",
    minutes: m => `~${m} minutes`,
    anon: "Completely anonymous",
    ages: "Ages 18–30",
    begin: "Begin the survey",
    back: "Back",
    continueLabel: "Continue",
    submitLabel: "Submit",
    yourAge: "Your age",
    agePh: "e.g. 24",
    excludedTitle: "We appreciate your interest",
    excludedBody: "This study focuses on consumers aged 18–30 who do not work professionally in the wine, beer or spirits industry. Based on your answers, you fall outside this group — so there is nothing more to fill in. Thank you for your time.",
    startOver: "Start over",
    thankTitle: "Thank you",
    thankBody: "Your responses have been recorded. Your contribution genuinely helps this research — thank you for taking the time.",
    reference: "Reference",
    footer: "MSc Wine Management research",
    sectionOf: (n) => `Section ${n} of 6`,
    sections: {
      screening: { eb: "Section 1 · Eligibility", t: "Before we begin", s: "A couple of quick questions to make sure this survey is a good fit for you." },
      profile: { eb: "Section 2 · About you", t: "A little about you", s: "Your habits and background. There are no right or wrong answers." },
      perc_wine: { eb: "Section 3 · Wine", t: "How wine feels to you", s: "Say how much you agree with each statement." },
      perc_beer: { eb: "Section 3 · Craft beer", t: "How craft beer feels to you", s: "Say how much you agree with each statement." },
      perc_spirits: { eb: "Section 3 · Craft spirits", t: "How craft spirits feel to you", s: "Say how much you agree with each statement." },
      anxiety: { eb: "Section 4 · Choosing wine", t: "Choosing a wine", s: "Thinking specifically about wine, how much do you agree?" },
      cues: { eb: "Section 5 · What guides you", t: "What gives you confidence?", s: "When choosing a wine, how does each of these affect your confidence?" },
      open: { eb: "Section 6 · In your words", t: "A few open questions", s: "Optional — but your own words help this research most of all." }
    },
    workQ: "Do you work professionally in the wine, beer or spirits industry?",
    yes: "Yes", no: "No",
    genderLabel: "Gender",
    eduLabel: "Highest level of education",
    consumptionTitle: "How often do you drink each of these?",
    consumptionSub: "Over the past year",
    knowledgeTitle: "How would you rate your own knowledge?",
    knowledgeSub: "Be honest — there is no wrong answer",
    wineLabel: "Wine", beerLabel: "Craft beer", spiritsLabel: "Craft spirits",
    catOf: (n) => `Category ${n} of 3`,
    catInstruction: "Rate each statement from 1 (strongly disagree) to 5 (strongly agree).",
    anxTitle: "Wine choice anxiety",
    anxSub: "How much do you agree with each statement?",
    cuesTitle: "Heritage cues",
    cuesSub: "For each, does it discourage or encourage your confidence?",
    openFields: [
      { label: "When you think about wine, what comes to mind — and how does it make you feel?", ph: "Write as much or as little as you like…" },
      { label: "Which of the three — wine, craft beer or craft spirits — do you feel most comfortable with, and why?", ph: "Your answer…" },
      { label: "What would make you feel more confident when choosing a wine?", ph: "Your answer…" }
    ],
    langToggle: "IT",
    researcherTitle: "Researcher access",
    researcherSub: "Enter the access password to view collected responses.",
    pwPh: "Password",
    unlock: "Unlock",
    cancel: "Cancel",
    wrongPw: "Incorrect password.",
    dashboardTitle: "Collected responses",
    dashboardEb: "Researcher dashboard",
    totalResponses: "Total responses",
    mostRecent: "Most recent",
    refresh: "Refresh",
    noResponses: "No responses collected yet.",
    downloadExcel: "Download all data (Excel)",
    close: "Close",
    age: "Age"
  }
};

const SUB_STEPS = ["screening","profile","perc_wine","perc_beer","perc_spirits","anxiety","cues","open"];

const COLORS = {
  bgPage: "#FBF8F1",
  surfaceCard: "#FFFFFF",
  border: "#E7DFCE",
  borderStrong: "#D8CBA8",
  textPrimary: "#241B12",
  textSecondary: "#5B4F3E",
  textMuted: "#8A7C63",
  textFaint: "#B3A687",
  accent: "#C8A14E",
  accentStrong: "#9C7A2E",
  textOnGold: "#2A1F0E",
  night: "#0A1A2B",
  oro300: "#E8D9A8",
  danger: "#B3413C"
};

function OptBtn({ label, selected, onClick, accentBg }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, minWidth: 0, minHeight: 44,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "6px 2px", borderRadius: 8, cursor: "pointer",
        fontFamily: "system-ui, sans-serif", fontSize: 15, fontWeight: 600,
        border: `1px solid ${selected ? (accentBg || COLORS.night) : COLORS.borderStrong}`,
        background: selected ? (accentBg || COLORS.night) : COLORS.surfaceCard,
        color: selected ? COLORS.oro300 : COLORS.textFaint,
        transition: "all 120ms ease"
      }}
    >{label}</button>
  );
}

function RadioBtn({ label, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "12px 18px", borderRadius: 8, cursor: "pointer", textAlign: "left",
        fontFamily: "system-ui, sans-serif", fontSize: 14, fontWeight: 500,
        border: `1px solid ${selected ? COLORS.night : COLORS.borderStrong}`,
        background: selected ? COLORS.night : COLORS.surfaceCard,
        color: selected ? COLORS.oro300 : COLORS.textSecondary,
        transition: "all 120ms ease"
      }}
    >{label}</button>
  );
}

function MatrixRow({ label, value, options, onSelect, accentBg, answered }) {
  return (
    <div style={{
      background: COLORS.surfaceCard,
      border: `1px solid ${answered ? (accentBg || COLORS.night) : COLORS.border}`,
      borderRadius: 12, padding: "15px 16px", transition: "border-color 120ms ease"
    }}>
      <div style={{ fontSize: 15, color: COLORS.textPrimary, lineHeight: 1.4, marginBottom: 12 }}>{label}</div>
      <div style={{ display: "flex", gap: 6 }}>
        {options.map((opt, i) => (
          <OptBtn key={i} label={String(i + 1)} selected={value === i + 1} onClick={() => onSelect(i + 1)} accentBg={accentBg} />
        ))}
      </div>
    </div>
  );
}

function MatrixGroup({ title, subtitle, lowLabel, highLabel, items, tag, tagColor }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
        {tag && <span style={{ flex: "none", fontFamily: "Georgia, serif", fontSize: "1.15rem", fontWeight: 600, color: tagColor || COLORS.accentStrong }}>{tag}</span>}
        <span style={{ fontFamily: "Georgia, serif", fontSize: "clamp(1.15rem,4.5vw,1.4rem)", color: COLORS.textPrimary, lineHeight: 1.15 }}>{title}</span>
      </div>
      <p style={{ fontSize: 13, color: COLORS.textMuted, margin: "0 0 14px" }}>{subtitle}</p>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: COLORS.textFaint, padding: "0 2px 10px" }}>
        <span>{lowLabel}</span><span>{highLabel}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map((it, i) => <MatrixRow key={i} {...it} />)}
      </div>
    </div>
  );
}

function DetailSection({ title, children, accent }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em", color: accent || COLORS.accentStrong, fontWeight: 700, marginBottom: 10, paddingBottom: 6, borderBottom: `1px solid ${COLORS.border}` }}>{title}</div>
      {children}
    </div>
  );
}

function ScoreBar({ value, max = 5 }) {
  const v = Number(value) || 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 80, height: 6, background: COLORS.border, borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: `${(v / max) * 100}%`, height: "100%", background: COLORS.accent, borderRadius: 4, transition: "width 200ms" }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.textSecondary, minWidth: 16 }}>{v || "—"}</span>
    </div>
  );
}

export default function WineSurvey() {
  const [lang, setLang] = useState("it");
  const [phase, setPhase] = useState("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    age: "", worksInSector: "",
    gender: "", education: "",
    consumption: { wine: 0, beer: 0, spirits: 0 },
    knowledge: { wine: 0, beer: 0, spirits: 0 },
    perceptions: { wine: {}, beer: {}, spirits: {} },
    anxiety: {}, cues: {},
    open1: "", open2: "", open3: ""
  });
  const [lastId, setLastId] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [resOpen, setResOpen] = useState(false);
  const [resUnlocked, setResUnlocked] = useState(false);
  const [resPw, setResPw] = useState("");
  const [resError, setResError] = useState("");
  const [resCount, setResCount] = useState(0);
  const [resRecent, setResRecent] = useState([]);
  const [resSelected, setResSelected] = useState(null);
  const tapsRef = useRef([]);

  const t = T[lang];

  function setField(k, v) { setAnswers(a => ({ ...a, [k]: v })); }
  function setNested(g, id, v) { setAnswers(a => ({ ...a, [g]: { ...a[g], [id]: v } })); }
  function setPerc(cat, id, v) { setAnswers(a => ({ ...a, perceptions: { ...a.perceptions, [cat]: { ...a.perceptions[cat], [id]: v } } })); }

  function countAns(o) { return Object.values(o || {}).filter(v => v > 0).length; }
  const curKey = SUB_STEPS[step];

  function canContinue() {
    const a = answers, k = curKey;
    if (k === "screening") return a.age !== "" && !isNaN(Number(a.age)) && a.worksInSector !== "";
    if (k === "profile") return !!a.gender && !!a.education && a.consumption.wine && a.consumption.beer && a.consumption.spirits && a.knowledge.wine && a.knowledge.beer && a.knowledge.spirits;
    if (k === "perc_wine") return countAns(a.perceptions.wine) >= 12;
    if (k === "perc_beer") return countAns(a.perceptions.beer) >= 12;
    if (k === "perc_spirits") return countAns(a.perceptions.spirits) >= 12;
    if (k === "anxiety") return countAns(a.anxiety) >= 4;
    if (k === "cues") return countAns(a.cues) >= 7;
    return true;
  }

  async function submit() {
    const a = answers;
    const id = "R" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
    const record = {
      id, timestamp: new Date().toISOString(),
      age: Number(a.age), worksInSector: a.worksInSector,
      gender: a.gender, education: a.education,
      consumption: a.consumption, knowledge: a.knowledge,
      perceptions: a.perceptions, anxiety: a.anxiety, cues: a.cues,
      open1: a.open1, open2: a.open2, open3: a.open3, lang
    };
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record)
      });
      if (!res.ok) throw new Error("server-error");
      setLastId(id);
      setPhase("thankyou");
      window.scrollTo(0, 0);
    } catch (e) {
      console.warn("save failed", e);
      setSubmitError(lang === "it"
        ? "Non è stato possibile inviare le risposte. Riprova: se il problema persiste, fai uno screenshot di questo messaggio e segnalalo."
        : "We couldn't submit your responses. Please try again; if this keeps happening, screenshot this message and report it.");
    } finally {
      setSubmitting(false);
    }
  }

  function onContinue() {
    const a = answers, k = curKey;
    if (k === "screening") {
      const age = Number(a.age);
      if (!(age >= 18 && age <= 30) || a.worksInSector === "yes") { setPhase("excluded"); return; }
    }
    if (k === "open") { submit(); return; }
    setStep(s => s + 1);
    window.scrollTo(0, 0);
  }
  function onBack() {
    if (step === 0) setPhase("intro");
    else setStep(s => s - 1);
    window.scrollTo(0, 0);
  }
  function onBegin() { setPhase("survey"); setStep(0); window.scrollTo(0, 0); }
  function onRestart() {
    setPhase("intro"); setStep(0);
    setAnswers({
      age: "", worksInSector: "", gender: "", education: "",
      consumption: { wine: 0, beer: 0, spirits: 0 }, knowledge: { wine: 0, beer: 0, spirits: 0 },
      perceptions: { wine: {}, beer: {}, spirits: {} }, anxiety: {}, cues: {}, open1: "", open2: "", open3: ""
    });
  }

  function onDotTap() {
    const now = Date.now();
    tapsRef.current = tapsRef.current.filter(tm => now - tm < 2500);
    tapsRef.current.push(now);
    if (tapsRef.current.length >= 5) {
      tapsRef.current = [];
      setResOpen(true); setResUnlocked(false); setResPw(""); setResError("");
    }
  }

  async function onResUnlock() {
    try {
      const res = await fetch(`/api/responses?password=${encodeURIComponent(resPw)}`);
      if (res.status === 401) { setResError(t.wrongPw); return; }
      if (!res.ok) throw new Error("server-error");
      const data = await res.json();
      setResUnlocked(true);
      setResError("");
      const sorted = (data.responses || []).sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
      setResCount(data.total || sorted.length);
      setResRecent(sorted.slice(0, 8));
    } catch (e) {
      setResError(lang === "it" ? "Errore di connessione." : "Connection error.");
    }
  }

  async function loadResearcher() {
    try {
      const res = await fetch(`/api/responses?password=${encodeURIComponent(resPw)}`);
      if (!res.ok) return;
      const data = await res.json();
      const sorted = (data.responses || []).sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
      setResCount(data.total || sorted.length);
      setResRecent(sorted.slice(0, 8));
    } catch (e) {}
  }

  function onDownloadExcel() {
    const url = `/api/responses/export.xlsx?password=${encodeURIComponent(resPw)}`;
    const a = document.createElement("a");
    a.href = url;
    a.download = "";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function fmtTime(iso) {
    try { const d = new Date(iso); return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
    catch (e) { return iso; }
  }

  function sectionNo() {
    const map = { screening: 1, profile: 2, perc_wine: 3, perc_beer: 3, perc_spirits: 3, anxiety: 4, cues: 5, open: 6 };
    return map[curKey];
  }

  const pct = ((step + 1) / SUB_STEPS.length) * 100;
  const m = t.sections[curKey];

  function renderProfileSection() {
    const a = answers;
    return (
      <div>
        <div style={{ display: "flex", flexDirection: "column", gap: 30, marginBottom: 38 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500, color: COLORS.textPrimary, marginBottom: 14 }}>{t.genderLabel}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {GENDERS[lang].map(o => <RadioBtn key={o} label={o} selected={a.gender === o} onClick={() => setField("gender", o)} />)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500, color: COLORS.textPrimary, marginBottom: 14 }}>{t.eduLabel}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {EDU[lang].map(o => <RadioBtn key={o} label={o} selected={a.education === o} onClick={() => setField("education", o)} />)}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
          <MatrixGroup
            title={t.consumptionTitle} subtitle={t.consumptionSub}
            lowLabel={FREQ[lang][0]} highLabel={FREQ[lang][4]}
            items={[
              { label: t.wineLabel, value: a.consumption.wine, options: FREQ[lang], onSelect: v => setNested("consumption", "wine", v), answered: a.consumption.wine > 0 },
              { label: t.beerLabel, value: a.consumption.beer, options: FREQ[lang], onSelect: v => setNested("consumption", "beer", v), answered: a.consumption.beer > 0 },
              { label: t.spiritsLabel, value: a.consumption.spirits, options: FREQ[lang], onSelect: v => setNested("consumption", "spirits", v), answered: a.consumption.spirits > 0 }
            ]}
          />
          <MatrixGroup
            title={t.knowledgeTitle} subtitle={t.knowledgeSub}
            lowLabel={KNOW[lang][0]} highLabel={KNOW[lang][4]}
            items={[
              { label: t.wineLabel, value: a.knowledge.wine, options: KNOW[lang], onSelect: v => setNested("knowledge", "wine", v), answered: a.knowledge.wine > 0 },
              { label: t.beerLabel, value: a.knowledge.beer, options: KNOW[lang], onSelect: v => setNested("knowledge", "beer", v), answered: a.knowledge.beer > 0 },
              { label: t.spiritsLabel, value: a.knowledge.spirits, options: KNOW[lang], onSelect: v => setNested("knowledge", "spirits", v), answered: a.knowledge.spirits > 0 }
            ]}
          />
        </div>
      </div>
    );
  }

  function renderPercSection(cat) {
    const a = answers;
    const noun = CATS[cat].noun[lang];
    const theme = CAT_THEME[cat];
    const idx = cat === "wine" ? 0 : cat === "beer" ? 1 : 2;
    const tags = ["A", "B", "C"];
    const groups = percGroups(noun, lang);
    return (
      <div>
        <div style={{
          background: theme.band, color: "#FBF8F1", borderRadius: 12, padding: "22px 24px", marginBottom: 30,
          border: "1px solid rgba(200,161,78,0.28)", boxShadow: "0 4px 14px rgba(0,0,0,0.12)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.22em", opacity: 0.8, whiteSpace: "nowrap" }}>{t.catOf(idx + 1)}</div>
            <div style={{ display: "flex", gap: 7, paddingTop: 4 }}>
              {[0,1,2].map(i => <span key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i === idx ? "#C8A14E" : "rgba(251,248,241,0.32)" }} />)}
            </div>
          </div>
          <div style={{ fontFamily: "Georgia, serif", fontWeight: 500, fontSize: "clamp(1.9rem,7vw,2.6rem)", lineHeight: 1.04, margin: "10px 0 8px" }}>{theme.name[lang]}</div>
          <div style={{ fontSize: 14, lineHeight: 1.5, opacity: 0.82 }}>{theme.desc[lang]}</div>
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(251,248,241,0.18)", fontSize: "12.5px", letterSpacing: "0.02em", opacity: 0.78 }}>{t.catInstruction}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
          {groups.map((g, gi) => (
            <MatrixGroup
              key={g.title}
              title={g.title} subtitle={g.subtitle}
              lowLabel={LIKERT[lang][0]} highLabel={LIKERT[lang][4]}
              tag={tags[gi]} tagColor={theme.accentBg}
              items={g.sts.map(st => ({
                label: st.text,
                value: a.perceptions[cat][st.id] || 0,
                options: LIKERT[lang],
                onSelect: v => setPerc(cat, st.id, v),
                accentBg: theme.accentBg,
                answered: (a.perceptions[cat][st.id] || 0) > 0
              }))}
            />
          ))}
        </div>
      </div>
    );
  }

  function renderAnxietySection() {
    const a = answers;
    return (
      <MatrixGroup
        title={t.anxTitle} subtitle={t.anxSub}
        lowLabel={LIKERT[lang][0]} highLabel={LIKERT[lang][4]}
        items={ANX[lang].map(st => ({
          label: st.text, value: a.anxiety[st.id] || 0, options: LIKERT[lang],
          onSelect: v => setNested("anxiety", st.id, v), answered: (a.anxiety[st.id] || 0) > 0
        }))}
      />
    );
  }

  function renderCuesSection() {
    const a = answers;
    return (
      <MatrixGroup
        title={t.cuesTitle} subtitle={t.cuesSub}
        lowLabel={CUE[lang][0]} highLabel={CUE[lang][4]}
        items={CUES[lang].map(st => ({
          label: st.text, value: a.cues[st.id] || 0, options: CUE[lang],
          onSelect: v => setNested("cues", st.id, v), answered: (a.cues[st.id] || 0) > 0
        }))}
      />
    );
  }

  function renderOpenSection() {
    const a = answers;
    const fields = [
      { key: "open1", value: a.open1, onChange: e => setField("open1", e.target.value) },
      { key: "open2", value: a.open2, onChange: e => setField("open2", e.target.value) },
      { key: "open3", value: a.open3, onChange: e => setField("open3", e.target.value) }
    ];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {fields.map((f, i) => (
          <div key={f.key}>
            <label style={{ display: "block", fontSize: 15, color: COLORS.textPrimary, marginBottom: 10, lineHeight: 1.45 }}>{t.openFields[i].label}</label>
            <textarea
              value={f.value} onChange={f.onChange} placeholder={t.openFields[i].ph} rows={4}
              style={{
                width: "100%", padding: "13px 14px", border: `1px solid ${COLORS.borderStrong}`, borderRadius: 8,
                fontSize: 15, fontFamily: "system-ui, sans-serif", lineHeight: 1.6,
                background: COLORS.surfaceCard, color: COLORS.textPrimary, outline: "none", resize: "vertical", boxSizing: "border-box"
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  function renderScreeningSection() {
    const a = answers;
    return (
      <div>
        <div style={{ marginBottom: 30, maxWidth: 220 }}>
          <label style={{ display: "block", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em", color: COLORS.textMuted, marginBottom: 8 }}>{t.yourAge}</label>
          <input
            type="number" min="0" value={a.age} onChange={e => setField("age", e.target.value)} placeholder={t.agePh}
            style={{
              width: "100%", padding: "13px 14px", border: `1px solid ${COLORS.borderStrong}`, borderRadius: 8,
              fontSize: 16, fontFamily: "system-ui, sans-serif", background: COLORS.surfaceCard, color: COLORS.textPrimary,
              outline: "none", boxSizing: "border-box"
            }}
          />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 500, color: COLORS.textPrimary, marginBottom: 14, lineHeight: 1.4 }}>{t.workQ}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <RadioBtn label={t.yes} selected={a.worksInSector === "yes"} onClick={() => setField("worksInSector", "yes")} />
            <RadioBtn label={t.no} selected={a.worksInSector === "no"} onClick={() => setField("worksInSector", "no")} />
          </div>
        </div>
      </div>
    );
  }

  function renderSurveyBody() {
    if (curKey === "screening") return renderScreeningSection();
    if (curKey === "profile") return renderProfileSection();
    if (curKey === "perc_wine") return renderPercSection("wine");
    if (curKey === "perc_beer") return renderPercSection("beer");
    if (curKey === "perc_spirits") return renderPercSection("spirits");
    if (curKey === "anxiety") return renderAnxietySection();
    if (curKey === "cues") return renderCuesSection();
    if (curKey === "open") return renderOpenSection();
    return null;
  }

  const showCatBand = curKey === "perc_wine" || curKey === "perc_beer" || curKey === "perc_spirits";

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bgPage, color: COLORS.textPrimary, display: "flex", flexDirection: "column", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ position: "sticky", top: 0, zIndex: 5, background: "rgba(251,248,241,0.92)", backdropFilter: "blur(8px)", borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ maxWidth: 780, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <span style={{ color: COLORS.accentStrong, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em" }}>{t.eyebrow}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {phase === "survey" && <span style={{ flex: "none", fontSize: 11, letterSpacing: "0.06em", color: COLORS.textMuted, whiteSpace: "nowrap" }}>{t.sectionOf(sectionNo())}</span>}
            <button
              onClick={() => setLang(l => l === "it" ? "en" : "it")}
              style={{
                flex: "none", border: `1px solid ${COLORS.borderStrong}`, background: "transparent", color: COLORS.textSecondary,
                fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", padding: "5px 10px", borderRadius: 6, cursor: "pointer"
              }}
            >{t.langToggle}</button>
          </div>
        </div>
        {phase === "survey" && (
          <div style={{ height: 3, background: "#EFE9D8" }}>
            <div style={{ height: 3, width: pct + "%", background: COLORS.accent, transition: "width 200ms ease" }} />
          </div>
        )}
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "clamp(24px,5vw,44px) clamp(16px,5vw,24px) 80px" }}>
        <div style={{ width: "100%", maxWidth: 760 }}>

          {phase === "intro" && (
            <div style={{ textAlign: "center", paddingTop: 24 }}>
              <div style={{ color: COLORS.accentStrong, marginBottom: 22, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em" }}>{t.introKicker}</div>
              <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 500, fontSize: "clamp(2rem,5vw,3.25rem)", lineHeight: 1.06, marginBottom: 22 }}>{t.title}</h1>
              <div style={{ margin: "0 auto 26px", maxWidth: 220, height: 1, background: COLORS.border, position: "relative" }}>
                <span style={{ position: "absolute", left: "50%", top: -3, transform: "translateX(-50%)", width: 6, height: 6, borderRadius: "50%", background: COLORS.accent }} />
              </div>
              <p style={{ fontSize: 18, lineHeight: 1.7, color: COLORS.textSecondary, maxWidth: 600, margin: "0 auto 8px" }}>{t.subtitle}</p>
              <div style={{ display: "flex", gap: 18, justifyContent: "center", flexWrap: "wrap", margin: "30px 0 36px", color: COLORS.textMuted, fontSize: 14 }}>
                <span>{t.minutes(6)}</span><span style={{ color: COLORS.accent }}>·</span><span>{t.anon}</span><span style={{ color: COLORS.accent }}>·</span><span>{t.ages}</span>
              </div>
              <button
                onClick={onBegin}
                style={{
                  background: COLORS.night, color: COLORS.oro300, border: "none", padding: "16px 36px", borderRadius: 8,
                  fontFamily: "system-ui, sans-serif", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: 14, fontWeight: 600, cursor: "pointer"
                }}
              >{t.begin}</button>
            </div>
          )}

          {phase === "survey" && (
            <div>
              {!showCatBand && (
                <div>
                  <div style={{ color: COLORS.accentStrong, marginBottom: 14, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em" }}>{m.eb}</div>
                  <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 500, fontSize: "clamp(1.6rem,5.5vw,2rem)", lineHeight: 1.1, marginBottom: 8 }}>{m.t}</h2>
                  <p style={{ color: COLORS.textSecondary, fontSize: 16, lineHeight: 1.6, marginBottom: 32 }}>{m.s}</p>
                </div>
              )}
              {renderSurveyBody()}
              {submitError && (
                <div style={{ marginTop: 24, padding: "14px 16px", borderRadius: 8, background: "#FBEAE8", border: `1px solid ${COLORS.danger}`, color: COLORS.danger, fontSize: 14, lineHeight: 1.5 }}>
                  {submitError}
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 46, paddingTop: 24, borderTop: `1px solid ${COLORS.border}` }}>
                <button onClick={onBack} style={{ background: "transparent", color: COLORS.textSecondary, border: `1px solid ${COLORS.borderStrong}`, padding: "12px 22px", borderRadius: 8, fontFamily: "system-ui, sans-serif", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: 13, cursor: "pointer" }}>{t.back}</button>
                <button
                  onClick={onContinue} disabled={!canContinue() || submitting}
                  style={{
                    background: (canContinue() && !submitting) ? COLORS.accent : "#DCD2B8", color: (canContinue() && !submitting) ? COLORS.textOnGold : "#A9A084",
                    border: "none", padding: "12px 26px", borderRadius: 8, fontFamily: "system-ui, sans-serif",
                    textTransform: "uppercase", letterSpacing: "0.1em", fontSize: 13, fontWeight: 600, cursor: (canContinue() && !submitting) ? "pointer" : "not-allowed"
                  }}
                >{submitting ? "…" : (curKey === "open" ? t.submitLabel : t.continueLabel)}</button>
              </div>
            </div>
          )}

          {phase === "excluded" && (
            <div style={{ textAlign: "center", paddingTop: 32, maxWidth: 560, margin: "0 auto" }}>
              <div style={{ color: COLORS.accentStrong, marginBottom: 18, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em" }}>{t.excludedTitle}</div>
              <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 500, fontSize: "2.25rem", lineHeight: 1.1, marginBottom: 18 }}>{t.excludedTitle}</h2>
              <p style={{ fontSize: 17, lineHeight: 1.7, color: COLORS.textSecondary, marginBottom: 32 }}>{t.excludedBody}</p>
              <button onClick={onRestart} style={{ background: "transparent", color: COLORS.textSecondary, border: `1px solid ${COLORS.borderStrong}`, padding: "12px 26px", borderRadius: 8, fontFamily: "system-ui, sans-serif", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: 13, cursor: "pointer" }}>{t.startOver}</button>
            </div>
          )}

          {phase === "thankyou" && (
            <div style={{ textAlign: "center", paddingTop: 32, maxWidth: 560, margin: "0 auto" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: COLORS.night, color: COLORS.oro300, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px", fontSize: 34, fontFamily: "Georgia, serif" }}>✓</div>
              <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 500, fontSize: "2.25rem", lineHeight: 1.1, marginBottom: 16 }}>{t.thankTitle}</h2>
              <p style={{ fontSize: 17, lineHeight: 1.7, color: COLORS.textSecondary, marginBottom: 8 }}>{t.thankBody}</p>
              <p style={{ fontSize: 12, color: COLORS.textFaint, marginTop: 20, letterSpacing: "0.04em" }}>{t.reference} · {lastId}</p>
            </div>
          )}

        </div>
      </div>

      <div style={{ padding: "22px 24px", textAlign: "center", color: COLORS.textFaint, fontSize: 12, display: "flex", gap: 10, justifyContent: "center", alignItems: "center" }}>
        <span>© 2026 · {t.footer}</span>
        <span onClick={onDotTap} style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS.borderStrong, display: "inline-block", cursor: "pointer" }} />
      </div>

      {resOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(10,26,43,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: COLORS.surfaceCard, border: `1px solid ${COLORS.border}`, borderRadius: 12, boxShadow: "0 12px 28px rgba(0,0,0,0.18)", width: "100%", maxWidth: 560, maxHeight: "86vh", overflow: "auto", padding: 32, boxSizing: "border-box" }}>

            {!resUnlocked && (
              <div>
                <div style={{ color: COLORS.accentStrong, marginBottom: 10, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em" }}>{t.researcherTitle}</div>
                <h3 style={{ fontFamily: "Georgia, serif", fontWeight: 500, fontSize: "1.5rem", marginBottom: 6 }}>{t.researcherTitle}</h3>
                <p style={{ color: COLORS.textMuted, fontSize: 14, marginBottom: 20 }}>{t.researcherSub}</p>
                <input
                  type="password" value={resPw} onChange={e => setResPw(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && onResUnlock()}
                  placeholder={t.pwPh}
                  style={{ width: "100%", padding: "13px 14px", border: `1px solid ${COLORS.borderStrong}`, borderRadius: 8, fontSize: 15, fontFamily: "system-ui, sans-serif", background: COLORS.surfaceCard, color: COLORS.textPrimary, outline: "none", boxSizing: "border-box" }}
                />
                {resError && <p style={{ color: COLORS.danger, fontSize: 13, marginTop: 8 }}>{resError}</p>}
                <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                  <button onClick={onResUnlock} style={{ background: COLORS.accent, color: COLORS.textOnGold, border: "none", padding: "12px 24px", borderRadius: 8, fontFamily: "system-ui, sans-serif", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>{t.unlock}</button>
                  <button onClick={() => setResOpen(false)} style={{ background: "transparent", color: COLORS.textSecondary, border: `1px solid ${COLORS.borderStrong}`, padding: "12px 24px", borderRadius: 8, fontFamily: "system-ui, sans-serif", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: 13, cursor: "pointer" }}>{t.cancel}</button>
                </div>
              </div>
            )}

            {resUnlocked && !resSelected && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
                  <div>
                    <div style={{ color: COLORS.accentStrong, marginBottom: 8, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em" }}>{t.dashboardEb}</div>
                    <h3 style={{ fontFamily: "Georgia, serif", fontWeight: 500, fontSize: "1.5rem" }}>{t.dashboardTitle}</h3>
                  </div>
                  <button onClick={() => setResOpen(false)} style={{ background: "transparent", border: "none", color: COLORS.textMuted, fontSize: 12, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.1em" }}>{t.close}</button>
                </div>
                <div style={{ display: "flex", gap: 16, marginBottom: 26 }}>
                  <div style={{ background: COLORS.night, color: COLORS.oro300, borderRadius: 10, padding: "20px 28px", minWidth: 130 }}>
                    <div style={{ fontFamily: "Georgia, serif", fontSize: "2.5rem", lineHeight: 1 }}>{resCount}</div>
                    <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 6, opacity: 0.82 }}>{t.totalResponses}</div>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", color: COLORS.textMuted }}>{t.mostRecent}</span>
                  <button onClick={loadResearcher} style={{ background: "none", border: "none", color: COLORS.accentStrong, fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>{t.refresh}</button>
                </div>
                <div style={{ border: `1px solid ${COLORS.border}`, borderRadius: 8, overflow: "hidden", marginBottom: 24 }}>
                  {resRecent.map((r, i) => (
                    <div key={i} onClick={() => setResSelected(r)} style={{ display: "grid", gridTemplateColumns: "1.5fr 0.9fr 1.1fr 0.4fr", gap: 8, padding: "11px 14px", borderBottom: `1px solid ${COLORS.border}`, fontSize: 13, cursor: "pointer", transition: "background 100ms" }}
                      onMouseEnter={e => e.currentTarget.style.background = COLORS.bgPage}
                      onMouseLeave={e => e.currentTarget.style.background = ""}
                    >
                      <span style={{ color: COLORS.textPrimary, fontVariantNumeric: "tabular-nums" }}>{fmtTime(r.timestamp)}</span>
                      <span style={{ color: COLORS.textSecondary }}>{t.age} {r.age}</span>
                      <span style={{ color: COLORS.textSecondary }}>{r.gender || "—"}</span>
                      <span style={{ color: COLORS.textFaint, textAlign: "right" }}>›</span>
                    </div>
                  ))}
                  {resCount === 0 && <div style={{ padding: 18, textAlign: "center", color: COLORS.textFaint, fontSize: 13 }}>{t.noResponses}</div>}
                </div>
                <button onClick={onDownloadExcel} style={{ width: "100%", background: COLORS.night, color: COLORS.oro300, border: "none", padding: 15, borderRadius: 8, fontFamily: "system-ui, sans-serif", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>{t.downloadExcel}</button>
              </div>
            )}

            {resUnlocked && resSelected && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
                  <button onClick={() => setResSelected(null)} style={{ background: "transparent", border: `1px solid ${COLORS.borderStrong}`, color: COLORS.textSecondary, padding: "6px 14px", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>← {lang === "it" ? "Lista" : "List"}</button>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: COLORS.accentStrong, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em" }}>{resSelected.id}</div>
                    <div style={{ fontSize: 12, color: COLORS.textMuted }}>{fmtTime(resSelected.timestamp)}</div>
                  </div>
                  <button onClick={() => setResOpen(false)} style={{ background: "transparent", border: "none", color: COLORS.textMuted, fontSize: 12, cursor: "pointer" }}>{t.close}</button>
                </div>

                {/* Demographics */}
                <div style={{ background: COLORS.night, color: COLORS.oro300, borderRadius: 10, padding: "16px 20px", marginBottom: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    [lang === "it" ? "Età" : "Age", resSelected.age],
                    [lang === "it" ? "Genere" : "Gender", resSelected.gender],
                    [lang === "it" ? "Istruzione" : "Education", resSelected.education],
                    ["Lang", resSelected.lang?.toUpperCase()],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", opacity: 0.65, marginBottom: 2 }}>{label}</div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{val || "—"}</div>
                    </div>
                  ))}
                </div>

                {/* Consumption & Knowledge */}
                <DetailSection title={lang === "it" ? "Consumo & Conoscenza" : "Consumption & Knowledge"}>
                  {["wine","beer","spirits"].map(cat => (
                    <div key={cat} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: COLORS.textSecondary, textTransform: "capitalize" }}>{cat}</span>
                      <span style={{ fontSize: 13 }}>{lang === "it" ? "Consumo" : "Cons."}: <b>{resSelected.consumption?.[cat] ?? "—"}</b></span>
                      <span style={{ fontSize: 13 }}>{lang === "it" ? "Conosc." : "Know."}: <b>{resSelected.knowledge?.[cat] ?? "—"}</b></span>
                    </div>
                  ))}
                </DetailSection>

                {/* Perceptions */}
                {["wine","beer","spirits"].map(cat => {
                  const perc = resSelected.perceptions?.[cat] || {};
                  const groups = [
                    { label: "Heritage & Complexity", keys: ["hc1","hc2","hc3","hc4"] },
                    { label: lang === "it" ? "Sentirsi inclusi" : "Feeling included", keys: ["cb1","cb2","cb3","cb4"] },
                    { label: lang === "it" ? "Sentirsi a proprio agio" : "Feeling at ease", keys: ["fa1","fa2","fa3","fa4"] },
                  ];
                  const catColors = { wine: "#7C2638", beer: "#8A4E1C", spirits: "#13586E" };
                  return (
                    <DetailSection key={cat} title={cat.charAt(0).toUpperCase() + cat.slice(1)} accent={catColors[cat]}>
                      {groups.map(g => (
                        <div key={g.label} style={{ marginBottom: 10 }}>
                          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: COLORS.textMuted, marginBottom: 4 }}>{g.label}</div>
                          <div style={{ display: "flex", gap: 6 }}>
                            {g.keys.map(k => (
                              <div key={k} style={{ flex: 1, textAlign: "center" }}>
                                <div style={{ fontSize: 10, color: COLORS.textFaint, marginBottom: 2 }}>{k}</div>
                                <div style={{ background: perc[k] ? catColors[cat] : COLORS.border, color: perc[k] ? COLORS.oro300 : COLORS.textFaint, borderRadius: 6, padding: "4px 0", fontSize: 14, fontWeight: 700 }}>{perc[k] || "—"}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </DetailSection>
                  );
                })}

                {/* Anxiety */}
                <DetailSection title={lang === "it" ? "Ansia nella scelta del vino" : "Wine choice anxiety"}>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["an1","an2","an3","an4"].map(k => (
                      <div key={k} style={{ flex: 1, textAlign: "center" }}>
                        <div style={{ fontSize: 10, color: COLORS.textFaint, marginBottom: 2 }}>{k}</div>
                        <div style={{ background: resSelected.anxiety?.[k] ? COLORS.night : COLORS.border, color: resSelected.anxiety?.[k] ? COLORS.oro300 : COLORS.textFaint, borderRadius: 6, padding: "4px 0", fontSize: 14, fontWeight: 700 }}>{resSelected.anxiety?.[k] || "—"}</div>
                      </div>
                    ))}
                  </div>
                </DetailSection>

                {/* Cues */}
                <DetailSection title={lang === "it" ? "Indicatori di heritage" : "Heritage cues"}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {["origin","family","method","score","organic","vintage","price"].map(k => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                        <span style={{ color: COLORS.textSecondary }}>{k}</span>
                        <ScoreBar value={resSelected.cues?.[k]} max={5} />
                      </div>
                    ))}
                  </div>
                </DetailSection>

                {/* Open answers */}
                {(resSelected.open1 || resSelected.open2 || resSelected.open3) && (
                  <DetailSection title={lang === "it" ? "Risposte aperte" : "Open answers"}>
                    {[resSelected.open1, resSelected.open2, resSelected.open3].map((txt, i) => txt ? (
                      <div key={i} style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Q{i+1}</div>
                        <div style={{ fontSize: 14, color: COLORS.textPrimary, lineHeight: 1.55, background: COLORS.bgPage, borderRadius: 6, padding: "10px 12px" }}>{txt}</div>
                      </div>
                    ) : null)}
                  </DetailSection>
                )}
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
