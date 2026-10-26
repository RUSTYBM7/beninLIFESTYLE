/** BENIN LIFE — GTA-pattern indigenous street missions (browser systems prototype). */
(function () {
  const POIS = [
    { id: "ikpoba_compound", name: "Your compound", lat: 6.3390, lng: 5.6505 },
    { id: "ikpoba_roadside", name: "Ikpoba Hill roadside", lat: 6.3382, lng: 5.6512 },
    { id: "ramat_park_approach", name: "Ramat Park approach", lat: 6.3355, lng: 5.6278 },
    { id: "flyover_shop", name: "Shop near flyover", lat: 6.3348, lng: 5.6285 },
    { id: "oba_market_approach", name: "Oba Market approach", lat: 6.3385, lng: 5.6220 },
    { id: "market_veg_stall", name: "Vegetable line", lat: 6.3388, lng: 5.6215 },
    { id: "market_fish_stall", name: "Fish section", lat: 6.3390, lng: 5.6212 },
    { id: "market_oil_stall", name: "Palm oil seller", lat: 6.3386, lng: 5.6218 },
    { id: "filling_station_corridor", name: "Filling station", lat: 6.3360, lng: 5.6400 },
    { id: "local_church_approach", name: "Local church", lat: 6.3375, lng: 5.6450 },
    { id: "night_spot_corridor", name: "Night spot", lat: 6.3350, lng: 5.6300 },
    { id: "school_gate_approach", name: "School gate", lat: 6.3400, lng: 5.6350 }
  ];
  const MISSIONS = [
    { id: "ikpoba_morning_errand", title: "Morning Errand — Ikpoba Hill", archetype: "Delivery / contact",
      briefing: "Neighbor package toward Ramat Park before the sun peaks.",
      steps: [
        { id: "leave", phase: "setup", objective: "Reach Ikpoba roadside.", target: "ikpoba_roadside", reward: 0 },
        { id: "meet", phase: "travel", objective: "Meet contact near Ramat Park.", target: "ramat_park_approach", reward: 0 },
        { id: "deliver", phase: "core", objective: "Deliver at flyover shop.", target: "flyover_shop", reward: 3500 },
        { id: "home", phase: "payoff", objective: "Return to compound.", target: "ikpoba_compound", reward: 500 }
      ]},
    { id: "oko_market_run", title: "Oba Market Run", archetype: "Multi-stop collection",
      briefing: "Tomatoes, smoked fish, palm oil — Mama's list. Pay cash, come back complete.",
      steps: [
        { id: "market", phase: "travel", objective: "Reach Oba Market approach.", target: "oba_market_approach", reward: 0 },
        { id: "tomatoes", phase: "core", objective: "Buy tomatoes (₦1,200).", target: "market_veg_stall", cost: 1200, reward: 0 },
        { id: "fish", phase: "core", objective: "Smoked fish (₦2,500).", target: "market_fish_stall", cost: 2500, reward: 0 },
        { id: "oil", phase: "core", objective: "Palm oil (₦1,800).", target: "market_oil_stall", cost: 1800, reward: 0 },
        { id: "return", phase: "payoff", objective: "Return home with goods.", target: "ikpoba_compound", reward: 4000 }
      ]},
    { id: "generator_fuel_hustle", title: "Fuel Before NEPA Takes Light", archetype: "Time-pressure resource",
      briefing: "Get generator fuel before light dies and the freezer spoils.",
      steps: [
        { id: "road", phase: "setup", objective: "Reach roadside.", target: "ikpoba_roadside", reward: 0 },
        { id: "station", phase: "travel", objective: "Reach filling station.", target: "filling_station_corridor", reward: 0 },
        { id: "fuel", phase: "core", objective: "Buy fuel (₦8,000).", target: "filling_station_corridor", cost: 8000, reward: 0 },
        { id: "back", phase: "payoff", objective: "Return with fuel.", target: "ikpoba_compound", reward: 2500 }
      ]},
    { id: "okada_pickup_chain", title: "Okada Side Hustle", archetype: "Fare chain",
      briefing: "Three short drops. Keep time. Settle the cut.",
      steps: [
        { id: "meet", phase: "setup", objective: "Meet contact at roadside.", target: "ikpoba_roadside", reward: 0 },
        { id: "d1", phase: "core", objective: "Drop at Ramat Park approach.", target: "ramat_park_approach", reward: 1500 },
        { id: "d2", phase: "core", objective: "Drop at flyover strip.", target: "flyover_shop", reward: 1800 },
        { id: "settle", phase: "payoff", objective: "Settle at roadside.", target: "ikpoba_roadside", reward: 2200 }
      ]},
    { id: "sunday_service_respect", title: "Sunday Service & Respect", archetype: "Social / reputation",
      briefing: "Clean clothes. Service. Help a neighbor toward home.",
      steps: [
        { id: "leave", phase: "setup", objective: "Leave for service.", target: "ikpoba_roadside", reward: 0 },
        { id: "church", phase: "travel", objective: "Reach local church.", target: "local_church_approach", reward: 0 },
        { id: "attend", phase: "core", objective: "Attend service (advance time).", target: "local_church_approach", reward: 0, rep: 3 },
        { id: "escort", phase: "payoff", objective: "Escort neighbor toward compound.", target: "ikpoba_compound", reward: 1000, rep: 2 }
      ]},
    { id: "night_spot_check", title: "Night Spot — One Round Only", archetype: "Nightlife spend control",
      briefing: "Show face. One round. Leave before the night gets long.",
      steps: [
        { id: "spot", phase: "travel", objective: "Reach night spot.", target: "night_spot_corridor", reward: 0 },
        { id: "round", phase: "core", objective: "Buy one round (₦6,000).", target: "night_spot_corridor", cost: 6000, reward: 0, rep: 2 },
        { id: "out", phase: "payoff", objective: "Leave toward Ikpoba roadside.", target: "ikpoba_roadside", reward: 1500 }
      ]},
    { id: "school_fees_pressure", title: "School Fees Deadline", archetype: "High-stakes payment",
      briefing: "Collect balance, pay fees at the gate today. No excuses.",
      steps: [
        { id: "collect", phase: "setup", objective: "Collect at flyover shop.", target: "flyover_shop", reward: 15000 },
        { id: "school", phase: "travel", objective: "Reach school gate.", target: "school_gate_approach", reward: 0 },
        { id: "pay", phase: "core", objective: "Pay fees (₦18,000).", target: "school_gate_approach", cost: 18000, reward: 0, rep: 5 },
        { id: "home", phase: "payoff", objective: "Return home — deadline met.", target: "ikpoba_compound", reward: 2000 }
      ]}
  ];
  const state = { cash: 25000, bank: 0, energy: 100, rep: 10, minutes: 480, day: 1, missionId: null, missionStep: 0, missionDone: false, completed: [], atPoi: "ikpoba_compound", ledger: [] };
  let map, playerMarker;
  function fmt(n) { return "\u20a6" + Math.trunc(n).toLocaleString("en-NG"); }
  function timeStr() { const h = Math.floor(state.minutes / 60), m = state.minutes % 60; return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0"); }
  function phaseOfDay() { const t = state.minutes; if (t < 300) return "Night"; if (t < 720) return "Morning"; if (t < 1020) return "Afternoon"; if (t < 1200) return "Evening"; return "Night"; }
  function activeMission() { return MISSIONS.find(m => m.id === state.missionId) || null; }
  function record(desc, amount) { state.ledger.unshift({ desc, amount, t: timeStr() }); if (state.ledger.length > 24) state.ledger.pop(); }
  function feedback(msg) { const el = document.getElementById("feedback"); if (el) el.textContent = msg; }
  function render() {
    document.getElementById("cash").textContent = fmt(state.cash);
    document.getElementById("bank").textContent = fmt(state.bank);
    document.getElementById("energy").textContent = String(state.energy);
    document.getElementById("rep").textContent = String(state.rep);
    document.getElementById("clock").textContent = timeStr();
    document.getElementById("dayNum").textContent = String(state.day);
    document.getElementById("phase").textContent = phaseOfDay();
    const list = document.getElementById("missionList");
    if (list) {
      list.innerHTML = MISSIONS.map(m => {
        const done = state.completed.indexOf(m.id) >= 0, active = state.missionId === m.id;
        return "<button type=\"button\" class=\"mission-pick" + (active ? " active" : "") + (done ? " done" : "") + "\" data-mid=\"" + m.id + "\">" + (done ? "\u2713 " : "") + m.title + "<small>" + m.archetype + "</small></button>";
      }).join("");
      list.querySelectorAll("[data-mid]").forEach(btn => { btn.onclick = () => startMission(btn.getAttribute("data-mid")); });
    }
    const m = activeMission();
    document.getElementById("missionTitle").textContent = m ? m.title : "Select a street mission";
    document.getElementById("missionBrief").textContent = m ? m.briefing : "GTA spine: briefing \u2192 travel \u2192 core \u2192 payoff. Indigenous Benin hustle.";
    const step = m && !state.missionDone ? m.steps[state.missionStep] : null;
    document.getElementById("objective").textContent = state.missionDone ? "Mission complete. Pick another or save." : step ? "[" + (step.phase || "core").toUpperCase() + "] " + step.objective : "\u2014";
    const stepsEl = document.getElementById("steps");
    if (m) stepsEl.innerHTML = m.steps.map((s, i) => { let cls = "step"; if (state.missionDone || i < state.missionStep) cls += " done"; else if (i === state.missionStep) cls += " active"; return "<div class=\"" + cls + "\">" + (i + 1) + ". " + (s.phase || "") + " \u2014 " + s.id + "</div>"; }).join("");
    else stepsEl.innerHTML = "";
    const can = m && !state.missionDone && step && state.atPoi === step.target && (!step.cost || state.cash >= step.cost);
    document.getElementById("btnAdvanceMission").disabled = !can;
    document.getElementById("ledger").innerHTML = state.ledger.length ? state.ledger.map(e => "<li><span>" + e.t + " \u00b7 " + e.desc + "</span><span class=\"" + (e.amount >= 0 ? "pos" : "neg") + "\">" + (e.amount >= 0 ? "+" : "") + fmt(e.amount) + "</span></li>").join("") : "<li>No transactions yet</li>";
    const poi = POIS.find(p => p.id === state.atPoi);
    if (playerMarker && poi) playerMarker.setLatLng([poi.lat, poi.lng]);
  }
  function startMission(id) {
    if (state.missionId && !state.missionDone && state.missionId !== id) { feedback("Finish current mission first."); return; }
    if (state.completed.indexOf(id) >= 0) { feedback("Already done \u2014 New game to replay."); return; }
    state.missionId = id; state.missionStep = 0; state.missionDone = false;
    feedback("Briefing: " + activeMission().title); render();
  }
  function travelTo(id) {
    const poi = POIS.find(p => p.id === id); if (!poi) return;
    if (state.energy < 5) { feedback("Too tired. Eat or advance time."); return; }
    state.atPoi = id; state.energy = Math.max(0, state.energy - 5); state.minutes = Math.min(1439, state.minutes + 20);
    feedback("Arrived: " + poi.name); render();
  }
  function completeStep() {
    const m = activeMission(); if (!m || state.missionDone) return;
    const step = m.steps[state.missionStep]; if (!step || state.atPoi !== step.target) return;
    if (step.cost) { if (state.cash < step.cost) { feedback("Not enough cash."); return; } state.cash -= step.cost; record(step.id + " cost", -step.cost); }
    if (step.reward) { state.cash += step.reward; record(step.id + " pay", step.reward); }
    if (step.rep) state.rep += step.rep;
    state.missionStep += 1;
    if (state.missionStep >= m.steps.length) { state.missionDone = true; state.completed.push(m.id); state.rep += 1; feedback("Payoff complete \u2014 " + m.title); }
    else feedback("Checkpoint cleared.");
    render();
  }
  function initMap() {
    map = L.map("map").setView([6.337, 5.635], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "&copy; OpenStreetMap", maxZoom: 19 }).addTo(map);
    POIS.forEach(p => { const mk = L.circleMarker([p.lat, p.lng], { radius: 7, color: "#e8a838", fillColor: "#e8a838", fillOpacity: 0.85 }).addTo(map); mk.bindPopup("<b>" + p.name + "</b><br><button type=\"button\" data-poi=\"" + p.id + "\">Go here</button>"); });
    const start = POIS[0];
    playerMarker = L.circleMarker([start.lat, start.lng], { radius: 11, color: "#3ecf8e", fillColor: "#3ecf8e", fillOpacity: 1, weight: 3 }).addTo(map).bindPopup("You");
    map.on("popupopen", e => { const btn = e.popup.getElement() && e.popup.getElement().querySelector("[data-poi]"); if (btn) btn.onclick = () => travelTo(btn.getAttribute("data-poi")); });
  }
  document.getElementById("btnAdvanceMission").onclick = completeStep;
  document.getElementById("btnTravel").onclick = () => { const m = activeMission(); if (!m || state.missionDone) { feedback("Select an active mission."); return; } travelTo(m.steps[state.missionStep].target); };
  document.getElementById("btnOkada").onclick = () => { if (state.cash < 500) { feedback("Need \u20a6500."); return; } state.cash -= 500; record("Okada", -500); state.energy = Math.min(100, state.energy + 5); state.minutes = Math.min(1439, state.minutes + 12); const m = activeMission(); if (m && !state.missionDone) travelTo(m.steps[state.missionStep].target); else render(); feedback("Okada."); };
  document.getElementById("btnEat").onclick = () => { if (state.cash < 800) { feedback("Not enough cash."); return; } state.cash -= 800; state.energy = Math.min(100, state.energy + 25); record("Street food", -800); feedback("Energy up."); render(); };
  document.getElementById("btnDeposit").onclick = () => { if (state.cash < 5000) { feedback("Need \u20a65,000."); return; } state.cash -= 5000; state.bank += 5000; record("Deposit", 5000); render(); };
  document.getElementById("btnWithdraw").onclick = () => { if (state.bank < 2000) { feedback("Insufficient bank."); return; } state.bank -= 2000; state.cash += 2000; record("Withdrawal", 2000); render(); };
  document.getElementById("btnTime").onclick = () => { state.minutes += 180; while (state.minutes >= 1440) { state.minutes -= 1440; state.day += 1; } state.energy = Math.min(100, state.energy + 15); feedback("Time advanced."); render(); };
  document.getElementById("btnSave").onclick = () => { localStorage.setItem("benin_life_ikpoba_v2", JSON.stringify(state)); feedback("Saved."); };
  document.getElementById("btnLoad").onclick = () => { const raw = localStorage.getItem("benin_life_ikpoba_v2"); if (!raw) { feedback("No save."); return; } Object.assign(state, JSON.parse(raw)); feedback("Loaded."); render(); };
  document.getElementById("btnReset").onclick = () => { localStorage.removeItem("benin_life_ikpoba_v2"); location.reload(); };
  initMap(); render();
})();
