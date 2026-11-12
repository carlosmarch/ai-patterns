"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";

import { GeneratedSurface } from "./component";

/* The page the "model" writes: a picker for which wait pattern fits a given generation time. */

const STYLE = `<style>
.wrap{padding:16px;display:grid;gap:14px}
h1{font-size:15px;margin:0;font-weight:600}
.lead{margin:2px 0 0;color:var(--muted-fg);font-size:13px}
.row{display:flex;justify-content:space-between;font-size:12px;color:var(--muted-fg)}
.row output{color:var(--fg);font-weight:600;font-variant-numeric:tabular-nums}
input[type=range]{width:100%;margin:6px 0 0;accent-color:var(--fg)}
.track{position:relative;height:8px;border-radius:4px;background:var(--muted);display:flex;overflow:hidden}
.seg{height:100%;border-right:2px solid var(--bg);opacity:.35;background:var(--muted-fg);transition:opacity .2s}
.seg:last-child{border-right:0}
.seg.on{opacity:.9}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px}
.card{border:1px solid var(--border);border-radius:10px;padding:10px;opacity:.55;transition:border-color .2s,opacity .2s}
.card.on{border-color:var(--fg);opacity:1}
.card b{display:flex;align-items:center;gap:6px;font-size:13px}
.card span{display:block;font-size:12px;color:var(--muted-fg)}
.fit{display:none;font-style:normal;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.05em;border:1px solid var(--border);border-radius:4px;padding:0 4px}
.card.on .fit{display:inline}
.ghost{height:64px;border:1px solid var(--border);border-radius:10px;background:var(--muted)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
</style>`;

const HEAD = `<div class="wrap">
<div><h1>Which wait pattern fits?</h1><p class="lead">Drag to your generation's typical wait.</p></div>`;

const LAYOUT_HTML = `${STYLE}${HEAD}
<div><div class="row"><span>Expected wait</span><output>…</output></div><input type="range" disabled></div>
<div class="track"></div>
<div class="cards"><div class="ghost"></div><div class="ghost"></div><div class="ghost"></div></div>
</div>`;

const BODY = `${STYLE}${HEAD}
<div>
  <div class="row"><label for="wait">Expected wait</label><output id="out" for="wait"></output></div>
  <input id="wait" type="range" min="0" max="8" value="4" aria-describedby="out">
</div>
<div class="track" id="track" aria-hidden="true"></div>
<div class="cards">
  <div class="card" id="tl"><b>Thinking Loader <em class="fit">Fits</em></b><span>Under 10 s. Keep the person's eyes on the answer.</span></div>
  <div class="card" id="rc"><b>Agent Run Card <em class="fit">Fits</em></b><span>10 s to 2 min. Show the step it's on and a timer.</span></div>
  <div class="card" id="bt"><b>Background Tasks Drawer <em class="fit">Fits</em></b><span>Over 2 min. Let them leave and come back.</span></div>
</div>
</div>`;

const LOGIC = (config: string) => `<script>
var WAITS=[3,6,10,20,45,90,150,300,600];
var PATTERNS=[{id:"tl",from:0,to:10},{id:"rc",from:10,to:120},{id:"bt",from:120,to:Infinity}];
var config=${config};
var slider=document.getElementById("wait"),out=document.getElementById("out");
function fmt(s){return s<60?s+" s":(s/60).toFixed(s%60?1:0)+" min"}
function pick(s){for(var i=0;i<PATTERNS.length;i++){if(s<=PATTERNS[i].to)return PATTERNS[i].id}}
function renderTrack(){
  document.getElementById("track").innerHTML=config.segments.map(function(n,i){
    return '<div class="seg" data-id="'+PATTERNS[i].id+'" style="flex:'+n+'"></div>'}).join("");
}
function update(){
  var s=WAITS[slider.value],id=pick(s);
  out.textContent=fmt(s);
  PATTERNS.forEach(function(p){document.getElementById(p.id).classList.toggle("on",p.id===id)});
  document.querySelectorAll(".seg").forEach(function(el){el.classList.toggle("on",el.dataset.id===id)});
}
renderTrack();
slider.addEventListener("input",update);
update();
</script>`;

