/* GAME: state, daily upkeep, scoring, and screen drawing. Needs data.js loaded first. */
const $ = (id) => document.getElementById(id);
let S;
function init() {
  S = {
    sol: 1,
    power: 80,
    life: 100,
    food: 100,
    health: 100,
    research: 0,
    dose: 0,
    crops: [],
    dust: 0,
    dustMode: "",
    storm: 0,
    mode: "",
    leak: 0,
    pending: [],
    done: {},
    asked: {},
    over: false,
    before: {},
  };
}
const cl = (v) => Math.max(0, Math.min(100, v));
function clampAll() {
  ["power", "life", "food", "health", "research"].forEach(
    (k) => (S[k] = cl(S[k])),
  );
}
function hit(d) {
  S.dose += d;
  S.health -= Math.round(d * 0.35);
}
function endSol() {
  const n = [];
  const gen = S.dust > 0 ? 4.8 : 12,
    up = S.dustMode === "low" && S.dust > 0 ? 3 : 8;
  S.power += gen - up;
  n.push(
    `Solar panels made ${Math.round(gen)} power; the base used ${up}.${S.dust > 0 ? " Dust is blocking the sun." : ""}`,
  );
  S.life -= 8;
  S.food -= 6;
  n.push(`The crew used 8 life support and ate 6 food.`);
  if (S.leak > 0) {
    S.life -= 5;
    S.leak--;
    n.push(`The leak lost 5 more life support.`);
  }
  if (S.power <= 0) {
    S.life -= 10;
    n.push(
      `Blackout! Heaters and pumps stopped, so life support dropped 10 extra.`,
    );
  }
  S.sol++;
  const rd = S.crops.filter((c) => c <= S.sol);
  if (rd.length) {
    S.food += 20 * rd.length;
    S.crops = S.crops.filter((c) => c > S.sol);
    n.push(`🥬 Crop harvest! Food +${20 * rd.length}.`);
  }
  if (S.life <= 0) {
    S.health -= 20;
    n.push(`No life support! Crew health -20.`);
  }
  if (S.food <= 0) {
    S.health -= 15;
    n.push(`No food! Crew health -15.`);
  }
  if (S.dust > 0) {
    S.dust--;
    if (!S.dust) {
      S.dustMode = "";
      n.push(`The dust storm cleared.`);
    }
  }
  if (S.storm > 0) {
    S.storm--;
    if (!S.storm) {
      S.mode = "";
      n.push(`The particle storm ended.`);
    }
  }
  S.pending.filter((p) => p.sol <= S.sol).forEach((p) => n.push(`📡 ${p.t}`));
  S.pending = S.pending.filter((p) => p.sol > S.sol);
  if (S.health <= 0 || S.sol > 30) S.over = true;
  return n;
}
function stars(v, a, b) {
  return v >= a ? "⭐⭐⭐" : v >= b ? "⭐⭐" : "⭐";
}
const IMG = {
  bt: "assets/images/buddy.webp",
  pi: "assets/images/astronaut-idle.webp",
  pt: "assets/images/astronaut-wave.webp",
  pj: "assets/images/astronaut-success.webp",
  base: "assets/images/mars-base.webp",
  pr_research: "assets/images/prompt-research.webp",
  pr_panels: "assets/images/prompt-panels.webp",
  pr_recycle: "assets/images/prompt-recycle.webp",
  pr_rest: "assets/images/prompt-rest.webp",
  pr_greenhouse: "assets/images/prompt-greenhouse.webp",
};
const POS = {
  idle: [44, 3],
  research: [24, 3],
  panels: [44, 3],
  recycle: [56, 3],
  greenhouse: [84, 3],
  rest: [72, 64],
  door: [31, 3],
};
const HS = {
  research: [10.6, 58.6, 11.5, 39.9, "Microscope"],
  panels: [11.6, 5.2, 31.5, 33.6, "Solar panels"],
  recycle: [60.0, 57.8, 11.3, 40, "Recycler"],
  rest: [65.6, 23, 14.8, 15, "Sleeping pod"],
  greenhouse: [72.8, 56, 23.5, 37, "Control console"],
  door: [25.2, 61.9, 11.5, 35.6, "Airlock door"],
};
const EVH = {
  6: ["recycle", "research"],
  12: ["rest", "door"],
  18: ["recycle", "door"],
  22: ["door", "rest"],
  25: ["door", "recycle"],
};
const JOBS = ["research", "panels", "recycle", "rest", "greenhouse"];
const R = [
  ["power", "⚡", "Power"],
  ["life", "❤️‍🩹", "Life support"],
  ["food", "🥬", "Food"],
  ["health", "❤️", "Crew H.P."],
  ["research", "🔬", "Research"],
  ["dose", "☢️", "Rad. dose"],
];
const app = $("app"),
  say = (h) => ($("dlgt").innerHTML = h),
  ic = (s) => ($("di").src = s);
