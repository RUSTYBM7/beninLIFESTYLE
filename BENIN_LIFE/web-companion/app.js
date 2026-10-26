/** BENIN LIFE — Ikpoba Hill vertical-slice systems prototype (browser). Not the native UE game. */
(function () {
  const POIS = [
    { id: "ikpoba_compound", name: "Your compound", lat: 6.3390, lng: 5.6505 },
    { id: "ikpoba_roadside", name: "Ikpoba Hill roadside", lat: 6.3382, lng: 5.6512 },
    { id: "ramat_park_approach", name: "Ramat Park approach", lat: 6.3355, lng: 5.6278 },
    { id: "flyover_shop", name: "Shop near flyover", lat: 6.3348, lng: 5.6285 },
  ];

  const MISSION = {
    id: "ikpoba_morning_errand",
    title: "Morning Errand — Ikpoba Hill",
    steps: [
      { id: "leave_compound", objective: "Leave your compound and reach the roadside on Ikpoba Hill.", target: "ikpoba_roadside", reward: 0 },
      { id: "meet_contact", objective: "Meet the contact near Ramat Park approach.", target: "ramat_park_approach", reward: 0 },
      { id: "deliver_package", objective: "Deliver the package to the shop near the flyover.", target: "flyover_shop", reward: 3500 },
      { id: "return_home", objective: "Return to your compound and rest.", target: "ikpoba_compound", reward: 500 },
    ],
  };

  const state = {
    cash: 25000, bank: 0, energy: 100, rep: 10,
    minutes: 8 * 60, day: 1, missionStep: 0, missionDone: false,
    atPoi: "ikpoba_compound", ledger: [],
  };

  let map, playerMarker;

  function fmt(n) { return "\u20a6" + Math.trunc(n).toLocaleString("en-NG"); }
  function timeStr() {
    const h = Math.floor(state.minutes / 60), m = state.minutes % 60;
    return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
  }
  function phase() {
    const t = state.minutes;
    if (t < 300) return "Night";
    if (t < 720) return "Morning";
    if (t < 1020) return "Afternoon";
    if (t < 1200) return "Evening";
    return "Night";
  }
  function record(desc, amount) {
    state.ledger.unshift({ desc, amount, t: timeStr() });
    if (state.ledger.length > 20) state.ledger.pop();
  }
  function feedback(msg) { document.getElementById("feedback").textContent = msg; }

  function render() {
    document.getElementById("cash").textContent = fmt(state.cash);
    document.getElementById("bank").textContent = fmt(state.bank);
    document.getElementById("energy").textContent = String(state.energy);
    document.getElementById("rep").textContent = String(state.rep);
    document.getElementById("clock").textContent = timeStr();
    document.getElementById("dayNum").textContent = String(state.day);
    document.getElementById("phase").textContent = phase();
    document.getElementById("missionTitle").textContent = MISSION.title;
    const step = MISSION.steps[state.missionStep];
    document.getElementById("objective").textContent = state.missionDone
      ? "Errand complete. Save or start a new day." : step.objective;
    document.getElementById("steps").innerHTML = MISSION.steps.map((s, i) => {
      let cls = "step";
      if (state.missionDone || i < state.missionStep) cls += " done";
      else if (i === state.missionStep) cls += " active";
      return "<div class=\"" + cls + "\">" + (i + 1) + ". " + s.id.replace(/_/g, " ") + "</div>";
    }).join("");
    const canComplete = !state.missionDone && step && state.atPoi === step.target;
    document.getElementById("btnAdvanceMission").disabled = !canComplete;
    document.getElementById("ledger").innerHTML = state.ledger.length
      ? state.ledger.map(e => "<li><span>" + e.t + " \u00b7 " + e.desc + "</span><span class=\"" + (e.amount >= 0 ? "pos" : "neg") + "\">" + (e.amount >= 0 ? "+" : "") + fmt(e.amount) + "</span></li>").join("")
      : "<li>No transactions yet</li>";
    const poi = POIS.find(p => p.id === state.atPoi);
    if (playerMarker && poi) playerMarker.setLatLng([poi.lat, poi.lng]);
  }

  function travelTo(id) {
    const poi = POIS.find(p => p.id === id);
    if (!poi) return;
    if (state.energy < 5) { feedback("Too tired. Eat or rest (advance time)."); return; }
    state.atPoi = id;
    state.energy = Math.max(0, state.energy - 5);
    state.minutes = Math.min(1439, state.minutes + 25);
    feedback("Arrived: " + poi.name);
    render();
  }

  function initMap() {
    map = L.map("map").setView([6.337, 5.64], 14);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "&copy; OpenStreetMap", maxZoom: 19 }).addTo(map);
    POIS.forEach(p => {
      const m = L.circleMarker([p.lat, p.lng], { radius: 8, color: "#e8a838", fillColor: "#e8a838", fillOpacity: 0.9 }).addTo(map);
      m.bindPopup("<b>" + p.name + "</b><br><button type=\"button\" data-poi=\"" + p.id + "\" class=\"go-poi\">Go here</button>");
    });
    const start = POIS[0];
    playerMarker = L.circleMarker([start.lat, start.lng], { radius: 11, color: "#3ecf8e", fillColor: "#3ecf8e", fillOpacity: 1, weight: 3 }).addTo(map).bindPopup("You");
    map.on("popupopen", (e) => {
      const btn = e.popup.getElement() && e.popup.getElement().querySelector("[data-poi]");
      if (btn) btn.onclick = () => travelTo(btn.getAttribute("data-poi"));
    });
  }

  function completeStep() {
    const step = MISSION.steps[state.missionStep];
    if (!step || state.atPoi !== step.target) return;
    if (step.reward > 0) { state.cash += step.reward; record(step.id + " reward", step.reward); }
    state.rep += 1;
    state.missionStep += 1;
    if (state.missionStep >= MISSION.steps.length) {
      state.missionDone = true;
      feedback("Mission complete. You earned respect on Ikpoba Hill.");
    } else feedback("Step done. Next objective updated.");
    render();
  }

  document.getElementById("btnAdvanceMission").onclick = completeStep;
  document.getElementById("btnTravel").onclick = () => {
    if (state.missionDone) { feedback("Mission already complete."); return; }
    travelTo(MISSION.steps[state.missionStep].target);
  };
  document.getElementById("btnOkada").onclick = () => {
    if (state.cash < 500) { feedback("Not enough cash for okada."); return; }
    state.cash -= 500; record("Okada", -500);
    state.energy = Math.min(100, state.energy + 5);
    state.minutes = Math.min(1439, state.minutes + 15);
    if (!state.missionDone) travelTo(MISSION.steps[state.missionStep].target);
    else render();
    feedback("Okada ride.");
  };
  document.getElementById("btnEat").onclick = () => {
    if (state.cash < 800) { feedback("Not enough cash."); return; }
    state.cash -= 800; state.energy = Math.min(100, state.energy + 25);
    record("Street food", -800); feedback("You ate. Energy up."); render();
  };
  document.getElementById("btnDeposit").onclick = () => {
    if (state.cash < 5000) { feedback("Need \u20a65,000 cash to deposit."); return; }
    state.cash -= 5000; state.bank += 5000; record("Deposit", 5000);
    feedback("Deposited to fictional in-game bank."); render();
  };
  document.getElementById("btnWithdraw").onclick = () => {
    if (state.bank < 2000) { feedback("Insufficient bank balance."); return; }
    state.bank -= 2000; state.cash += 2000; record("Withdrawal", 2000); render();
  };
  document.getElementById("btnTime").onclick = () => {
    state.minutes += 180;
    while (state.minutes >= 1440) { state.minutes -= 1440; state.day += 1; }
    state.energy = Math.min(100, state.energy + 15);
    feedback("Time advanced."); render();
  };
  document.getElementById("btnSave").onclick = () => {
    localStorage.setItem("benin_life_ikpoba_v1", JSON.stringify(state));
    feedback("Saved on this device.");
  };
  document.getElementById("btnLoad").onclick = () => {
    const raw = localStorage.getItem("benin_life_ikpoba_v1");
    if (!raw) { feedback("No save found."); return; }
    Object.assign(state, JSON.parse(raw)); feedback("Loaded."); render();
  };
  document.getElementById("btnReset").onclick = () => {
    localStorage.removeItem("benin_life_ikpoba_v1"); location.reload();
  };

  initMap();
  render();
})();