// v1 reads `segments` from a config object it never filled in, so the track
// throws before the slider is wired up — the frame catches and reports it.
const V1_HTML = BODY + LOGIC("{}");
const V2_HTML = BODY + LOGIC("{segments:[3,3,3]}");

const TEXT = (
  <div className="space-y-2 text-muted-foreground">
    <p className="text-foreground">Pick the wait pattern by how long a generation usually takes:</p>
    <ul className="list-disc space-y-1 pl-5">
      <li>
        <strong className="text-foreground">Under 10 s:</strong> Thinking Loader. Keep the person&apos;s eyes on
        the answer.
      </li>
      <li>
        <strong className="text-foreground">10 s to 2 min:</strong> Agent Run Card. Show the step it&apos;s on
        and a timer.
      </li>
      <li>
        <strong className="text-foreground">Over 2 min:</strong> Background Tasks Drawer. Let them leave and come
        back.
      </li>
    </ul>
  </div>
);

const SOURCES = [
  { label: "Thinking Loader", href: "/patterns/loaders/thinking-loader" },
  { label: "Agent Run Card", href: "/patterns/agents/agent-run-card" },
  { label: "Background Tasks Drawer", href: "/patterns/agents/background-tasks" },
];

type Step = { step: string; html?: string; ms: number };

const BUILD_V1: Step[] = [
  { step: "Reading the catalogue", ms: 900 },
  { step: "Laying out the picker", html: LAYOUT_HTML, ms: 1000 },
  { step: "Wiring the slider", html: V1_HTML, ms: 700 },
];

const BUILD_FIX: Step[] = [
  { step: "Reading the error", ms: 800 },
  { step: "Filling in the timeline", ms: 900 },
];

export default function GeneratedSurfaceDemo() {
  const [versions, setVersions] = React.useState<string[]>([]);
  const [version, setVersion] = React.useState(0);
  const [building, setBuilding] = React.useState(true);
  const [step, setStep] = React.useState<string>();
  const [partial, setPartial] = React.useState<string>();
  const [fixed, setFixed] = React.useState(false);
  const timers = React.useRef<number[]>([]);

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  const run = React.useCallback((steps: Step[], done: () => void) => {
    clear();
    timers.current.push(window.setTimeout(() => setBuilding(true), 0));
    let at = 0;
    steps.forEach((s) => {
      timers.current.push(
        window.setTimeout(() => {
          setStep(s.step);
          if (s.html) setPartial(s.html);
        }, at)
      );
      at += s.ms;
    });
    timers.current.push(
      window.setTimeout(() => {
        setBuilding(false);
        setStep(undefined);
        setPartial(undefined);
        done();
      }, at)
    );
  }, []);

  const build = React.useCallback(() => run(BUILD_V1, () => setVersions([V1_HTML])), [run]);

  React.useEffect(() => {
    build();
    return clear;
  }, [build]);

  function replay() {
    setVersions([]);
    setVersion(0);
    setFixed(false);
    setPartial(undefined);
    build();
  }

  function fix() {
    run(BUILD_FIX, () => {
      setVersions([V1_HTML, V2_HTML]);
      setVersion(1);
      setFixed(true);
    });
  }

  const html = partial ?? versions[version];

  return (
    <div className="w-full max-w-2xl space-y-3">
      <p className="ml-auto w-fit max-w-[85%] rounded-2xl bg-muted px-3 py-2 text-sm">
        Our generations take about a minute. Which loading pattern should the UI use?
      </p>
      <p className="text-sm text-muted-foreground">
        It depends on the wait, so I built a picker: drag to your typical generation time.
      </p>

      <GeneratedSurface
        title="Wait pattern picker"
        html={html}
        building={building}
        step={step}
        text={TEXT}
        version={version}
        versionCount={Math.max(versions.length, 1)}
        onVersionChange={setVersion}
        onFix={fixed ? undefined : fix}
        sources={SOURCES}
      />

      {fixed && (
        <p className="text-sm text-muted-foreground">
          Fixed: the timeline read its segments before they were set, which stopped the slider. v2 works.
        </p>
      )}

      <button
        type="button"
        onClick={replay}
        className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <RotateCcw className="size-3" aria-hidden />
        Replay
      </button>
    </div>
  );
}