const ph = (p) => {
  app.className = "p-" + p;
  S.ph = p;
};
function meters() {
  $("mt").innerHTML = R.map(([k, i, n]) => {
    const v = Math.min(100, Math.round(S[k])),
      lo = v < 25 && ["power", "life", "food", "health"].includes(k);
    return `<div class="${lo ? "lo" : ""}"><span>${i} ${n}</span><b>${v}</b></div>`;
  }).join("");
}
const sq = () =>
  ($("sq").innerHTML =
    `<div class="sqt">Sol<br>${Math.min(S.sol, 30)} of 30</div>`);
const sqb = (t, f) =>
  ($("sq").innerHTML = `<button class="nx" onclick="${f}">${t} ▶</button>`);
function opts() {
  const o = {};
  if (S.ph === "act")
    JOBS.forEach(
      (k) =>
        (o[k] = {
          t: `${HS[k][4]}: ${A[k].n}`,
          d: A[k].d,
          off: A[k].off && A[k].off(),
          go: () => act(k),
        }),
    );
  if (S.ph === "event") {
    const e = EV[S.sol];
    e.ch.forEach(
      (c, i) => (o[EVH[S.sol][i]] = { t: c.l, d: c.s, go: () => pick(i) }),
    );
    if (!S.asked[S.sol])
      o.greenhouse = {
        t: "Ask Earth for advice",
        d: "Earth’s reply takes 2 sols, so you still have to decide now.",
        go: ask,
      };
  }
  return o;
}
function baseHTML(o) {
  const p = POS[o.pos || "idle"],
    O = opts(),
    ks = (o.hs || []).filter((k) => O[k]);
  return `<div id="bs"${o.dim ? ' class="dim"' : ""}><img class="bi" src="${IMG.base}" alt="Cutaway of the Mars base">${ks
    .map((k) => {
      const h = HS[k];
      return `<button class="hs" aria-label="${O[k].t}" style="left:${h[0]}%;top:${h[1]}%;width:${h[2]}%;height:${h[3]}%" onclick="hsClick('${k}')" onmouseenter="hv('${k}')" onfocus="hv('${k}')" onmouseleave="unhv()" onblur="unhv()"></button><i class="hand" style="left:${h[0] + h[2] / 2}%;top:${h[1] + h[3] * 0.6}%"></i>`;
    })
    .join(
      "",
    )}<img class="ast" alt="The astronaut" src="${IMG[o.spr || "pi"]}" style="left:${p[0]}%;bottom:${p[1]}%"></div>`;
}
function hv(k) {
  if (S.sel) return;
  const o = opts()[k];
  if (!o) return;
  ic(IMG["pr_" + k] || IMG.bt);
  say(`<p><b>${o.t}</b></p><p>${o.off || o.d}</p>`);
}
function unhv() {
  if (!S.sel) {
    say(S.def);
    ic(IMG.bt);
  }
}
function hsClick(k) {
  const o = opts()[k];
  if (!o) return;
  if (o.off) {
    say(`<p><b>${o.t}</b></p><p>${o.off}</p>`);
    return;
  }
  if (matchMedia("(hover:none)").matches && S.sel !== k) {
    S.sel = k;
    ic(IMG["pr_" + k] || IMG.bt);
    say(`<p><b>${o.t}</b></p><p>${o.d} Tap again to do it.</p>`);
    return;
  }
  S.sel = null;
  o.go();
}
function welcome() {
  init();
  ph("welcome");
  meters();
  $("stage").innerHTML =
    `<div class="wt"><p>You run a small base on Mars for 30 sols (a sol is one Martian day). Each sol you pick one job. Keep power, life support and food up, protect the crew, and do research.</p><p>Earth is far away. Its answers take time, so you must decide for yourself.</p><p>Welcome, Junior Astronaut!</p></div>`;
  $("cta").innerHTML =
    `<button class="cta" onclick="startSol()">Start mission</button>`;
}
function startSol() {
  S.before = {
    power: S.power,
    life: S.life,
    food: S.food,
    health: S.health,
    research: S.research,
    dose: S.dose,
  };
  meters();
  EV[S.sol] && !S.done[S.sol] ? showEvent() : showActs();
}
function realCard() {
  return `<div class="rn"><b>Real NASA data (DONKI):</b> solar flare ${DONKI.cls}, ${DONKI.date}, ${DONKI.region}. ID ${DONKI.id}. <i>${DONKI.live ? "Loaded live from the NASA API." : "Saved NASA record."}</i> <a href="${DONKI.link}" target="_blank" rel="noopener">NASA record</a><br>Curiosity measured about 8,100 micrograys on Mars in May 2024, like 30 chest X-rays (<a href="https://www.space.com/powerful-solar-storm-mars-radiation-astronaut-missions" target="_blank" rel="noopener">Space.com</a>).<br><b class="sim">Simulated:</b> the radiation “game units” in this game are made up.</div>`;
}
function renderEv() {
  const e = EV[S.sol];
  $("stage").innerHTML =
    baseHTML({ dim: 0, hs: EVH[S.sol].concat(["greenhouse"]) }) +
    (e.real ? realCard() : "");
}
function showEvent() {
  const e = EV[S.sol];
  ph("event");
  S.sel = null;
  ic(IMG.bt);
  S.def = `<p>${e.b}</p>`;
  renderEv();
  say(S.def);
  sq();
}
function ask() {
  S.pending.push({ sol: S.sol + 2, t: EV[S.sol].earth });
  S.asked[S.sol] = 1;
  S.def = `<p><b>Message sent!</b> Earth will reply on sol ${S.sol + 2}. Decide for yourself now.</p><p>${EV[S.sol].b}</p>`;
  renderEv();
  say(S.def);
  ic(IMG.bt);
}
function pick(i) {
  const e = EV[S.sol],
    c = e.ch[i],
    k = EVH[S.sol][i];
  S.done[S.sol] = 1;
  const r = c.f();
  clampAll();
  meters();
  ph("evres");
  S.sel = null;
  ic(IMG.bt);
  $("stage").innerHTML = baseHTML({ pos: k, spr: "pt" });
  say(`<p>${r}</p><p>Science: ${c.sci}</p><p>Continue with Sol ${S.sol}.</p>`);
  sqb(`Sol ${S.sol}`, "showActs()");
}
function showActs() {
  ph("act");
  S.sel = null;
  ic(IMG.bt);
  S.def = `<p>Pick a job for this sol, Commander. Select a component to do task.</p>`;
  $("stage").innerHTML = baseHTML({ hs: JOBS });
  say(S.def);
  sq();
}
function act(k) {
  const r = A[k].f(),
    notes = endSol();
  clampAll();
  meters();
  const b = S.before,
    E = {
      power: "⚡",
      life: "❤️‍🩹",
      food: "🥬",
      health: "❤️",
      research: "🔬",
      dose: "☢️",
    };
  const ch = Object.keys(E)
    .map((x) => {
      const d = Math.round(S[x] - b[x]);
      return d ? `${d > 0 ? "+" : ""}${d}${E[x]}` : "";
    })
    .filter(Boolean)
    .join(", ");
  const sp = notes.slice(2).concat(r.length > 70 ? [r] : []);
  ph("result");
  S.sel = null;
  ic(IMG.bt);
  $("stage").innerHTML = baseHTML({ pos: k, spr: "pt" });
  say(
    `<p>Changes today: ${ch || "none"}</p>${sp.length ? `<p class="sm">${sp.join(" ")}</p>` : ""}<p>Science: ${A[k].sci}</p><p>Sol ${Math.min(S.sol - 1, 30)} out of 30 completed.</p>`,
  );
  S.over ? sqb("See report", "report()") : sqb("Next sol", "startSol()");
}
function report() {
  clampAll();
  const sup = Math.round((S.power + S.life + S.food) / 3),
    ok = S.health > 0,
    good = ok && S.research >= 35,
    tot = Math.round(S.health + sup + S.research);
  let best = "";
  try {
    const p = +localStorage.getItem("marsbase-best") || 0;
    if (tot > p && ok) localStorage.setItem("marsbase-best", tot);
    best = `Best score on this device: ${Math.max(p, ok ? tot : 0)}.`;
  } catch (e) {}
  const why = ok
    ? ""
    : S.life <= 0
      ? `Life support ran out. Recycle air and water more often. `
      : S.food <= 0
        ? `Food ran out. Plant crops early, they take 5 sols. `
        : S.dose >= 30
          ? `Radiation hurt the crew. Shelter during a flare. `
          : `The crew got too tired and hurt. `;
  const sr = [
    ["Crew safety", stars(S.health, 75, 40)],
    ["Supplies", stars(sup, 60, 30)],
    ["Research", stars(S.research, 60, 35)],
  ];
  const msg = good
    ? `Mission complete! The crew made it to sol 30!`
    : ok
      ? `We made it, but we can do better!`
      : `The crew could not survive. Try a new plan!`;
  ph("over");
  meters();
  S.sel = null;
  $("stage").innerHTML =
    `<img class="og" alt="The astronaut" src="${IMG[good ? "pj" : "pi"]}"><div class="ga"><div class="gh"><img alt="" src="${IMG.bt}"><span>Buddy’s analysis:</span></div><p>${msg}</p><p>${why}${S.dose >= 30 ? `You took a radiation risk to get more science. Would you shelter next time?` : `You kept the crew shielded from radiation.`}</p><p>Try a different strategy: shelter or work through the flare, low-power mode or full power, and see how the ending changes.</p><p>Total score: ${tot}. ${best}</p></div>`;
  $("st").innerHTML =
    sr
      .map(
        ([n, s]) =>
          `<div><span>${n}</span><b aria-label="${s.length} of 3 stars">${s}</b></div>`,
      )
      .join("") +
    `<div><span>Radiation (sim)</span><b>${Math.min(100, Math.round(S.dose))}%</b></div><div><span>Sol survived</span><b>${Math.min(S.sol - 1, 30)}</b></div>`;
  $("cta").innerHTML =
    `<button class="cta" onclick="welcome()">Play again</button>`;
}

welcome();
