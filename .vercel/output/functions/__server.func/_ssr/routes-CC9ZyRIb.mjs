import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Map$1, i as Phone, n as Volume2, o as CloudRain, s as BookOpen, t as VolumeX } from "../_libs/lucide-react.mjs";
import { A as SphereGeometry, C as PointLight, D as SRGBColorSpace, E as RepeatWrapping, M as Timer, N as Vector3, O as Scene, S as PlaneGeometry, T as PointsMaterial, _ as Mesh, a as BufferGeometry, b as Object3D, c as Color, d as Float32BufferAttribute, f as FogExp2, g as InstancedMesh, h as InstancedBufferAttribute, i as BufferAttribute, j as SpotLight, k as ShaderMaterial, l as CylinderGeometry, m as HemisphereLight, n as WebGLRenderer, o as CanvasTexture, p as Group, r as BoxGeometry, s as CircleGeometry, t as mergeGeometries, u as DirectionalLight, v as MeshBasicMaterial, w as Points, x as PerspectiveCamera, y as MeshStandardMaterial } from "../_libs/three.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CC9ZyRIb.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var bridge = {
	api: null,
	pendingNew: null,
	pendingContinue: false
};
function startNew(cfg) {
	if (bridge.api) bridge.api.startNew(cfg);
	else bridge.pendingNew = cfg;
}
function continueGame() {
	if (bridge.api) bridge.api.continueGame();
	else bridge.pendingContinue = true;
}
function callApi(run) {
	if (bridge.api) run(bridge.api);
}
var ECON = {
	rent: 1200,
	ramat: 22e3,
	fuel: 400,
	hire: 500,
	errand: 2200,
	fare: 1400,
	practice: 600
};
var GOODS = {
	puff: {
		name: "Puff-puff",
		price: 300,
		hunger: 18,
		energy: 4
	},
	water: {
		name: "Sachet water",
		price: 100,
		hunger: 6,
		energy: 10
	},
	rice: {
		name: "Rice plate",
		price: 700,
		hunger: 42,
		energy: 8
	}
};
var CityAudio = class {
	ctx = null;
	master = null;
	engineOsc = null;
	engineGain = null;
	rainGain = null;
	bedGain = null;
	stepPhase = 0;
	muted = false;
	unlock() {
		if (!this.ctx) {
			const ctx = new AudioContext();
			const master = ctx.createGain();
			master.gain.value = .22;
			master.connect(ctx.destination);
			const bed = ctx.createOscillator();
			bed.type = "sine";
			bed.frequency.value = 82;
			const bedFilter = ctx.createBiquadFilter();
			bedFilter.type = "lowpass";
			bedFilter.frequency.value = 220;
			const bedGain = ctx.createGain();
			bedGain.gain.value = .08;
			bed.connect(bedFilter);
			bedFilter.connect(bedGain);
			bedGain.connect(master);
			bed.start();
			const noise = ctx.createBufferSource();
			const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
			const data = buffer.getChannelData(0);
			for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
			noise.buffer = buffer;
			noise.loop = true;
			const rainFilter = ctx.createBiquadFilter();
			rainFilter.type = "highpass";
			rainFilter.frequency.value = 700;
			const rainGain = ctx.createGain();
			rainGain.gain.value = 0;
			noise.connect(rainFilter);
			rainFilter.connect(rainGain);
			rainGain.connect(master);
			noise.start();
			const engineOsc = ctx.createOscillator();
			engineOsc.type = "sawtooth";
			engineOsc.frequency.value = 70;
			const engineFilter = ctx.createBiquadFilter();
			engineFilter.type = "lowpass";
			engineFilter.frequency.value = 420;
			const engineGain = ctx.createGain();
			engineGain.gain.value = 0;
			engineOsc.connect(engineFilter);
			engineFilter.connect(engineGain);
			engineGain.connect(master);
			engineOsc.start();
			this.ctx = ctx;
			this.master = master;
			this.engineOsc = engineOsc;
			this.engineGain = engineGain;
			this.rainGain = rainGain;
			this.bedGain = bedGain;
		}
		if (this.ctx.state === "suspended") this.ctx.resume();
	}
	setMuted(muted) {
		this.muted = muted;
		if (this.master && this.ctx) this.master.gain.setTargetAtTime(muted ? 0 : .22, this.ctx.currentTime, .05);
	}
	update(dt, state) {
		if (!this.ctx || !this.engineOsc || !this.engineGain || !this.rainGain || !this.bedGain) return;
		const now = this.ctx.currentTime;
		const drive = state.driving ? Math.min(1, Math.abs(state.speed) / 14) : 0;
		this.engineGain.gain.setTargetAtTime(state.driving ? .045 + drive * .08 : 0, now, .08);
		this.engineOsc.frequency.setTargetAtTime(68 + drive * 90 + (state.speed < 0 ? -12 : 0), now, .08);
		this.rainGain.gain.setTargetAtTime(state.raining ? .18 : 0, now, .4);
		this.bedGain.gain.setTargetAtTime(.04 + state.market * .08 + (state.raining ? .02 : 0), now, .3);
		if (state.walking) {
			this.stepPhase += dt * (3.2 + Math.min(6, state.speed));
			if (this.stepPhase > 1) {
				this.stepPhase = 0;
				this.blip(180 + Math.random() * 80, .03, .04);
			}
		} else this.stepPhase = 0;
	}
	horn() {
		this.blip(440, .09, .07, "square");
	}
	coin() {
		this.blip(520, .07, .05);
		window.setTimeout(() => this.blip(780, .1, .05), 90);
	}
	thud() {
		this.blip(90, .12, .08, "triangle");
	}
	blip(freq, dur, gain, type = "sine") {
		if (!this.ctx || !this.master || this.muted) return;
		const osc = this.ctx.createOscillator();
		const amp = this.ctx.createGain();
		osc.type = type;
		osc.frequency.value = freq;
		amp.gain.value = gain;
		osc.connect(amp);
		amp.connect(this.master);
		osc.start();
		amp.gain.exponentialRampToValueAtTime(1e-4, this.ctx.currentTime + dur);
		osc.stop(this.ctx.currentTime + dur + .02);
	}
	dispose() {
		this.ctx?.close();
		this.ctx = null;
	}
};
var ADESUWA = {
	x: -13.2,
	z: -16.6
};
var UNION_YARD = {
	x: 3.2,
	z: 9.4
};
var NIGHT_CORNER = {
	x: 66,
	z: -214
};
var FACTIONS = [
	{
		id: "union",
		name: "Hill Union",
		hold: "Okada, rent, the slope"
	},
	{
		id: "market",
		name: "Oregbeni Circle",
		hold: "Prices, credit, names"
	},
	{
		id: "guild",
		name: "Bronze Shade",
		hold: "Skill, patronage, face"
	},
	{
		id: "night",
		name: "Night Line",
		hold: "The park after dark"
	}
];
function clamp$1(v, a = 0, b = 100) {
	return Math.max(a, Math.min(b, v));
}
function defaultSocial() {
	return {
		respect: {
			union: 18,
			market: 16,
			guild: 12,
			night: 8
		},
		heat: 0,
		partner: "none",
		loyalty: 0,
		mood: "wary",
		promise: "none",
		checkedDay: -1,
		bark: ""
	};
}
function clampSocial(s) {
	Object.keys(s.respect).forEach((id) => {
		s.respect[id] = clamp$1(s.respect[id]);
	});
	s.heat = clamp$1(s.heat);
	s.loyalty = clamp$1(s.loyalty);
}
function applyMeet(s, tone) {
	s.partner = "adesuwa";
	if (tone === "kin") {
		s.loyalty = 64;
		s.mood = "warm";
		s.respect.market += 10;
		s.respect.guild += 4;
		clampSocial(s);
		return "Adesuwa calls you cousin before you have earned it. The market will price you softer. Kinship here is a loan.";
	}
	if (tone === "business") {
		s.loyalty = 42;
		s.mood = "proud";
		s.respect.night += 8;
		s.respect.union += 6;
		s.respect.market -= 4;
		clampSocial(s);
		return "She nods like a contract. Proud, not tender. Night Line will hear you are ambitious. Mama Eki will hear it too.";
	}
	s.loyalty = 48;
	s.mood = "wary";
	s.respect.union += 4;
	clampSocial(s);
	return "Straight talk. She does not smile. Wary is safer than a performance. She will ride when the job is clean.";
}
function applyCall(s) {
	if (s.partner !== "adesuwa") return "The phone has no one who will pick up for you. Adesuwa is by the Oregbeni board.";
	if (s.mood === "strained" || s.promise === "broken") return "Adesuwa lets it ring. Strained people do not perform loyalty for an audience.";
	if (s.promise === "rice" || s.promise === "clear") return "She already asked. A promise still open is louder than a new one.";
	if (s.mood === "warm") {
		s.promise = "rice";
		return "Bring rice from Mama Eki. Not cash. In this city a plate is a treaty.";
	}
	if (s.mood === "proud") {
		s.respect.guild += 4;
		clampSocial(s);
		return "She wants Bronze Shade before dark. Pride is a bill. Practise the pour, then call her back with your hands dirty.";
	}
	s.promise = "clear";
	return "Stay off the Night Line until morning. She will know if the park learns your name.";
}
function applyRice(s) {
	if (s.partner !== "adesuwa" || s.promise !== "rice") return null;
	s.promise = "kept";
	s.loyalty += 22;
	s.mood = "warm";
	s.respect.market += 8;
	s.heat = Math.max(0, s.heat - 6);
	clampSocial(s);
	return "She takes the rice like a treaty. Oregbeni will hear you kept a small word. Small words run this city.";
}
function applySide(s, id) {
	if (id === "night" && s.promise === "clear") {
		s.promise = "broken";
		s.loyalty = Math.max(0, s.loyalty - 28);
		s.mood = "strained";
	}
	if (id === "union") {
		s.respect.union += 16;
		s.respect.night -= 12;
		s.respect.market -= 3;
		s.heat += 16;
		clampSocial(s);
		return {
			pay: 1800,
			line: "Hill Union pays the slope tax in cash. Night Line marks the slight. Heat climbs whether you feel it or not."
		};
	}
	if (id === "night") {
		s.respect.night += 18;
		s.respect.union -= 16;
		s.respect.guild -= 8;
		s.respect.market -= 10;
		s.heat += 30;
		clampSocial(s);
		return {
			pay: 2800,
			line: `Night Line cash is heavier and louder.${s.promise === "broken" ? " Adesuwa will hear before you reach the hill. You broke the clear-night promise." : ""} The task force reads this kind of money.`
		};
	}
	s.respect.guild += 14;
	s.respect.market += 6;
	s.heat = Math.max(0, s.heat - 8);
	s.loyalty += s.partner === "adesuwa" ? 6 : 0;
	if (s.mood === "proud") s.mood = "warm";
	clampSocial(s);
	return {
		pay: -200,
		line: "You buy wax and waste a pour at Bronze Shade. It is a fictional stall, not an Igun Street guild object. Your hands get better. The street gets quieter."
	};
}
function mamaRefusesRice(s) {
	return s.respect.night >= 42 && s.respect.market <= 30;
}
function fareBonus(s) {
	if (s.partner === "adesuwa" && s.loyalty >= 40 && s.mood !== "strained") return 1.28;
	return 1;
}
function allowHaggle(s, rel, skill) {
	if (s.partner === "adesuwa" && s.mood === "warm" && s.loyalty >= 50) return true;
	return rel >= 1 || skill >= 1;
}
function drift(s, dt) {
	s.heat = clamp$1(s.heat - dt * .22);
	if (s.partner === "adesuwa" && s.mood === "warm") s.loyalty = clamp$1(s.loyalty + dt * .04);
	if (s.mood === "strained") s.loyalty = clamp$1(s.loyalty - dt * .015);
}
function cityPressure(s, ctx) {
	let line = null;
	let take = 0;
	let slow = 1;
	const night = ctx.minutes >= 1140 || ctx.minutes < 330;
	const inPark = (ctx.x - 78) ** 2 + (ctx.z + 230) ** 2 < 1156;
	if (night && inPark && s.respect.union > s.respect.night + 14 && s.bark !== `park-${ctx.day}`) {
		s.bark = `park-${ctx.day}`;
		s.heat = clamp$1(s.heat + 6);
		line = "After dark the park belongs to Night Line. They have clocked the Union on you.";
	}
	const onSlope = ctx.z < -36 && ctx.z > -140 && Math.abs(ctx.x) < 24 && ctx.z !== 0;
	if (s.heat >= 58 && s.checkedDay !== ctx.day && onSlope) {
		s.checkedDay = ctx.day;
		take = Math.min(300, Math.max(0, ctx.naira));
		s.heat = clamp$1(s.heat - 12);
		slow = .3;
		line = "Task force on Ikpoba Slope. No paperwork. ₦300 leaves your hand and they wave the corridor open.";
	}
	if (Math.abs(ctx.z + 40) < 18 && ctx.x > -40 && ctx.x < 20 && s.respect.market < 12 && s.respect.night > 40 && s.bark !== `mkt-${ctx.day}`) {
		s.bark = `mkt-${ctx.day}`;
		line = "Oregbeni goes quiet when you pass. A market can refuse a person without raising its voice.";
	}
	return {
		line,
		take,
		slow
	};
}
function sleepSocial(s) {
	const broke = s.promise === "rice" || s.promise === "clear";
	if (broke) {
		s.promise = "broken";
		s.loyalty = clamp$1(s.loyalty - 24);
		s.mood = "strained";
	} else if (s.promise === "kept") {
		s.promise = "none";
		s.loyalty = clamp$1(s.loyalty + 4);
	}
	s.heat = clamp$1(s.heat - 14);
	s.checkedDay = -1;
	s.bark = "";
	if (!broke && s.mood === "strained" && s.loyalty > 36) s.mood = "wary";
	return broke ? "You slept on an open promise. Adesuwa counts that as a broken word. The morning is colder." : null;
}
function biasForBackground(s, background) {
	if (background === "student") s.respect.market = 26;
	if (background === "apprentice") s.respect.guild = 30;
	if (background === "trader") s.respect.union = 34;
}
var keys = /* @__PURE__ */ new Set();
var pad = {
	joyX: 0,
	joyY: 0,
	joy: false,
	run: false,
	interact: false,
	mount: false,
	horn: false
};
/** Same sign as production steer: +1 is left, -1 is right. Null means keys/stick win. */
var steerOverride = null;
function setKeys(codes) {
	keys.clear();
	for (const code of codes) keys.add(code);
}
function setSteer(v) {
	steerOverride = v;
}
function consume(flag) {
	const value = pad[flag];
	pad[flag] = false;
	return value;
}
var KEY = "benin-life-v2";
function loadSave() {
	if (typeof localStorage === "undefined") return null;
	try {
		const raw = localStorage.getItem(KEY) ?? localStorage.getItem("benin-life-v1");
		if (!raw) return null;
		const data = JSON.parse(raw);
		if (!data || data.version !== 1 && data.version !== 2 || typeof data.naira !== "number") return null;
		if (!data.social) data.social = defaultSocial();
		return data;
	} catch {
		return null;
	}
}
function writeSave(data) {
	if (typeof localStorage === "undefined") return;
	try {
		localStorage.setItem(KEY, JSON.stringify(data));
	} catch {}
}
var initialHud = {
	ready: false,
	error: null,
	phase: "title",
	panel: null,
	name: "",
	background: "student",
	naira: 0,
	day: 1,
	minutes: 410,
	hunger: 20,
	energy: 90,
	debt: 0,
	place: "Ikpoba Hill",
	prompt: null,
	objective: "Wake, then step out onto the hill.",
	moment: null,
	speed: 0,
	mode: "foot",
	ride: null,
	fuel: 100,
	raining: false,
	muted: false,
	px: 0,
	pz: 0,
	yaw: 0,
	inv: {
		puff: 0,
		water: 0,
		rice: 0
	},
	skill: 0,
	rel: 0,
	flags: {},
	job: null,
	stallStep: 0,
	stallProfit: 0,
	home: "hill",
	rentDue: 1200,
	carUnlocked: false,
	social: defaultSocial(),
	reelT: 0
};
var useHud = create((set) => ({
	...initialHud,
	patch: (partial) => set(partial)
}));
var HILL_SPAWN = {
	x: -15.2,
	z: 10.2,
	yaw: -Math.PI / 2
};
var RAMAT_SPAWN = {
	x: 50.2,
	z: -200,
	yaw: Math.PI / 2
};
var PARK = {
	x: 78,
	z: -230,
	r: 22
};
var MAMA = {
	x: -30,
	z: -48
};
var BOARD = {
	x: -16,
	z: -18
};
var DRAIN = {
	x: 16,
	z: -58
};
var HERITAGE = {
	x: 68,
	z: -214
};
var KIOSK = {
	x: -22,
	z: -48
};
var FUEL = {
	x: -8,
	z: -30
};
var FARE_PICK = {
	x: -4,
	z: -40
};
var FARE_DROP = {
	x: 70,
	z: -222
};
var ERRAND_DROP = {
	x: -8.2,
	z: 10.2
};
var ROADS = [
	{
		id: "hill",
		name: "Ikpoba Slope",
		level: 0,
		width: 11,
		points: [
			{
				x: 0,
				z: 58,
				y: 0
			},
			{
				x: 0,
				z: 6,
				y: 0
			},
			{
				x: 5,
				z: -46,
				y: 0
			},
			{
				x: 12,
				z: -110,
				y: 0
			},
			{
				x: 18,
				z: -175,
				y: 0
			},
			{
				x: 24,
				z: -228,
				y: 0
			},
			{
				x: 30,
				z: -250,
				y: 1.4
			},
			{
				x: 36,
				z: -278,
				y: 1.4
			},
			{
				x: 44,
				z: -308,
				y: .1
			}
		]
	},
	{
		id: "market",
		name: "Oregbeni Lane",
		level: 0,
		width: 9,
		points: [{
			x: -125,
			z: -40,
			y: 0
		}, {
			x: 115,
			z: -30,
			y: 0
		}]
	},
	{
		id: "ramat-ground",
		name: "Ramat ground junction",
		level: 0,
		width: 13,
		points: [{
			x: -170,
			z: -175,
			y: 0
		}, {
			x: 180,
			z: -175,
			y: 0
		}]
	},
	{
		id: "ramp-west",
		name: "Flyover west ramp",
		level: 1,
		width: 9,
		points: [
			{
				x: -158,
				z: -175,
				y: 0
			},
			{
				x: -124,
				z: -175,
				y: 2.5
			},
			{
				x: -100,
				z: -175,
				y: 5.2
			},
			{
				x: -78,
				z: -175,
				y: 7.45
			}
		]
	},
	{
		id: "deck",
		name: "Ramat Park Flyover",
		level: 1,
		width: 10,
		points: [{
			x: -78,
			z: -175,
			y: 7.45
		}, {
			x: 94,
			z: -175,
			y: 7.45
		}]
	},
	{
		id: "ramp-east",
		name: "Flyover east ramp",
		level: 1,
		width: 9,
		points: [
			{
				x: 94,
				z: -175,
				y: 7.45
			},
			{
				x: 116,
				z: -175,
				y: 4.6
			},
			{
				x: 136,
				z: -175,
				y: 1.8
			},
			{
				x: 162,
				z: -175,
				y: 0
			}
		]
	}
];
var ROAD_BY_ID = new Map(ROADS.map((road) => [road.id, road]));
function roadById(id) {
	const road = ROAD_BY_ID.get(id);
	if (!road) throw new Error(`Unknown road ${id}`);
	return road;
}
function roadLength(road) {
	let length = 0;
	for (let i = 1; i < road.points.length; i++) {
		const a = road.points[i - 1];
		const b = road.points[i];
		length += Math.hypot(b.x - a.x, b.z - a.z);
	}
	return length;
}
function pointOnRoad(road, dist) {
	const total = roadLength(road);
	let d = (dist % total + total) % total;
	const pts = road.points;
	for (let i = 1; i < pts.length; i++) {
		const a = pts[i - 1];
		const b = pts[i];
		const seg = Math.hypot(b.x - a.x, b.z - a.z) || 1e-4;
		if (d <= seg || i === pts.length - 1) {
			const t = Math.max(0, Math.min(1, d / seg));
			return {
				x: a.x + (b.x - a.x) * t,
				z: a.z + (b.z - a.z) * t,
				y: a.y + (b.y - a.y) * t,
				tx: (b.x - a.x) / seg,
				tz: (b.z - a.z) / seg
			};
		}
		d -= seg;
	}
	const last = pts[pts.length - 1];
	return {
		x: last.x,
		z: last.z,
		y: last.y,
		tx: 0,
		tz: -1
	};
}
function querySurface(x, z, currentY) {
	let best = null;
	let bestScore = Infinity;
	for (const road of ROADS) {
		const hw = road.width * .5;
		const pts = road.points;
		for (let i = 1; i < pts.length; i++) {
			const a = pts[i - 1];
			const b = pts[i];
			const abx = b.x - a.x;
			const abz = b.z - a.z;
			const len2 = abx * abx + abz * abz || 1;
			let t = ((x - a.x) * abx + (z - a.z) * abz) / len2;
			t = Math.max(0, Math.min(1, t));
			const cx = a.x + abx * t;
			const cz = a.z + abz * t;
			const dist = Math.hypot(x - cx, z - cz);
			if (dist > hw) continue;
			const y = a.y + (b.y - a.y) * t;
			const score = Math.abs(y - currentY) * 6 + dist * .03;
			if (score < bestScore) {
				bestScore = score;
				best = {
					y,
					cx,
					cz,
					dist,
					hw,
					level: road.level,
					roadId: road.id
				};
			}
		}
	}
	return best;
}
function constrainElevated(x, z, y) {
	if (y < 1.15) return {
		x,
		z
	};
	const hit = querySurface(x, z, y);
	if (!hit || hit.level === 0 || hit.y < 1.15) return {
		x,
		z
	};
	const limit = hit.hw - .55;
	if (hit.dist > limit && hit.dist > .001) {
		const k = limit / hit.dist;
		return {
			x: hit.cx + (x - hit.cx) * k,
			z: hit.cz + (z - hit.cz) * k
		};
	}
	return {
		x,
		z
	};
}
function hash(n) {
	const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
	return x - Math.floor(x);
}
var TINTS = [
	15194051,
	14205860,
	13351066,
	14012612,
	14992040,
	13226180,
	15259848,
	12035212
];
function reserved(x, z) {
	if (x > -26 && x < -3 && z > -4 && z < 28) return true;
	if (x > 40 && x < 64 && z > -214 && z < -184) return true;
	if ((x - PARK.x) ** 2 + (z - PARK.z) ** 2 < (PARK.r + 6) ** 2) return true;
	if (Math.abs(z + 175) < 22 && x > -8 && x < 48) return true;
	if (x > -58 && x < 2 && z > -62 && z < -18) return true;
	if (z < -240) return true;
	return false;
}
function overlaps(blocks, x, z) {
	for (const block of blocks) if (Math.hypot(block.x - x, block.z - z) < 10) return true;
	return false;
}
function buildBlocks() {
	const blocks = [];
	let n = 1;
	for (const road of ROADS) {
		if (road.level === 1) continue;
		const length = roadLength(road);
		for (let d = 16; d < length - 16; d += 15) {
			const p = pointOnRoad(road, d);
			const nx = -p.tz;
			const nz = p.tx;
			for (const side of [-1, 1]) {
				const setback = road.width * .5 + 6.2;
				const x = p.x + nx * side * setback;
				const z = p.z + nz * side * setback;
				n += 1;
				if (reserved(x, z) || overlaps(blocks, x, z)) continue;
				const hsh = hash(n * 19.1);
				const w = 7.2 + hash(n * 3.7) * 4.8;
				const depth = 6.4 + hash(n * 5.1) * 3.2;
				const tall = road.id === "hill" ? 15 : 9;
				const h = 4.2 + hash(n * 11.3) * tall;
				const faceX = -side * nx;
				const faceZ = -side * nz;
				blocks.push({
					x,
					z,
					w,
					d: depth,
					h,
					yaw: Math.atan2(faceX, faceZ),
					tint: TINTS[n % TINTS.length],
					shop: hsh > .58
				});
				if (blocks.length >= 130) return blocks;
			}
		}
	}
	return blocks;
}
var BLOCKS = buildBlocks();
function aabbOf(x, z, w, d, yaw, pad = .15) {
	const hx = w / 2;
	const hz = d / 2;
	const c = Math.cos(yaw);
	const s = Math.sin(yaw);
	let minX = Infinity;
	let maxX = -Infinity;
	let minZ = Infinity;
	let maxZ = -Infinity;
	for (const lx of [-hx, hx]) for (const lz of [-hz, hz]) {
		const wx = x + c * lx + s * lz;
		const wz = z - s * lx + c * lz;
		minX = Math.min(minX, wx);
		maxX = Math.max(maxX, wx);
		minZ = Math.min(minZ, wz);
		maxZ = Math.max(maxZ, wz);
	}
	return {
		minX: minX - pad,
		maxX: maxX + pad,
		minZ: minZ - pad,
		maxZ: maxZ + pad
	};
}
var PILLARS = [];
for (let x = -62; x <= 82; x += 16) {
	PILLARS.push({
		x,
		z: -180.15
	});
	PILLARS.push({
		x,
		z: -169.85
	});
}
var HOME_WALLS = [
	{
		minX: -19.4,
		maxX: -19,
		minZ: 2,
		maxZ: 20
	},
	{
		minX: -19,
		maxX: -9,
		minZ: 2,
		maxZ: 2.45
	},
	{
		minX: -19,
		maxX: -9,
		minZ: 19.55,
		maxZ: 20
	},
	{
		minX: -9.45,
		maxX: -9,
		minZ: 2,
		maxZ: 8.15
	},
	{
		minX: -9.45,
		maxX: -9,
		minZ: 12.25,
		maxZ: 20
	}
];
var RAMAT_WALLS = [
	{
		minX: 56,
		maxX: 56.45,
		minZ: -208,
		maxZ: -190
	},
	{
		minX: 44,
		maxX: 56,
		minZ: -208,
		maxZ: -207.55
	},
	{
		minX: 44,
		maxX: 56,
		minZ: -190.45,
		maxZ: -190
	},
	{
		minX: 44,
		maxX: 44.45,
		minZ: -208,
		maxZ: -202.3
	},
	{
		minX: 44,
		maxX: 44.45,
		minZ: -198.1,
		maxZ: -190
	}
];
var SOLIDS = [
	...BLOCKS.map((block) => aabbOf(block.x, block.z, block.w, block.d, block.yaw)),
	...HOME_WALLS,
	...RAMAT_WALLS,
	...PILLARS.map((pillar) => ({
		minX: pillar.x - .55,
		maxX: pillar.x + .55,
		minZ: pillar.z - .55,
		maxZ: pillar.z + .55
	}))
];
function resolveCircle(x, z, radius) {
	for (let pass = 0; pass < 2; pass++) for (const solid of SOLIDS) {
		const cx = Math.max(solid.minX, Math.min(x, solid.maxX));
		const cz = Math.max(solid.minZ, Math.min(z, solid.maxZ));
		let dx = x - cx;
		let dz = z - cz;
		const d2 = dx * dx + dz * dz;
		if (d2 === 0) {
			const left = x - solid.minX;
			const right = solid.maxX - x;
			const up = z - solid.minZ;
			const down = solid.maxZ - z;
			const min = Math.min(left, right, up, down);
			if (min === left) x = solid.minX - radius;
			else if (min === right) x = solid.maxX + radius;
			else if (min === up) z = solid.minZ - radius;
			else z = solid.maxZ + radius;
		} else if (d2 < radius * radius) {
			const d = Math.sqrt(d2);
			const push = radius - d + .001;
			dx /= d;
			dz /= d;
			x += dx * push;
			z += dz * push;
		}
	}
	return {
		x,
		z
	};
}
function pointInSolid(x, z) {
	for (const solid of SOLIDS) if (x > solid.minX && x < solid.maxX && z > solid.minZ && z < solid.maxZ) return true;
	return false;
}
function placeName(x, z, y) {
	if (y > 3 && Math.abs(z + 175) < 16 && x > -150 && x < 160) return "Ramat flyover deck";
	if ((x - PARK.x) ** 2 + (z - PARK.z) ** 2 < (PARK.r + 4) ** 2) return "Ramat Park";
	if (x < -9 && x > -20 && z > 2 && z < 20 && y < 3) return "Rented room";
	if (x > 44 && x < 56 && z < -190 && z > -208) return "Ramat room";
	if (Math.abs(z + 40) < 20 && x > -80 && x < 30) return "Oregbeni";
	if (Math.abs(z + 175) < 26) return "Ramat junction";
	if (z < -242) return "Ikpoba bridge";
	if (z > -10) return "Ikpoba Hill";
	return "The corridor";
}
function yawFromTangent(tx, tz) {
	return Math.atan2(-tx, -tz);
}
var SKIN = [
	3810328,
	6044200,
	8015668,
	9331268
];
var CLOTH = [
	13919535,
	2051386,
	15193008,
	2371652
];
var STEP = 1 / 60;
function clamp(v, a, b) {
	return Math.max(a, Math.min(b, v));
}
function dampAngle(current, target, dt, speed) {
	return current + Math.atan2(Math.sin(target - current), Math.cos(target - current)) * (1 - Math.exp(-speed * dt));
}
function bag() {
	return {
		p: [],
		n: [],
		uv: [],
		c: [],
		i: []
	};
}
function toGeo(data) {
	const g = new BufferGeometry();
	g.setAttribute("position", new Float32BufferAttribute(data.p, 3));
	g.setAttribute("normal", new Float32BufferAttribute(data.n, 3));
	g.setAttribute("uv", new Float32BufferAttribute(data.uv, 2));
	if (data.c.length) g.setAttribute("color", new Float32BufferAttribute(data.c, 3));
	g.setIndex(data.i);
	g.computeBoundingSphere();
	return g;
}
var color = new Color();
function appendBox(data, cx, cy, cz, sx, sy, sz, yaw, tint, facade) {
	color.setHex(tint);
	const c = Math.cos(yaw);
	const s = Math.sin(yaw);
	for (const face of [
		{
			n: [
				0,
				0,
				1
			],
			v: [
				[
					-.5,
					-.5,
					.5
				],
				[
					.5,
					-.5,
					.5
				],
				[
					.5,
					.5,
					.5
				],
				[
					-.5,
					.5,
					.5
				]
			]
		},
		{
			n: [
				0,
				0,
				-1
			],
			v: [
				[
					.5,
					-.5,
					-.5
				],
				[
					-.5,
					-.5,
					-.5
				],
				[
					-.5,
					.5,
					-.5
				],
				[
					.5,
					.5,
					-.5
				]
			]
		},
		{
			n: [
				1,
				0,
				0
			],
			v: [
				[
					.5,
					-.5,
					.5
				],
				[
					.5,
					-.5,
					-.5
				],
				[
					.5,
					.5,
					-.5
				],
				[
					.5,
					.5,
					.5
				]
			]
		},
		{
			n: [
				-1,
				0,
				0
			],
			v: [
				[
					-.5,
					-.5,
					-.5
				],
				[
					-.5,
					-.5,
					.5
				],
				[
					-.5,
					.5,
					.5
				],
				[
					-.5,
					.5,
					-.5
				]
			]
		},
		{
			n: [
				0,
				1,
				0
			],
			v: [
				[
					-.5,
					.5,
					.5
				],
				[
					.5,
					.5,
					.5
				],
				[
					.5,
					.5,
					-.5
				],
				[
					-.5,
					.5,
					-.5
				]
			]
		},
		{
			n: [
				0,
				-1,
				0
			],
			v: [
				[
					-.5,
					-.5,
					-.5
				],
				[
					.5,
					-.5,
					-.5
				],
				[
					.5,
					-.5,
					.5
				],
				[
					-.5,
					-.5,
					.5
				]
			]
		}
	]) {
		const base = data.p.length / 3;
		const nx = c * face.n[0] + s * face.n[2];
		const ny = face.n[1];
		const nz = -s * face.n[0] + c * face.n[2];
		for (const v of face.v) {
			const lx = v[0] * sx;
			const ly = v[1] * sy;
			const lz = v[2] * sz;
			data.p.push(cx + c * lx + s * lz, cy + ly, cz - s * lx + c * lz);
			data.n.push(nx, ny, nz);
			if (!facade || Math.abs(face.n[1]) > .5) data.uv.push(.02, .02);
			else if (Math.abs(face.n[0]) > .5) data.uv.push((v[2] + .5) * (sz / 2.6), (v[1] + .5) * (sy / 3.05));
			else data.uv.push((v[0] + .5) * (sx / 2.6), (v[1] + .5) * (sy / 3.05));
			data.c.push(color.r, color.g, color.b);
		}
		data.i.push(base, base + 1, base + 2, base, base + 2, base + 3);
	}
}
function roadFrame(road) {
	const frames = [];
	let len = 0;
	for (let i = 0; i < road.points.length; i++) {
		const p = road.points[i];
		const a = road.points[Math.max(0, i - 1)];
		const b = road.points[Math.min(road.points.length - 1, i + 1)];
		let tx = b.x - a.x;
		let tz = b.z - a.z;
		const mag = Math.hypot(tx, tz) || 1;
		tx /= mag;
		tz /= mag;
		const nx = -tz;
		const nz = tx;
		const hw = road.width / 2;
		if (i > 0) len += Math.hypot(p.x - road.points[i - 1].x, p.z - road.points[i - 1].z);
		frames.push({
			lx: p.x + nx * hw,
			lz: p.z + nz * hw,
			rx: p.x - nx * hw,
			rz: p.z - nz * hw,
			y: p.y,
			len,
			nx,
			nz
		});
	}
	return frames;
}
function addQuad(data, verts, normal, uvs, tint) {
	color.setHex(tint);
	const base = data.p.length / 3;
	for (let i = 0; i < 4; i++) {
		data.p.push(verts[i][0], verts[i][1], verts[i][2]);
		data.n.push(normal[0], normal[1], normal[2]);
		data.uv.push(uvs[i][0], uvs[i][1]);
		data.c.push(color.r, color.g, color.b);
	}
	data.i.push(base, base + 1, base + 2, base, base + 2, base + 3);
}
function appendRoads(asphalt, concrete) {
	for (const road of ROADS) {
		const frames = roadFrame(road);
		const elevated = road.level === 1;
		const tint = elevated ? 12960443 : 16777215;
		for (let i = 0; i < frames.length - 1; i++) {
			const a = frames[i];
			const b = frames[i + 1];
			const lift = .05;
			addQuad(asphalt, [
				[
					a.lx,
					a.y + lift,
					a.lz
				],
				[
					a.rx,
					a.y + lift,
					a.rz
				],
				[
					b.rx,
					b.y + lift,
					b.rz
				],
				[
					b.lx,
					b.y + lift,
					b.lz
				]
			], [
				0,
				1,
				0
			], [
				[0, a.len / 4],
				[1, a.len / 4],
				[1, b.len / 4],
				[0, b.len / 4]
			], tint);
			if (!elevated) continue;
			const drop = .48;
			addQuad(concrete, [
				[
					a.rx,
					a.y + lift - drop,
					a.rz
				],
				[
					a.lx,
					a.y + lift - drop,
					a.lz
				],
				[
					b.lx,
					b.y + lift - drop,
					b.lz
				],
				[
					b.rx,
					b.y + lift - drop,
					b.rz
				]
			], [
				0,
				-1,
				0
			], [
				[0, a.len / 6],
				[1, a.len / 6],
				[1, b.len / 6],
				[0, b.len / 6]
			], 12038824);
			addQuad(concrete, [
				[
					a.lx,
					a.y + lift,
					a.lz
				],
				[
					b.lx,
					b.y + lift,
					b.lz
				],
				[
					b.lx,
					b.y + lift - drop,
					b.lz
				],
				[
					a.lx,
					a.y + lift - drop,
					a.lz
				]
			], [
				a.nx,
				0,
				a.nz
			], [
				[0, 0],
				[1, 0],
				[1, 1],
				[0, 1]
			], 13157304);
			addQuad(concrete, [
				[
					b.rx,
					b.y + lift,
					b.rz
				],
				[
					a.rx,
					a.y + lift,
					a.rz
				],
				[
					a.rx,
					a.y + lift - drop,
					a.rz
				],
				[
					b.rx,
					b.y + lift - drop,
					b.rz
				]
			], [
				-a.nx,
				0,
				-a.nz
			], [
				[0, 0],
				[1, 0],
				[1, 1],
				[0, 1]
			], 13157304);
			const rail = .85;
			addQuad(concrete, [
				[
					a.lx,
					a.y + lift + rail,
					a.lz
				],
				[
					b.lx,
					b.y + lift + rail,
					b.lz
				],
				[
					b.lx,
					b.y + lift + .08,
					b.lz
				],
				[
					a.lx,
					a.y + lift + .08,
					a.lz
				]
			], [
				a.nx,
				0,
				a.nz
			], [
				[0, 1],
				[1, 1],
				[1, 0],
				[0, 0]
			], 14605010);
			addQuad(concrete, [
				[
					b.rx,
					b.y + lift + rail,
					b.rz
				],
				[
					a.rx,
					a.y + lift + rail,
					a.rz
				],
				[
					a.rx,
					a.y + lift + .08,
					a.rz
				],
				[
					b.rx,
					b.y + lift + .08,
					b.rz
				]
			], [
				-a.nx,
				0,
				-a.nz
			], [
				[0, 1],
				[1, 1],
				[1, 0],
				[0, 0]
			], 14605010);
		}
	}
}
function canvasTex(draw, size = 128) {
	const canvas = document.createElement("canvas");
	canvas.width = size;
	canvas.height = size;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("canvas");
	draw(ctx, size);
	const tex = new CanvasTexture(canvas);
	tex.wrapS = RepeatWrapping;
	tex.wrapT = RepeatWrapping;
	tex.colorSpace = SRGBColorSpace;
	tex.anisotropy = 8;
	return tex;
}
function makeVehicleGeo(kind) {
	const data = bag();
	if (kind === "okada") {
		appendBox(data, 0, .42, 0, .28, .32, 1.35, 0, 16777215, false);
		appendBox(data, 0, .72, .15, .22, .28, .45, 0, 16777215, false);
		appendBox(data, 0, .28, .62, .12, .36, .12, 0, 2236962, false);
		appendBox(data, 0, .28, -.62, .12, .36, .12, 0, 2236962, false);
	} else if (kind === "bus") {
		appendBox(data, 0, .85, 0, 1.7, 1.5, 4.4, 0, 16777215, false);
		appendBox(data, 0, 1.15, 1.55, 1.5, .7, .7, 0, 14151413, false);
		appendBox(data, 0, .32, 1.4, .28, .5, .28, 0, 2236962, false);
		appendBox(data, 0, .32, -1.4, .28, .5, .28, 0, 2236962, false);
	} else {
		appendBox(data, 0, .42, 0, 1.35, .48, 2.7, 0, 16777215, false);
		appendBox(data, 0, .92, -.15, 1.15, .48, 1.35, 0, 14151413, false);
		appendBox(data, .62, .28, .85, .28, .42, .28, 0, 2236962, false);
		appendBox(data, -.62, .28, .85, .28, .42, .28, 0, 2236962, false);
		appendBox(data, .62, .28, -.85, .28, .42, .28, 0, 2236962, false);
		appendBox(data, -.62, .28, -.85, .28, .42, .28, 0, 2236962, false);
	}
	return toGeo(data);
}
function makePalm() {
	const trunk = new CylinderGeometry(.14, .24, 5.4, 6);
	trunk.translate(0, 2.7, 0);
	const parts = [trunk];
	for (let i = 0; i < 6; i++) {
		const frond = new BoxGeometry(.16, .05, 2.15);
		frond.translate(0, 0, 1);
		frond.rotateX(.55);
		frond.rotateY(i / 6 * Math.PI * 2);
		frond.translate(0, 5.15, 0);
		parts.push(frond);
	}
	const merged = mergeGeometries(parts, false);
	if (!merged) throw new Error("palm");
	return merged;
}
function freshSim() {
	return {
		phase: "title",
		panel: null,
		name: "",
		background: "student",
		skin: 1,
		cloth: 0,
		naira: 0,
		day: 1,
		minutes: 1045,
		hunger: 18,
		energy: 92,
		debt: 0,
		rentPaidDay: 0,
		home: "hill",
		inv: {
			puff: 0,
			water: 0,
			rice: 0
		},
		skill: 0,
		rel: 0,
		flags: {},
		job: null,
		stallStep: 0,
		stallProfit: 0,
		px: HILL_SPAWN.x,
		py: 0,
		pz: HILL_SPAWN.z,
		yaw: HILL_SPAWN.yaw,
		speed: 0,
		footSpeed: 0,
		mode: "foot",
		ride: null,
		fuel: 100,
		carUnlocked: false,
		raining: false,
		autoRainDay: -1,
		camOff: 0,
		okada: {
			x: -7.3,
			z: 12.2,
			yaw: 0
		},
		car: {
			x: -7.3,
			z: 4.6,
			yaw: 0
		},
		muted: false,
		haggle: false,
		dryWarned: false,
		edgeTold: false,
		shake: 0,
		walkPhase: 0,
		social: defaultSocial(),
		reelT: 0,
		reelBeat: -1
	};
}
function mount(view, minimap) {
	const mobile = Math.min(window.innerWidth, window.innerHeight) < 820;
	const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	const sim = freshSim();
	const audio = new CityAudio();
	const geos = [];
	const mats = [];
	const disposers = [];
	let renderer;
	try {
		renderer = new WebGLRenderer({
			canvas: view,
			antialias: !mobile,
			powerPreference: "high-performance",
			alpha: false
		});
	} catch {
		useHud.getState().patch({
			ready: true,
			error: "This browser couldn't start the city view."
		});
		return () => {};
	}
	renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.7));
	renderer.setSize(view.clientWidth || 1, view.clientHeight || 1, false);
	renderer.outputColorSpace = SRGBColorSpace;
	renderer.toneMapping = 6;
	renderer.toneMappingExposure = 1.08;
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = 2;
	const scene = new Scene();
	scene.fog = new FogExp2(14201994, .0075);
	const camera = new PerspectiveCamera(58, 1, .12, 700);
	camera.position.set(20, 18, -150);
	const hemi = new HemisphereLight(16769730, 6963248, .95);
	scene.add(hemi);
	const sun = new DirectionalLight(16773596, 2.35);
	sun.castShadow = true;
	const shadowSpan = mobile ? 42 : 68;
	sun.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
	sun.shadow.camera.near = 2;
	sun.shadow.camera.far = 160;
	sun.shadow.camera.left = -shadowSpan;
	sun.shadow.camera.right = shadowSpan;
	sun.shadow.camera.top = shadowSpan;
	sun.shadow.camera.bottom = -shadowSpan;
	sun.shadow.bias = -35e-5;
	sun.shadow.normalBias = .04;
	scene.add(sun, sun.target);
	const nightFill = new HemisphereLight(1713988, 1182729, 0);
	scene.add(nightFill);
	const facade = canvasTex((g, s) => {
		g.fillStyle = "#ffffff";
		g.fillRect(0, 0, s, s);
		for (let i = 0; i < 500; i++) {
			g.fillStyle = `rgba(40, 24, 12, ${Math.random() * .06})`;
			g.fillRect(Math.random() * s, Math.random() * s, 2, 2);
		}
		g.fillStyle = "#1a2430";
		g.fillRect(s * .26, s * .18, s * .48, s * .58);
		g.fillStyle = "rgba(180, 220, 230, 0.35)";
		g.fillRect(s * .3, s * .22, s * .18, s * .22);
		g.fillStyle = "#e7e1d8";
		g.fillRect(s * .22, s * .78, s * .56, s * .045);
	});
	const glow = canvasTex((g, s) => {
		g.fillStyle = "#000";
		g.fillRect(0, 0, s, s);
		g.fillStyle = "#ffd7a8";
		g.fillRect(s * .3, s * .22, s * .4, s * .48);
	});
	const asphaltMap = canvasTex((g, s) => {
		g.fillStyle = "#3a3d42";
		g.fillRect(0, 0, s, s);
		for (let i = 0; i < 700; i++) {
			g.fillStyle = `rgba(255,255,255,${Math.random() * .04})`;
			g.fillRect(Math.random() * s, Math.random() * s, 2, 2);
		}
		g.fillStyle = "#f2efe6";
		g.fillRect(2, 0, 3, s);
		g.fillRect(s - 5, 0, 3, s);
		g.fillRect(s * .47, s * .08, s * .06, s * .38);
	}, 128);
	asphaltMap.repeat.set(1, 1);
	const laterite = canvasTex((g, s) => {
		g.fillStyle = "#8a4a30";
		g.fillRect(0, 0, s, s);
		for (let i = 0; i < 900; i++) {
			g.fillStyle = `rgba(40, 16, 8, ${Math.random() * .18})`;
			g.fillRect(Math.random() * s, Math.random() * s, 3, 2);
		}
	});
	const concreteMap = canvasTex((g, s) => {
		g.fillStyle = "#c9c4ba";
		g.fillRect(0, 0, s, s);
		for (let i = 0; i < 400; i++) {
			g.fillStyle = `rgba(60,50,40,${Math.random() * .08})`;
			g.fillRect(Math.random() * s, Math.random() * s, 4, 2);
		}
	});
	const buildingMat = new MeshStandardMaterial({
		map: facade,
		emissiveMap: glow,
		emissive: new Color(16763274),
		emissiveIntensity: 0,
		roughness: .86,
		metalness: .02,
		vertexColors: true
	});
	const asphaltMat = new MeshStandardMaterial({
		map: asphaltMap,
		roughness: .92,
		metalness: .04,
		vertexColors: true
	});
	const concreteMat = new MeshStandardMaterial({
		map: concreteMap,
		roughness: .78,
		metalness: .05,
		vertexColors: true
	});
	const groundMat = new MeshStandardMaterial({
		map: laterite,
		roughness: 1,
		metalness: 0,
		color: 16777215
	});
	laterite.repeat.set(48, 48);
	const grassMat = new MeshStandardMaterial({
		color: 4160069,
		roughness: .95
	});
	const waterMat = new MeshStandardMaterial({
		color: 3108472,
		roughness: .18,
		metalness: .45,
		transparent: true,
		opacity: .86
	});
	const palmMat = new MeshStandardMaterial({
		color: 3107388,
		roughness: .8
	});
	const trunkTint = new MeshStandardMaterial({
		color: 7031346,
		roughness: .9
	});
	mats.push(buildingMat, asphaltMat, concreteMat, groundMat, grassMat, waterMat, palmMat, trunkTint);
	const buildings = bag();
	const awnings = bag();
	const roofs = bag();
	for (const block of BLOCKS) {
		appendBox(buildings, block.x, block.h / 2, block.z, block.w, block.h, block.d, block.yaw, block.tint, true);
		appendBox(roofs, block.x, block.h + .12, block.z, block.w + .3, .22, block.d + .3, block.yaw, 6962482, false);
		if (block.shop) {
			const c = Math.cos(block.yaw);
			const s = Math.sin(block.yaw);
			const ox = c * 0 + s * (block.d / 2 + .45);
			const oz = -s * 0 + c * (block.d / 2 + .45);
			appendBox(awnings, block.x + ox, 2.4, block.z + oz, block.w * .7, .08, 1.1, block.yaw, CLOTH[block.tint % 4], false);
		}
	}
	const homeBag = bag();
	appendBox(homeBag, -19.2, 1.55, 11, .4, 3.1, 18, 0, 14996152, true);
	appendBox(homeBag, -14, 1.55, 2.22, 10.4, 3.1, .45, 0, 14996152, true);
	appendBox(homeBag, -14, 1.55, 19.78, 10.4, 3.1, .45, 0, 14996152, true);
	appendBox(homeBag, -9.22, 1.55, 5.08, .45, 3.1, 6.15, 0, 14996152, true);
	appendBox(homeBag, -9.22, 1.55, 16.12, .45, 3.1, 7.75, 0, 14996152, true);
	appendBox(homeBag, -14, 3.16, 11, 10.2, .12, 17.6, 0, 6962482, false);
	appendBox(homeBag, -14, .04, 11, 9.2, .06, 16.4, 0, 12888458, false);
	appendBox(homeBag, -16.4, .22, 15.2, 1.3, .28, 2.1, 0, 12868646, false);
	appendBox(homeBag, -12.4, .38, 6.4, .9, .5, .7, 0, 7031346, false);
	appendBox(homeBag, 56.22, 1.7, -199, .4, 3.4, 18, 0, 15194308, true);
	appendBox(homeBag, 50, 1.7, -207.78, 12.2, 3.4, .45, 0, 15194308, true);
	appendBox(homeBag, 50, 1.7, -190.22, 12.2, 3.4, .45, 0, 15194308, true);
	appendBox(homeBag, 44.22, 1.7, -205.15, .45, 3.4, 5.7, 0, 15194308, true);
	appendBox(homeBag, 44.22, 1.7, -194.05, .45, 3.4, 8.1, 0, 15194308, true);
	appendBox(homeBag, 50, 3.42, -199, 12, .12, 17.6, 0, 6047288, false);
	appendBox(homeBag, 52.2, .24, -202.2, 1.4, .3, 2.1, 0, 2051386, false);
	const asphalt = bag();
	const concrete = bag();
	appendRoads(asphalt, concrete);
	for (const pillar of PILLARS) appendBox(concrete, pillar.x, 3.55, pillar.z, .85, 7.1, .85, 0, 13157304, false);
	appendBox(concrete, 33, .7, -264, 8, 1.2, 32, .18, 13157304, false);
	const addMesh = (data, material, shadow = true) => {
		const geo = toGeo(data);
		geos.push(geo);
		const mesh = new Mesh(geo, material);
		mesh.castShadow = shadow;
		mesh.receiveShadow = true;
		scene.add(mesh);
		return mesh;
	};
	addMesh(buildings, buildingMat, !mobile);
	addMesh(roofs, concreteMat, false);
	addMesh(awnings, concreteMat, false);
	const homeMat = buildingMat.clone();
	homeMat.side = 2;
	mats.push(homeMat);
	addMesh(homeBag, homeMat, false);
	addMesh(asphalt, asphaltMat, false);
	addMesh(concrete, concreteMat, true);
	const ground = new Mesh(new PlaneGeometry(760, 760), groundMat);
	ground.rotation.x = -Math.PI / 2;
	ground.position.y = -.08;
	ground.receiveShadow = true;
	scene.add(ground);
	geos.push(ground.geometry);
	const park = new Mesh(new CircleGeometry(PARK.r, 28), grassMat);
	park.rotation.x = -Math.PI / 2;
	park.position.set(PARK.x, .03, PARK.z);
	park.receiveShadow = true;
	scene.add(park);
	geos.push(park.geometry);
	const waterL = new Mesh(new PlaneGeometry(200, 36), waterMat);
	waterL.rotation.x = -Math.PI / 2;
	waterL.position.set(-80, -.45, -270);
	const waterR = waterL.clone();
	waterR.position.x = 130;
	scene.add(waterL, waterR);
	geos.push(waterL.geometry);
	const bronzeMat = new MeshStandardMaterial({
		color: 11037490,
		metalness: .82,
		roughness: .28
	});
	mats.push(bronzeMat);
	for (const spec of [
		{
			h: 3.3,
			x: 0,
			z: 0
		},
		{
			h: 2.2,
			x: .8,
			z: .4
		},
		{
			h: 1.5,
			x: -.7,
			z: .2
		}
	]) {
		const piece = new Mesh(new CylinderGeometry(.28, .5, spec.h, 6), bronzeMat);
		piece.position.set(PARK.x + spec.x - 4, spec.h / 2, PARK.z + spec.z);
		piece.castShadow = true;
		scene.add(piece);
		geos.push(piece.geometry);
	}
	const stallColors = [
		13919535,
		14725466,
		2051386,
		16051160,
		12868646,
		4090706,
		9263675
	];
	for (let i = 0; i < 7; i++) {
		const x = -50 + i * 5.4;
		const cloth = new Mesh(new BoxGeometry(3.2, .12, 2.2), new MeshStandardMaterial({
			color: stallColors[i],
			roughness: .7
		}));
		cloth.position.set(x, 1.7, -50);
		const table = new Mesh(new BoxGeometry(2.4, .7, 1.1), new MeshStandardMaterial({
			color: 7031346,
			roughness: .85
		}));
		table.position.set(x, .4, -50.4);
		cloth.castShadow = table.castShadow = true;
		scene.add(cloth, table);
		geos.push(cloth.geometry, table.geometry);
		mats.push(cloth.material, table.material);
	}
	const palmGeo = makePalm();
	geos.push(palmGeo);
	const treeSpots = [];
	for (const road of ROADS) {
		if (road.level === 1 || road.id === "ramat-ground") continue;
		const length = roadLength(road);
		for (let d = 18; d < length - 10; d += mobile ? 28 : 18) {
			const p = pointOnRoad(road, d);
			const side = d % 36 < 18 ? 1 : -1;
			const x = p.x + -p.tz * side * (road.width * .5 + 2.4);
			const z = p.z + p.tx * side * (road.width * .5 + 2.4);
			if (pointInSolid(x, z)) continue;
			if (x > -22 && x < -4 && z > 0 && z < 24) continue;
			treeSpots.push({
				x,
				z,
				s: .85 + treeSpots.length * 17 % 5 * .08
			});
		}
	}
	for (let i = 0; i < 14; i++) {
		const a = i / 14 * Math.PI * 2;
		treeSpots.push({
			x: PARK.x + Math.cos(a) * 14,
			z: PARK.z + Math.sin(a) * 12,
			s: 1.05
		});
	}
	const palms = new InstancedMesh(palmGeo, palmMat, treeSpots.length);
	palms.castShadow = !mobile;
	palms.receiveShadow = true;
	const dummy = new Object3D();
	treeSpots.forEach((spot, i) => {
		dummy.position.set(spot.x, 0, spot.z);
		dummy.scale.setScalar(spot.s);
		dummy.rotation.y = i;
		dummy.updateMatrix();
		palms.setMatrixAt(i, dummy.matrix);
	});
	scene.add(palms);
	palmMat.color.set(3959610);
	const agents = [
		{
			road: "hill",
			dist: 30,
			lane: 1,
			speed: 8,
			kind: "car",
			color: 12868646
		},
		{
			road: "hill",
			dist: 95,
			lane: -1,
			speed: -7,
			kind: "bus",
			color: 14725466
		},
		{
			road: "hill",
			dist: 150,
			lane: 1,
			speed: 9,
			kind: "okada",
			color: 2051386
		},
		{
			road: "hill",
			dist: 210,
			lane: -1,
			speed: -6.5,
			kind: "car",
			color: 2371652
		},
		{
			road: "market",
			dist: 24,
			lane: 1,
			speed: 6.5,
			kind: "car",
			color: 7244660
		},
		{
			road: "market",
			dist: 80,
			lane: -1,
			speed: -6,
			kind: "okada",
			color: 13919535
		},
		{
			road: "market",
			dist: 140,
			lane: 1,
			speed: 7,
			kind: "bus",
			color: 16051160
		},
		{
			road: "ramat-ground",
			dist: 50,
			lane: 1,
			speed: 8,
			kind: "car",
			color: 3497098
		},
		{
			road: "ramat-ground",
			dist: 170,
			lane: -1,
			speed: -9,
			kind: "car",
			color: 2237996
		},
		{
			road: "deck",
			dist: 30,
			lane: 0,
			speed: 11,
			kind: "car",
			color: 16052714
		},
		{
			road: "deck",
			dist: 90,
			lane: 0,
			speed: 9,
			kind: "okada",
			color: 12868646
		}
	];
	if (!mobile) agents.push({
		road: "hill",
		dist: 250,
		lane: 1,
		speed: 7.5,
		kind: "okada",
		color: 9263675
	}, {
		road: "ramat-ground",
		dist: 250,
		lane: 1,
		speed: 7,
		kind: "bus",
		color: 14725466
	}, {
		road: "ramp-east",
		dist: 12,
		lane: 0,
		speed: -8,
		kind: "car",
		color: 2051386
	});
	const byKind = {
		car: agents.filter((a) => a.kind === "car"),
		okada: agents.filter((a) => a.kind === "okada"),
		bus: agents.filter((a) => a.kind === "bus")
	};
	const trafficMat = new MeshStandardMaterial({
		roughness: .48,
		metalness: .22,
		vertexColors: false
	});
	mats.push(trafficMat);
	const trafficMesh = {
		car: new InstancedMesh(makeVehicleGeo("car"), trafficMat, Math.max(1, byKind.car.length)),
		okada: new InstancedMesh(makeVehicleGeo("okada"), trafficMat, Math.max(1, byKind.okada.length)),
		bus: new InstancedMesh(makeVehicleGeo("bus"), trafficMat, Math.max(1, byKind.bus.length))
	};
	for (const kind of [
		"car",
		"okada",
		"bus"
	]) {
		geos.push(trafficMesh[kind].geometry);
		trafficMesh[kind].castShadow = !mobile;
		trafficMesh[kind].instanceColor = new InstancedBufferAttribute(new Float32Array(trafficMesh[kind].count * 3), 3);
		scene.add(trafficMesh[kind]);
	}
	const peds = [];
	const pedCount = mobile ? 16 : 30;
	for (let i = 0; i < pedCount; i++) peds.push({
		road: i % 2 === 0 ? "hill" : "market",
		dist: 12 + i * 19,
		side: i % 2 === 0 ? 1 : -1,
		speed: .85 + i % 4 * .18,
		phase: i * .7,
		cloth: CLOTH[i % CLOTH.length],
		skin: SKIN[(i + 1) % SKIN.length]
	});
	const bodyGeo = new CylinderGeometry(.28, .32, .85, 6);
	const headGeo = new SphereGeometry(.2, 8, 6);
	geos.push(bodyGeo, headGeo);
	const pedBodyMat = new MeshStandardMaterial({ roughness: .7 });
	const pedHeadMat = new MeshStandardMaterial({ roughness: .65 });
	mats.push(pedBodyMat, pedHeadMat);
	const pedBody = new InstancedMesh(bodyGeo, pedBodyMat, peds.length);
	const pedHead = new InstancedMesh(headGeo, pedHeadMat, peds.length);
	pedBody.instanceColor = new InstancedBufferAttribute(new Float32Array(peds.length * 3), 3);
	pedHead.instanceColor = new InstancedBufferAttribute(new Float32Array(peds.length * 3), 3);
	peds.forEach((ped, i) => {
		color.setHex(ped.cloth);
		pedBody.setColorAt(i, color);
		color.setHex(ped.skin);
		pedHead.setColorAt(i, color);
	});
	scene.add(pedBody, pedHead);
	const lampGeo = new CylinderGeometry(.06, .08, 4.2, 5);
	const bulbGeo = new SphereGeometry(.16, 8, 6);
	geos.push(lampGeo, bulbGeo);
	const lampMat = new MeshStandardMaterial({
		color: 2762532,
		roughness: .6,
		metalness: .4
	});
	const bulbMat = new MeshStandardMaterial({
		color: 3351055,
		emissive: 16757082,
		emissiveIntensity: 0,
		roughness: .4
	});
	mats.push(lampMat, bulbMat);
	const lampCount = mobile ? 18 : 32;
	const lamps = new InstancedMesh(lampGeo, lampMat, lampCount);
	const bulbs = new InstancedMesh(bulbGeo, bulbMat, lampCount);
	for (let i = 0; i < lampCount; i++) {
		const p = pointOnRoad(roadById("hill"), 20 + i * 16);
		const side = i % 2 === 0 ? 1 : -1;
		dummy.position.set(p.x + -p.tz * side * 6.4, 2.1, p.z + p.tx * side * 6.4);
		dummy.scale.set(1, 1, 1);
		dummy.rotation.set(0, 0, 0);
		dummy.updateMatrix();
		lamps.setMatrixAt(i, dummy.matrix);
		dummy.position.y = 4.25;
		dummy.updateMatrix();
		bulbs.setMatrixAt(i, dummy.matrix);
	}
	scene.add(lamps, bulbs);
	function makeSign(text) {
		const canvas = document.createElement("canvas");
		canvas.width = 512;
		canvas.height = 128;
		const ctx = canvas.getContext("2d");
		if (!ctx) return new Mesh();
		ctx.fillStyle = "#1a140f";
		ctx.fillRect(0, 0, 512, 128);
		ctx.strokeStyle = "#e0b15a";
		ctx.lineWidth = 8;
		ctx.strokeRect(6, 6, 500, 116);
		ctx.fillStyle = "#f4ebd8";
		ctx.font = "600 54px Georgia, serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(text, 256, 68);
		const tex = new CanvasTexture(canvas);
		tex.colorSpace = SRGBColorSpace;
		const mat = new MeshBasicMaterial({
			map: tex,
			transparent: true
		});
		mats.push(mat);
		const mesh = new Mesh(new PlaneGeometry(7.2, 1.8), mat);
		geos.push(mesh.geometry);
		return mesh;
	}
	const signHill = makeSign("IKPOBA HILL");
	signHill.position.set(-4.2, 3.3, 36);
	const signMarket = makeSign("OREGBENI");
	signMarket.position.set(-36, 3.1, -24);
	signMarket.rotation.y = .4;
	const signPark = makeSign("RAMAT PARK");
	signPark.position.set(58, 3.2, -206);
	signPark.rotation.y = -.6;
	const signDeck = makeSign("FLYOVER DECK");
	signDeck.position.set(8, 9.3, -169.2);
	scene.add(signHill, signMarket, signPark, signDeck);
	const sky = new Mesh(new SphereGeometry(480, 24, 16), new ShaderMaterial({
		side: 1,
		depthWrite: false,
		uniforms: {
			uElev: { value: .4 },
			uSun: { value: new Vector3(.2, .6, .2) },
			uRain: { value: 0 }
		},
		vertexShader: `
        varying vec3 vDir;
        void main() {
          vec4 w = modelMatrix * vec4(position, 1.0);
          vDir = position;
          gl_Position = projectionMatrix * viewMatrix * w;
        }
      `,
		fragmentShader: `
        precision highp float;
        varying vec3 vDir;
        uniform float uElev;
        uniform vec3 uSun;
        uniform float uRain;
        vec3 lin(vec3 c){ return pow(max(c, vec3(0.0)), vec3(2.2)); }
        void main() {
          vec3 dir = normalize(vDir);
          float h = clamp(dir.y, 0.0, 1.0);
          float day = clamp(uElev, 0.0, 1.0);
          vec3 zenith = mix(lin(vec3(0.07, 0.09, 0.16)), lin(vec3(0.34, 0.58, 0.86)), day);
          vec3 horizon = mix(lin(vec3(0.95, 0.48, 0.22)), lin(vec3(0.95, 0.78, 0.58)), day);
          if (uElev < 0.05) {
            zenith = lin(vec3(0.03, 0.04, 0.08));
            horizon = lin(vec3(0.33, 0.16, 0.1));
          }
          vec3 col = mix(horizon, zenith, pow(h, 0.55));
          col = mix(col, lin(vec3(0.45, 0.48, 0.52)), uRain * 0.55);
          float sun = pow(max(dot(dir, normalize(uSun)), 0.0), mix(280.0, 1400.0, day));
          col += lin(vec3(1.0, 0.82, 0.55)) * sun * (1.0 - uRain * 0.7);
          gl_FragColor = vec4(col, 1.0);
        }
      `
	}));
	scene.add(sky);
	geos.push(sky.geometry);
	const skyMat = sky.material;
	const rain = new Points(new BufferGeometry(), new PointsMaterial({
		color: 12964056,
		size: .08,
		transparent: true,
		opacity: .55,
		depthWrite: false
	}));
	const rainPositions = new Float32Array((mobile ? 700 : 1400) * 3);
	for (let i = 0; i < rainPositions.length; i += 3) {
		rainPositions[i] = (Math.random() - .5) * 50;
		rainPositions[i + 1] = Math.random() * 24;
		rainPositions[i + 2] = (Math.random() - .5) * 50;
	}
	rain.geometry.setAttribute("position", new BufferAttribute(rainPositions, 3));
	scene.add(rain);
	geos.push(rain.geometry);
	mats.push(rain.material);
	const marker = new Mesh(new CylinderGeometry(.18, .18, 6, 6), new MeshBasicMaterial({
		color: 14725466,
		transparent: true,
		opacity: .85
	}));
	marker.visible = false;
	scene.add(marker);
	geos.push(marker.geometry);
	mats.push(marker.material);
	const skinMat = new MeshStandardMaterial({
		color: 6044200,
		roughness: .62
	});
	const clothMat = new MeshStandardMaterial({
		color: 13919535,
		roughness: .72
	});
	const darkMat = new MeshStandardMaterial({
		color: 2365458,
		roughness: .5
	});
	mats.push(skinMat, clothMat, darkMat);
	const avatar = new Group();
	const torso = new Mesh(new BoxGeometry(.42, .55, .24), clothMat);
	torso.position.y = 1.05;
	torso.castShadow = true;
	const skull = new Mesh(new SphereGeometry(.16, 12, 10), skinMat);
	skull.position.y = 1.5;
	skull.castShadow = true;
	const hair = new Mesh(new SphereGeometry(.155, 10, 8), darkMat);
	hair.position.y = 1.58;
	hair.scale.y = .65;
	const armL = new Mesh(new BoxGeometry(.1, .46, .1), skinMat);
	const armR = armL.clone();
	armL.position.set(-.28, 1.05, 0);
	armR.position.set(.28, 1.05, 0);
	const legL = new Mesh(new BoxGeometry(.12, .52, .12), darkMat);
	const legR = legL.clone();
	legL.position.set(-.12, .48, 0);
	legR.position.set(.12, .48, 0);
	legL.geometry.translate(0, -.26, 0);
	legL.position.y = .74;
	legR.geometry = legL.geometry;
	legR.position.y = .74;
	avatar.add(torso, skull, hair, armL, armR, legL, legR);
	avatar.traverse((obj) => {
		const mesh = obj;
		if (mesh.isMesh) mesh.castShadow = true;
	});
	scene.add(avatar);
	const partnerCloth = new MeshStandardMaterial({
		color: 2051386,
		roughness: .68
	});
	const partnerGold = new MeshStandardMaterial({
		color: 14725466,
		metalness: .55,
		roughness: .35
	});
	mats.push(partnerCloth, partnerGold);
	const partner = new Group();
	const partnerTorso = new Mesh(new BoxGeometry(.4, .58, .22), partnerCloth);
	partnerTorso.position.y = 1.08;
	const partnerHead = new Mesh(new SphereGeometry(.15, 12, 10), skinMat);
	partnerHead.position.y = 1.52;
	const partnerWrap = new Mesh(new BoxGeometry(.48, .46, .28), partnerCloth);
	partnerWrap.position.y = .7;
	const partnerEar = new Mesh(new BoxGeometry(.07, .07, .04), partnerGold);
	partnerEar.position.set(.16, 1.5, .08);
	partner.add(partnerTorso, partnerHead, partnerWrap, partnerEar);
	partner.traverse((obj) => {
		const mesh = obj;
		if (mesh.isMesh) mesh.castShadow = true;
	});
	scene.add(partner);
	function rideGroup(kind) {
		const group = new Group();
		const mesh = new Mesh(makeVehicleGeo(kind === "okada" ? "okada" : "car"), trafficMat);
		mesh.castShadow = true;
		group.add(mesh);
		if (kind === "car") group.scale.set(.95, .95, .95);
		return group;
	}
	const parkedOkada = rideGroup("okada");
	const parkedCar = rideGroup("car");
	const rideOkada = rideGroup("okada");
	const rideCar = rideGroup("car");
	scene.add(parkedOkada, parkedCar, rideOkada, rideCar);
	const head = new SpotLight(16773584, 0, 30, Math.PI / 5.2, .45, 1);
	head.castShadow = false;
	const headTarget = new Object3D();
	head.target = headTarget;
	scene.add(head, headTarget);
	const roomLamp = new PointLight(16761994, .85, 16, 1.5);
	roomLamp.position.set(-14, 2.55, 11);
	scene.add(roomLamp);
	let momentUntil = 0;
	let hudAcc = 0;
	let saveAcc = 0;
	let elapsed = 0;
	let dragging = false;
	let lastX = 0;
	const fogHot = new Color(14856580);
	const fogNight = new Color(1708558);
	const fogRain = new Color(9278356);
	const camPos = new Vector3(30, 16, -140);
	const look = new Vector3();
	const sunVec = new Vector3();
	const desired = new Vector3();
	const ahead = new Vector3();
	const timer = new Timer();
	timer.connect(document);
	const mapCtx = minimap?.getContext("2d") ?? null;
	const mapBuffer = document.createElement("canvas");
	mapBuffer.width = 320;
	mapBuffer.height = 320;
	const mapBase = mapBuffer.getContext("2d");
	if (mapBase) {
		mapBase.fillStyle = "#1a140f";
		mapBase.fillRect(0, 0, 320, 320);
		const project = (x, z) => ({
			x: 12 + (x + 170) / 350 * 296,
			y: 12 + (z + 310) / 380 * 296
		});
		mapBase.strokeStyle = "#3a3128";
		mapBase.lineWidth = 10;
		for (const road of ROADS) {
			mapBase.beginPath();
			road.points.forEach((p, i) => {
				const q = project(p.x, p.z);
				if (i === 0) mapBase.moveTo(q.x, q.y);
				else mapBase.lineTo(q.x, q.y);
			});
			mapBase.strokeStyle = road.level === 1 ? "#e0b15a" : "#8a8175";
			mapBase.lineWidth = road.level === 1 ? 4 : 7;
			mapBase.stroke();
		}
		const parkP = project(PARK.x, PARK.z);
		mapBase.fillStyle = "#3e6b52";
		mapBase.beginPath();
		mapBase.arc(parkP.x, parkP.y, 16, 0, Math.PI * 2);
		mapBase.fill();
	}
	function say(text) {
		sim.flags = { ...sim.flags };
		momentUntil = elapsed + 4.4;
		publish(true, text);
	}
	function objective() {
		if (sim.job?.id === "errand" && sim.job.stage === 0) return "Pick up Mama Eki’s parcel in Oregbeni.";
		if (sim.job?.id === "errand") return "Walk the parcel back to your gate on the hill.";
		if (sim.job?.id === "fare" && sim.job.stage === 0) return "Collect the passenger at Oregbeni — on the okada.";
		if (sim.job?.id === "fare") return "Drop them at Ramat Park. Adesuwa raises the fare if she is riding and not strained.";
		if (sim.social.promise === "rice") return "Adesuwa asked for rice, not cash. Mama Eki sells the plate.";
		if (sim.social.promise === "clear") return "Stay off Night Line until morning. She will hear the park.";
		if (sim.social.heat >= 58) return "Heat is high. The slope task force does not write receipts.";
		if (sim.debt > 0) return "The ledger is behind on rent. Pay it in the room.";
		if (!sim.flags.paidRent) return "Pay today’s rent, or earn it before the hill starts talking.";
		if (!sim.flags.didJob) return "The Oregbeni notice board is still the honest way to be seen.";
		if (sim.social.partner === "none") return "Adesuwa is beside the board. How you speak writes the city.";
		if (!sim.flags.reachedRamat) return "The corridor runs to Ramat. The deck is not the ground road.";
		if (!sim.flags.sawRain) return "Evening rain changes the hill. Wait, or call it from the phone.";
		return "Union, market, guild, Night Line. Only one of them should love you.";
	}
	function publish(force = false, moment = null) {
		hudAcc += force ? 1 : 0;
		if (!force && hudAcc < .12) return;
		hudAcc = 0;
		const prompt = currentPrompt();
		useHud.getState().patch({
			ready: true,
			error: null,
			phase: sim.phase,
			panel: sim.panel,
			name: sim.name,
			background: sim.background,
			naira: Math.round(sim.naira),
			day: sim.day,
			minutes: sim.minutes,
			hunger: sim.hunger,
			energy: sim.energy,
			debt: sim.debt,
			place: placeName(sim.px, sim.pz, sim.py),
			prompt: prompt?.label ?? null,
			objective: objective(),
			moment: moment ?? (elapsed < momentUntil ? useHud.getState().moment : null),
			speed: sim.mode === "drive" ? sim.speed : sim.footSpeed,
			mode: sim.mode,
			ride: sim.ride,
			fuel: sim.fuel,
			raining: sim.raining,
			muted: sim.muted,
			px: sim.px,
			pz: sim.pz,
			yaw: sim.yaw,
			inv: { ...sim.inv },
			skill: sim.skill,
			rel: sim.rel,
			flags: sim.flags,
			job: sim.job ? { ...sim.job } : null,
			stallStep: sim.stallStep,
			stallProfit: sim.stallProfit,
			home: sim.home,
			rentDue: ECON.rent,
			carUnlocked: sim.carUnlocked,
			social: {
				...sim.social,
				respect: { ...sim.social.respect }
			},
			reelT: sim.reelT
		});
	}
	function dist2(x, z) {
		return Math.hypot(sim.px - x, sim.pz - z);
	}
	function currentPrompt() {
		if (sim.phase !== "play" || sim.panel) return null;
		if (sim.job?.id === "errand" && sim.job.stage === 0 && dist2(MAMA.x, MAMA.z) < 2.8) return {
			id: "errand-pick",
			label: "E · Take the parcel"
		};
		if (sim.job?.id === "errand" && sim.job.stage === 1 && dist2(ERRAND_DROP.x, ERRAND_DROP.z) < 2.6) return {
			id: "errand-drop",
			label: "E · Deliver the parcel"
		};
		if (sim.job?.id === "fare" && sim.job.stage === 0 && dist2(FARE_PICK.x, FARE_PICK.z) < 3 && sim.ride === "okada") return {
			id: "fare-pick",
			label: "E · Passenger on"
		};
		if (sim.job?.id === "fare" && sim.job.stage === 0 && dist2(FARE_PICK.x, FARE_PICK.z) < 3) return {
			id: "fare-need",
			label: "Come back on the okada"
		};
		if (sim.job?.id === "fare" && sim.job.stage === 1 && dist2(FARE_DROP.x, FARE_DROP.z) < 4 && sim.ride === "okada") return {
			id: "fare-drop",
			label: "E · Drop passenger"
		};
		if (sim.social.promise === "rice" && sim.inv.rice > 0 && dist2(ADESUWA.x, ADESUWA.z) < 2.7) return {
			id: "rice",
			label: "E · Give Adesuwa the rice"
		};
		if (dist2(ADESUWA.x, ADESUWA.z) < 2.7) return {
			id: sim.social.partner === "none" ? "adesuwa" : "adesuwa-known",
			label: sim.social.partner === "none" ? "E · Speak with Adesuwa" : "E · Adesuwa"
		};
		if (dist2(UNION_YARD.x, UNION_YARD.z) < 2.8) return {
			id: "union",
			label: "E · Hill Union"
		};
		if (dist2(NIGHT_CORNER.x, NIGHT_CORNER.z) < 3.1) return {
			id: "night",
			label: "E · Night Line"
		};
		if (sim.mode === "drive") {
			if (dist2(FUEL.x, FUEL.z) < 3.2) return {
				id: "fuel",
				label: "E · Fill up · ₦400"
			};
			return {
				id: "dismount",
				label: "F · Step off"
			};
		}
		if (dist2(sim.okada.x, sim.okada.z) < 2.8 && sim.ride !== "okada") return {
			id: "mount-okada",
			label: "F · Take the okada"
		};
		if (dist2(sim.car.x, sim.car.z) < 3 && sim.ride !== "car") return {
			id: sim.carUnlocked ? "mount-car" : "hire-car",
			label: sim.carUnlocked ? "F · Take the car" : "F · Hire the car · ₦500"
		};
		const spots = [
			{
				id: "bed",
				label: sim.home === "hill" ? "E · Sleep" : "E · This room was let go",
				x: -16.2,
				z: 15.4,
				r: 1.8
			},
			{
				id: "bed-ramat",
				label: sim.home === "ramat" ? "E · Sleep" : "E · Not your bed",
				x: 52,
				z: -202,
				r: 1.8
			},
			{
				id: "ledger",
				label: "E · Rent ledger",
				x: -12.2,
				z: 6.2,
				r: 1.7
			},
			{
				id: "mama",
				label: "E · Mama Eki",
				x: MAMA.x,
				z: MAMA.z,
				r: 2.5
			},
			{
				id: "board",
				label: "E · Notice board",
				x: BOARD.x,
				z: BOARD.z,
				r: 2.3
			},
			{
				id: "drain",
				label: sim.flags.reportedDrain ? "Drain logged" : "E · Report the drain",
				x: DRAIN.x,
				z: DRAIN.z,
				r: 2.2
			},
			{
				id: "heritage",
				label: "E · Bronze Shade",
				x: HERITAGE.x,
				z: HERITAGE.z,
				r: 2.6
			},
			{
				id: "park",
				label: "E · Sit a minute",
				x: PARK.x - 2,
				z: PARK.z + 2,
				r: 3.4
			},
			{
				id: "room",
				label: "E · Look at the Ramat room",
				x: 46,
				z: -199,
				r: 2.4
			},
			{
				id: "kiosk",
				label: sim.flags.ranStall ? "Kiosk closed" : "E · Mind the kiosk",
				x: KIOSK.x,
				z: KIOSK.z,
				r: 2.3
			},
			{
				id: "fuel",
				label: "E · Fill-up kiosk",
				x: FUEL.x,
				z: FUEL.z,
				r: 2.4
			}
		];
		for (const spot of spots) if (dist2(spot.x, spot.z) <= spot.r) return spot;
		return null;
	}
	function openPanel(panel) {
		sim.panel = panel;
		publish(true);
	}
	function snapshot() {
		return {
			version: 2,
			name: sim.name,
			background: sim.background,
			skin: sim.skin,
			cloth: sim.cloth,
			naira: sim.naira,
			day: sim.day,
			minutes: sim.minutes,
			hunger: sim.hunger,
			energy: sim.energy,
			debt: sim.debt,
			rentPaidDay: sim.rentPaidDay,
			home: sim.home,
			inv: { ...sim.inv },
			skill: sim.skill,
			rel: sim.rel,
			flags: { ...sim.flags },
			job: sim.job ? { ...sim.job } : null,
			px: sim.px,
			py: sim.py,
			pz: sim.pz,
			yaw: sim.yaw,
			mode: sim.mode,
			ride: sim.ride,
			fuel: sim.fuel,
			carUnlocked: sim.carUnlocked,
			raining: sim.raining,
			okada: { ...sim.okada },
			car: { ...sim.car },
			social: {
				...sim.social,
				respect: { ...sim.social.respect }
			}
		};
	}
	function applySave(data) {
		Object.assign(sim, {
			...data,
			flags: { ...data.flags },
			inv: { ...data.inv },
			job: data.job ? { ...data.job } : null,
			okada: { ...data.okada },
			car: { ...data.car },
			phase: "play",
			panel: null,
			footSpeed: 0,
			speed: data.mode === "drive" ? 4 : 0,
			stallStep: 0,
			stallProfit: 0,
			haggle: false,
			dryWarned: false,
			edgeTold: false,
			shake: 0,
			autoRainDay: data.raining ? data.day : -1,
			camOff: 0,
			muted: sim.muted,
			walkPhase: 0,
			social: data.social ? {
				...data.social,
				respect: { ...data.social.respect }
			} : defaultSocial(),
			reelT: 0,
			reelBeat: -1
		});
		dress();
	}
	function dress() {
		skinMat.color.setHex(SKIN[sim.skin] ?? SKIN[1]);
		clothMat.color.setHex(CLOTH[sim.cloth] ?? CLOTH[0]);
	}
	function spawnFresh(cfg) {
		const next = freshSim();
		Object.assign(sim, next);
		sim.name = cfg.name.trim() || "Osaze";
		sim.background = cfg.background;
		sim.skin = cfg.skin;
		sim.cloth = cfg.cloth;
		sim.phase = "play";
		sim.minutes = 410;
		sim.naira = cfg.background === "trader" ? 27e3 : cfg.background === "apprentice" ? 11e3 : 16e3;
		sim.carUnlocked = cfg.background === "trader";
		sim.skill = cfg.background === "apprentice" ? 1 : 0;
		sim.px = HILL_SPAWN.x;
		sim.pz = HILL_SPAWN.z;
		sim.py = 0;
		sim.yaw = HILL_SPAWN.yaw;
		biasForBackground(sim.social, cfg.background);
		dress();
	}
	const api = {
		startNew(cfg) {
			audio.unlock();
			spawnFresh(cfg);
			say("Morning on Ikpoba Hill. Rent is real, the market has a memory, and four names already share the road.");
			writeSave(snapshot());
		},
		continueGame() {
			const saved = loadSave();
			if (!saved) return false;
			audio.unlock();
			applySave(saved);
			say(`Day ${sim.day}. You are back on the hill.`);
			publish(true);
			return true;
		},
		togglePause() {
			if (sim.phase === "reel") {
				sim.phase = "title";
				sim.raining = false;
				publish(true);
				return;
			}
			if (sim.phase === "title") return;
			if (sim.panel && sim.phase === "play") {
				sim.panel = null;
				publish(true);
				return;
			}
			sim.phase = sim.phase === "pause" ? "play" : "pause";
			if (sim.phase === "pause") writeSave(snapshot());
			publish(true);
		},
		closePanel() {
			sim.panel = null;
			publish(true);
		},
		openPhone() {
			if (sim.phase === "title") return;
			sim.panel = sim.panel === "phone" ? null : "phone";
			sim.phase = "play";
			publish(true);
		},
		openMap() {
			if (sim.phase === "title") return;
			sim.panel = sim.panel === "map" ? null : "map";
			sim.phase = "play";
			publish(true);
		},
		buy(id) {
			if (id === "rice" && mamaRefusesRice(sim.social)) {
				say("Mama Eki looks through you. Night Line is on your name. She has no rice for you.");
				return;
			}
			const good = GOODS[id];
			const price = Math.round(good.price * (sim.haggle ? .8 : 1));
			if (sim.naira < price) {
				say("That is more than you are holding.");
				return;
			}
			sim.naira -= price;
			sim.inv[id] += 1;
			sim.flags = {
				...sim.flags,
				boughtFood: true
			};
			sim.haggle = false;
			sim.rel = Math.min(8, sim.rel + 1);
			audio.coin();
			say(`${good.name} is yours. ₦${price.toLocaleString("en-NG")}. Prices here are game rates.`);
		},
		haggle() {
			if (!allowHaggle(sim.social, sim.rel, sim.skill)) {
				say("Mama Eki smiles. Come back when she knows your face, after practice, or with Adesuwa warm.");
				return;
			}
			sim.haggle = true;
			say("Last price. Twenty percent off the next thing you pick up.");
		},
		useItem(id) {
			if (sim.inv[id] <= 0) return;
			const good = GOODS[id];
			sim.inv[id] -= 1;
			sim.hunger = clamp(sim.hunger - good.hunger, 0, 100);
			sim.energy = clamp(sim.energy + good.energy, 0, 100);
			say(`You take the ${good.name.toLowerCase()}.`);
		},
		acceptJob(id) {
			if (sim.job) {
				say("Finish the one you already took.");
				return;
			}
			sim.job = {
				id,
				stage: 0
			};
			sim.panel = null;
			say(id === "errand" ? "Mama Eki has a parcel. It is a short walk back up the hill." : "A passenger is waiting by Oregbeni. Okada only.");
		},
		payRent() {
			if (sim.rentPaidDay >= sim.day && sim.debt <= 0) {
				say("The ledger is already clear for today.");
				return;
			}
			const due = ECON.rent + sim.debt;
			if (sim.naira < due) {
				say(`You need ₦${due.toLocaleString("en-NG")} to clear it.`);
				return;
			}
			sim.naira -= due;
			sim.debt = 0;
			sim.rentPaidDay = sim.day;
			sim.flags = {
				...sim.flags,
				paidRent: true
			};
			audio.coin();
			say("Rent is marked. The room is yours for the day.");
			sim.panel = null;
		},
		sleep() {
			if (!(sim.home === "hill" ? dist2(-16.2, 15.4) < 2.4 : dist2(52, -202) < 2.4)) {
				say("Sleep happens in your own room.");
				return;
			}
			if (sim.rentPaidDay < sim.day) sim.debt += ECON.rent;
			sim.day += 1;
			sim.minutes = 400;
			sim.hunger = clamp(sim.hunger + 26, 0, 100);
			sim.energy = 100;
			sim.raining = false;
			sim.autoRainDay = -1;
			sim.flags = {
				...sim.flags,
				practisedToday: false
			};
			const broken = sleepSocial(sim.social);
			const spawn = sim.home === "hill" ? HILL_SPAWN : RAMAT_SPAWN;
			sim.px = spawn.x;
			sim.pz = spawn.z;
			sim.py = 0;
			sim.yaw = spawn.yaw;
			sim.mode = "foot";
			sim.ride = null;
			sim.speed = 0;
			sim.panel = null;
			sim.phase = "play";
			writeSave(snapshot());
			say(broken ?? `Day ${sim.day}. The hill is awake again.`);
		},
		reportDrain() {
			if (sim.flags.reportedDrain) {
				say("The ward desk already has it. This desk is part of the game, not a government service.");
				return;
			}
			sim.flags = {
				...sim.flags,
				reportedDrain: true
			};
			sim.rel = Math.min(8, sim.rel + 1);
			say("Logged with the fictional ward desk. A crew may clear it in a later day.");
		},
		practise() {
			sim.flags = {
				...sim.flags,
				readHeritage: true
			};
			if (sim.flags.practisedToday) {
				say("Enough wax for today. Come back after you sleep.");
				return;
			}
			sim.flags = {
				...sim.flags,
				apprenticed: true,
				readHeritage: true,
				practisedToday: true
			};
			sim.skill += 1;
			sim.naira += ECON.practice;
			audio.coin();
			sim.panel = null;
			say("You practise a pour. The real guilds are on Igun Street — this stall only teaches the rhythm.");
		},
		moveHome() {
			if (sim.home === "ramat") {
				say("You already keep the key to the Ramat room.");
				return;
			}
			if (sim.naira < ECON.ramat) {
				say(`The deposit is ₦${ECON.ramat.toLocaleString("en-NG")}. A game rate, not a city listing.`);
				return;
			}
			sim.naira -= ECON.ramat;
			sim.home = "ramat";
			sim.flags = {
				...sim.flags,
				movedHome: true
			};
			sim.px = RAMAT_SPAWN.x;
			sim.pz = RAMAT_SPAWN.z;
			sim.yaw = RAMAT_SPAWN.yaw;
			sim.panel = null;
			audio.coin();
			say("The hill room is let go. You wake nearer the park from now on.");
			writeSave(snapshot());
		},
		stallChoice(kind) {
			sim.stallProfit += kind === "fair" ? 220 : kind === "low" ? 90 : 0;
			sim.stallStep += 1;
			if (kind === "high") say("They walk. Margin is not the same thing as a sale.");
			else say(kind === "fair" ? "Fair price. They pay and go." : "They buy, and your margin is thin.");
			if (sim.stallStep >= 3) {
				sim.naira += sim.stallProfit;
				sim.flags = {
					...sim.flags,
					ranStall: true
				};
				audio.coin();
				say(`The kiosk clears ₦${sim.stallProfit.toLocaleString("en-NG")} for the hour.`);
				sim.stallStep = 0;
				sim.stallProfit = 0;
				sim.panel = null;
			} else publish(true);
		},
		refuel() {
			if (sim.naira < ECON.fuel) {
				say("The kiosk wants ₦400.");
				return;
			}
			sim.naira -= ECON.fuel;
			sim.fuel = 100;
			sim.dryWarned = false;
			audio.coin();
			say("Tank is full. Game price, not a pump price.");
		},
		setRain(on) {
			sim.raining = on;
			if (on) {
				sim.flags = {
					...sim.flags,
					sawRain: true
				};
				sim.autoRainDay = sim.day;
				say("Rain on the hill. The ramp is slicker, and the ground road is still there.");
			} else {
				sim.autoRainDay = sim.day;
				say("The rain moves off.");
			}
		},
		setHour(minutes) {
			sim.minutes = minutes;
			const elevNight = minutes > 1170 || minutes < 330;
			if (minutes >= 1020 && minutes <= 1110) say("Golden hour. Take the deck if you want the whole junction in one glance.");
			else if (elevNight) say("The windows come on. Headlights matter on the deck.");
			else say("The hour shifts. The roads do not.");
		},
		toggleMute() {
			sim.muted = !sim.muted;
			audio.setMuted(sim.muted);
			publish(true);
		},
		sit() {
			sim.energy = clamp(sim.energy + 12, 0, 100);
			sim.panel = null;
			say("Ramat Park. The flyover’s shadow crosses the grass. After dark this lawn answers to Night Line.");
		},
		meetPartner(tone) {
			if (dist2(ADESUWA.x, ADESUWA.z) > 3.4) {
				say("Adesuwa stands by the notice board.");
				return;
			}
			if (sim.social.partner === "adesuwa") {
				say(sim.social.mood === "strained" ? "She turns half away. Strained is not a conversation you can restart with charm." : `She is ${sim.social.mood}. Loyalty ${Math.round(sim.social.loyalty)}. The promise is ${sim.social.promise}.`);
				return;
			}
			say(applyMeet(sim.social, tone));
			sim.panel = null;
		},
		sideJob(id) {
			const spot = id === "union" ? UNION_YARD : id === "night" ? NIGHT_CORNER : HERITAGE;
			if (dist2(spot.x, spot.z) > 3.6) {
				say("You are not standing on their ground.");
				return;
			}
			if (id === "guild" && sim.naira < 200) {
				say("Wax for the pour is ₦200.");
				return;
			}
			const result = applySide(sim.social, id);
			sim.naira = Math.max(0, sim.naira + result.pay);
			if (id === "guild") {
				sim.skill += 1;
				sim.flags = {
					...sim.flags,
					apprenticed: true,
					readHeritage: true
				};
			}
			audio.coin();
			sim.panel = null;
			say(result.line);
		},
		partnerCall() {
			say(applyCall(sim.social));
		},
		giveRice() {
			if (dist2(ADESUWA.x, ADESUWA.z) > 3.4) {
				say("She is not here to take a plate.");
				return;
			}
			if (sim.inv.rice <= 0) {
				say("Rice, from Mama Eki. Cash will not close this promise.");
				return;
			}
			const line = applyRice(sim.social);
			if (!line) {
				say("She did not ask for rice.");
				return;
			}
			sim.inv.rice -= 1;
			sim.panel = null;
			say(line);
		},
		playReel() {
			audio.unlock();
			sim.phase = "reel";
			sim.panel = null;
			sim.reelT = 0;
			sim.reelBeat = -1;
			sim.raining = false;
			sim.minutes = 420;
			publish(true, "Ikpoba Hill. Rent is due before pride.");
		},
		skipReel() {
			if (sim.phase !== "reel") return;
			sim.phase = "title";
			sim.raining = false;
			sim.reelT = 0;
			publish(true);
		}
	};
	function interact() {
		const prompt = currentPrompt();
		if (!prompt) return;
		if (prompt.id === "mama") openPanel("shop");
		else if (prompt.id === "board") openPanel("jobs");
		else if (prompt.id === "heritage") openPanel("heritage");
		else if (prompt.id === "adesuwa" || prompt.id === "adesuwa-known") openPanel("partner");
		else if (prompt.id === "union" || prompt.id === "night") openPanel("factions");
		else if (prompt.id === "rice") api.giveRice();
		else if (prompt.id === "room") openPanel("room");
		else if (prompt.id === "ledger") openPanel("ledger");
		else if (prompt.id === "bed" || prompt.id === "bed-ramat") {
			if (prompt.id === "bed" && sim.home === "hill" || prompt.id === "bed-ramat" && sim.home === "ramat") openPanel("sleep");
			else say(prompt.id === "bed" ? "You let the hill room go." : "Pay the deposit before you sleep here.");
		} else if (prompt.id === "kiosk" && !sim.flags.ranStall) {
			sim.stallStep = 0;
			sim.stallProfit = 0;
			openPanel("stall");
		} else if (prompt.id === "drain") api.reportDrain();
		else if (prompt.id === "park") api.sit();
		else if (prompt.id === "fuel") api.refuel();
		else if (prompt.id === "errand-pick" && sim.job) {
			sim.job = {
				id: "errand",
				stage: 1
			};
			say("Parcel under your arm. The gate is back up the slope.");
		} else if (prompt.id === "errand-drop" && sim.job) {
			sim.job = null;
			sim.naira += ECON.errand;
			sim.flags = {
				...sim.flags,
				didJob: true
			};
			audio.coin();
			say(`Delivered. Mama Eki sends ₦${ECON.errand.toLocaleString("en-NG")}.`);
		} else if (prompt.id === "fare-pick" && sim.job) {
			sim.job = {
				id: "fare",
				stage: 1
			};
			say("They sit. Ramat Park. Mind the ramp if the deck is the quicker line.");
		} else if (prompt.id === "fare-drop" && sim.job) {
			sim.job = null;
			const pay = Math.round(ECON.fare * fareBonus(sim.social));
			sim.naira += pay;
			sim.flags = {
				...sim.flags,
				didJob: true,
				reachedRamat: true
			};
			audio.coin();
			const bonus = pay > ECON.fare ? " Adesuwa’s name was in the price." : "";
			say(`Fare paid, ₦${pay.toLocaleString("en-NG")}.${bonus}`);
		}
	}
	function tryMount() {
		if (sim.phase !== "play" || sim.panel) return;
		if (sim.mode === "drive") {
			const ride = sim.ride === "car" ? sim.car : sim.okada;
			ride.x = sim.px;
			ride.z = sim.pz;
			ride.yaw = sim.yaw;
			const rx = Math.cos(sim.yaw);
			const rz = -Math.sin(sim.yaw);
			sim.px += rx * 1.35;
			sim.pz += rz * 1.35;
			sim.mode = "foot";
			sim.ride = null;
			sim.speed = 0;
			sim.footSpeed = 0;
			say("You step off.");
			return;
		}
		if (dist2(sim.okada.x, sim.okada.z) < 2.8) {
			sim.mode = "drive";
			sim.ride = "okada";
			sim.yaw = sim.okada.yaw;
			sim.px = sim.okada.x;
			sim.pz = sim.okada.z;
			sim.speed = 0;
			say("Okada. A turns left, D turns right. The deck and the ground road are not the same street.");
			return;
		}
		if (dist2(sim.car.x, sim.car.z) < 3) {
			if (!sim.carUnlocked) {
				if (sim.naira < ECON.hire) {
					say("Hire is ₦500 for the day.");
					return;
				}
				sim.naira -= ECON.hire;
				sim.carUnlocked = true;
				audio.coin();
			}
			sim.mode = "drive";
			sim.ride = "car";
			sim.yaw = sim.car.yaw;
			sim.px = sim.car.x;
			sim.pz = sim.car.z;
			sim.speed = 0;
			say("Car is yours until you step off. Heavier in the rain.");
		}
	}
	function onKeyDown(e) {
		const target = e.target;
		if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
		if (e.repeat) {
			keys.add(e.code);
			return;
		}
		keys.add(e.code);
		if (sim.phase === "play" && !sim.panel) {
			if ([
				"Space",
				"ArrowUp",
				"ArrowDown",
				"ArrowLeft",
				"ArrowRight"
			].includes(e.code)) e.preventDefault();
			if (e.code === "KeyE") pad.interact = true;
			if (e.code === "KeyF") pad.mount = true;
			if (e.code === "Space") pad.horn = true;
		}
		if (e.code === "Escape") api.togglePause();
		if (e.code === "KeyM") api.openMap();
		if (e.code === "KeyI") api.openPhone();
	}
	function onKeyUp(e) {
		keys.delete(e.code);
	}
	function onBlur() {
		keys.clear();
		pad.joy = false;
		pad.run = false;
	}
	window.addEventListener("keydown", onKeyDown);
	window.addEventListener("keyup", onKeyUp);
	window.addEventListener("blur", onBlur);
	disposers.push(() => {
		window.removeEventListener("keydown", onKeyDown);
		window.removeEventListener("keyup", onKeyUp);
		window.removeEventListener("blur", onBlur);
	});
	const onPointerDown = (e) => {
		audio.unlock();
		if (e.button !== 0 && e.button !== 2) return;
		dragging = true;
		lastX = e.clientX;
		view.setPointerCapture(e.pointerId);
	};
	const onPointerMove = (e) => {
		if (!dragging) return;
		const dx = e.clientX - lastX;
		lastX = e.clientX;
		sim.camOff -= dx * .005;
	};
	const onPointerUp = () => {
		dragging = false;
	};
	view.addEventListener("pointerdown", onPointerDown);
	view.addEventListener("pointermove", onPointerMove);
	view.addEventListener("pointerup", onPointerUp);
	view.addEventListener("pointercancel", onPointerUp);
	view.addEventListener("contextmenu", (e) => e.preventDefault());
	disposers.push(() => {
		view.removeEventListener("pointerdown", onPointerDown);
		view.removeEventListener("pointermove", onPointerMove);
		view.removeEventListener("pointerup", onPointerUp);
		view.removeEventListener("pointercancel", onPointerUp);
	});
	function resize() {
		const w = view.clientWidth || window.innerWidth;
		const h = view.clientHeight || window.innerHeight;
		renderer.setSize(w, h, false);
		camera.aspect = w / Math.max(1, h);
		camera.updateProjectionMatrix();
	}
	resize();
	const resizeObserver = new ResizeObserver(resize);
	resizeObserver.observe(view.parentElement ?? view);
	disposers.push(() => resizeObserver.disconnect());
	function stepAgents(dt) {
		for (const agent of agents) {
			const length = roadLength(roadById(agent.road));
			agent.dist = (agent.dist + agent.speed * dt + length) % length;
		}
		for (const ped of peds) {
			const length = roadLength(roadById(ped.road));
			ped.dist += ped.speed * dt;
			ped.phase += dt * 4;
			if (ped.dist > length - 8 || ped.dist < 8) ped.speed *= -1;
			ped.dist = clamp(ped.dist, 8, length - 8);
		}
	}
	function writeAgents() {
		const counters = {
			car: 0,
			okada: 0,
			bus: 0
		};
		for (const agent of agents) {
			const p = pointOnRoad(roadById(agent.road), agent.dist);
			const side = agent.lane === 0 ? 0 : agent.lane;
			const x = p.x + -p.tz * side * 1.7;
			const z = p.z + p.tx * side * 1.7;
			const facing = yawFromTangent(p.tx * Math.sign(agent.speed || 1), p.tz * Math.sign(agent.speed || 1));
			dummy.position.set(x, p.y, z);
			dummy.rotation.set(0, facing + Math.PI, 0);
			dummy.scale.set(1, 1, 1);
			dummy.updateMatrix();
			const mesh = trafficMesh[agent.kind];
			const index = counters[agent.kind]++;
			mesh.setMatrixAt(index, dummy.matrix);
			color.setHex(agent.color);
			mesh.setColorAt(index, color);
			if (sim.mode === "drive" && Math.hypot(sim.px - x, sim.pz - z) < 2.15 && Math.abs(sim.speed) > 4) {
				sim.speed *= .42;
				sim.shake = .45;
				audio.thud();
			}
		}
		for (const kind of [
			"car",
			"okada",
			"bus"
		]) {
			trafficMesh[kind].instanceMatrix.needsUpdate = true;
			if (trafficMesh[kind].instanceColor) trafficMesh[kind].instanceColor.needsUpdate = true;
		}
		for (let i = 0; i < peds.length; i++) {
			const ped = peds[i];
			const road = roadById(ped.road);
			const p = pointOnRoad(road, ped.dist);
			const x = p.x + -p.tz * ped.side * (road.width * .5 + 1.7);
			const z = p.z + p.tx * ped.side * (road.width * .5 + 1.7);
			const bob = Math.sin(ped.phase) * .06;
			const facing = yawFromTangent(p.tx * Math.sign(ped.speed), p.tz * Math.sign(ped.speed));
			dummy.position.set(x, .72 + bob, z);
			dummy.rotation.set(0, facing + Math.PI, 0);
			dummy.scale.set(1, 1, 1);
			dummy.updateMatrix();
			pedBody.setMatrixAt(i, dummy.matrix);
			dummy.position.y = 1.38 + bob;
			dummy.updateMatrix();
			pedHead.setMatrixAt(i, dummy.matrix);
		}
		pedBody.instanceMatrix.needsUpdate = true;
		pedHead.instanceMatrix.needsUpdate = true;
	}
	function stepPlayer(dt) {
		if (consume("horn") && sim.mode === "drive") audio.horn();
		if (consume("interact")) interact();
		if (consume("mount")) tryMount();
		if (sim.mode === "foot") {
			const basis = sim.yaw + sim.camOff;
			const fx = -Math.sin(basis);
			const fz = -Math.cos(basis);
			const rx = Math.cos(basis);
			const rz = -Math.sin(basis);
			let throttle = 0;
			let strafe = 0;
			if (keys.has("KeyW") || keys.has("ArrowUp")) throttle += 1;
			if (keys.has("KeyS") || keys.has("ArrowDown")) throttle -= 1;
			if (keys.has("KeyA") || keys.has("ArrowLeft")) strafe -= 1;
			if (keys.has("KeyD") || keys.has("ArrowRight")) strafe += 1;
			if (pad.joy) {
				throttle += pad.joyY;
				strafe += pad.joyX;
			}
			throttle = clamp(throttle, -1, 1);
			strafe = clamp(strafe, -1, 1);
			let wishX = fx * throttle + rx * strafe;
			let wishZ = fz * throttle + rz * strafe;
			const wishLen = Math.hypot(wishX, wishZ) || 1;
			if (Math.hypot(wishX, wishZ) > 1) {
				wishX /= wishLen;
				wishZ /= wishLen;
			}
			const moving = Math.hypot(wishX, wishZ) > .08;
			const running = keys.has("ShiftLeft") || keys.has("ShiftRight") || pad.run;
			let target = moving ? (running ? 6.3 : 3.2) * Math.min(1, Math.hypot(wishX, wishZ)) : 0;
			if (sim.energy < 12) target *= .62;
			if (sim.pz < -246 && sim.py < .8) target *= .45;
			sim.footSpeed += (target - sim.footSpeed) * Math.min(1, dt * 9);
			if (moving) {
				const targetYaw = Math.atan2(-wishX, -wishZ);
				sim.yaw = dampAngle(sim.yaw, targetYaw, dt, 10);
				sim.px += wishX * sim.footSpeed * dt;
				sim.pz += wishZ * sim.footSpeed * dt;
				sim.walkPhase += dt * sim.footSpeed * 2.4;
			}
			sim.speed = 0;
		} else {
			let throttle = 0;
			let steer = 0;
			if (keys.has("KeyW") || keys.has("ArrowUp")) throttle += 1;
			if (keys.has("KeyS") || keys.has("ArrowDown")) throttle -= 1;
			if (keys.has("KeyA") || keys.has("ArrowLeft")) steer += 1;
			if (keys.has("KeyD") || keys.has("ArrowRight")) steer -= 1;
			if (pad.joy) {
				throttle += pad.joyY;
				steer += -pad.joyX;
			}
			if (steerOverride !== null) steer = steerOverride;
			throttle = clamp(throttle, -1, 1);
			steer = clamp(steer, -1, 1);
			const okada = sim.ride === "okada";
			const dry = sim.fuel <= 0;
			const max = (okada ? 14.6 : 16.8) * (sim.raining ? .84 : 1) * (dry ? .2 : 1);
			const accel = (okada ? 18 : 12) * (dry ? .35 : 1);
			const brake = (okada ? 24 : 28) * (sim.raining ? .6 : 1);
			if (throttle > .05) sim.speed += accel * throttle * dt;
			else if (throttle < -.05) sim.speed -= (sim.speed > .4 ? brake : accel * .55) * dt;
			else sim.speed *= Math.exp(-1.7 * dt);
			sim.speed = clamp(sim.speed, -4.2, max);
			const reverse = sim.speed >= 0 ? 1 : -1;
			const speedFactor = clamp(Math.abs(sim.speed) / 4.2, .22, 1);
			const turn = (okada ? 2.2 : 1.42) * (sim.raining ? 1.2 : 1);
			sim.yaw += steer * turn * speedFactor * reverse * dt;
			const fx = -Math.sin(sim.yaw);
			const fz = -Math.cos(sim.yaw);
			sim.px += fx * sim.speed * dt;
			sim.pz += fz * sim.speed * dt;
			sim.footSpeed = Math.abs(sim.speed);
			if (!dry && Math.abs(sim.speed) > 1) sim.fuel = Math.max(0, sim.fuel - dt * (okada ? 1.55 : 2.05));
			if (sim.fuel <= 0 && !sim.dryWarned) {
				sim.dryWarned = true;
				say("The tank is dry. Coast to the Oregbeni fill-up, or walk it.");
			}
		}
		const radius = sim.mode === "drive" ? .72 : .4;
		const resolved = resolveCircle(sim.px, sim.pz, radius);
		sim.px = resolved.x;
		sim.pz = resolved.z;
		const hit = querySurface(sim.px, sim.pz, sim.py);
		const surface = hit ? hit.y : 0;
		sim.py += (surface - sim.py) * Math.min(1, dt * 10);
		const held = constrainElevated(sim.px, sim.pz, sim.py);
		sim.px = held.x;
		sim.pz = held.z;
		if (sim.px < -168 || sim.px > 172 || sim.pz > 68 || sim.pz < -312) {
			sim.px = clamp(sim.px, -168, 172);
			sim.pz = clamp(sim.pz, -312, 68);
			sim.speed *= .2;
			if (!sim.edgeTold) {
				sim.edgeTold = true;
				say("Edge of the slice. The rest of Benin City is not in this build.");
			}
		}
		if (sim.py > 5 && !sim.flags.crested) {
			sim.flags = {
				...sim.flags,
				crested: true
			};
			say("You are on the deck. The junction under you is a different road — no hidden ramp in the middle.");
		}
		if (Math.hypot(sim.px - PARK.x, sim.pz - PARK.z) < PARK.r + 2 && !sim.flags.reachedRamat) {
			sim.flags = {
				...sim.flags,
				reachedRamat: true
			};
			say("Ramat Park. The flyover is the landmark; the lawn is the pause.");
		}
		if (sim.px > -8.6 && !sim.flags.exited && sim.home === "hill" && sim.pz > 0 && sim.pz < 24) {
			sim.flags = {
				...sim.flags,
				exited: true
			};
			say("Ikpoba Slope. Oregbeni is downhill. Ramat is further, under and over the flyover.");
		}
		drift(sim.social, dt);
		const pressure = cityPressure(sim.social, {
			day: sim.day,
			minutes: sim.minutes,
			x: sim.px,
			z: sim.pz,
			naira: sim.naira
		});
		if (pressure.take > 0) {
			sim.naira -= pressure.take;
			sim.speed *= pressure.slow;
			sim.footSpeed *= pressure.slow;
			sim.shake = .35;
		}
		if (pressure.line) say(pressure.line);
		sim.minutes += dt * 2.5;
		if (sim.minutes >= 1440) {
			sim.minutes -= 1440;
			sim.day += 1;
		}
		sim.hunger = clamp(sim.hunger + dt * .18, 0, 100);
		if (sim.hunger > 80) sim.energy = clamp(sim.energy - dt * .4, 0, 100);
		else if (sim.hunger < 30) sim.energy = clamp(sim.energy + dt * .08, 0, 100);
		if (sim.minutes >= 1020 && sim.minutes < 1152 && sim.autoRainDay !== sim.day) {
			sim.raining = true;
			sim.autoRainDay = sim.day;
			sim.flags = {
				...sim.flags,
				sawRain: true
			};
			say("Rain reaches the hill. Braking takes longer. The ground road is the calmer line.");
		}
	}
	function poseWorld(dt) {
		const dayT = (sim.minutes - 360) / 750;
		const clamped = clamp(dayT, 0, 1);
		const elev = dayT < 0 || dayT > 1 ? -.12 : Math.sin(clamped * Math.PI);
		const az = -.85 + clamped * 2.5;
		sunVec.set(Math.cos(az), Math.max(.08, elev), Math.sin(az)).normalize();
		const night = elev < .08 ? 1 : elev > .38 ? 0 : 1 - (elev - .08) / .3;
		const rainAmt = sim.raining ? 1 : 0;
		const reelFocus = sim.phase === "reel" ? reelAnchor(sim.reelT) : null;
		const focusX = reelFocus ? reelFocus.lx : sim.phase === "title" ? 10 : sim.px;
		const focusZ = reelFocus ? reelFocus.lz : sim.phase === "title" ? -175 : sim.pz;
		sun.position.set(focusX + sunVec.x * 48, Math.max(8, sunVec.y * 48), focusZ + sunVec.z * 48);
		sun.target.position.set(focusX, 0, focusZ);
		sun.target.updateMatrixWorld();
		sun.intensity = (2.5 * Math.max(elev, 0) + .15) * (1 - rainAmt * .45);
		sun.color.set(night > .6 ? 11126015 : 16773336);
		hemi.intensity = .42 + (1 - night) * .55 - rainAmt * .1;
		hemi.color.set(night > .5 ? 2372694 : 16769732);
		hemi.groundColor.set(6963248);
		nightFill.intensity = night * .35;
		buildingMat.emissiveIntensity = night * 1.55;
		bulbMat.emissiveIntensity = night * 2.4;
		asphaltMat.roughness = sim.raining ? .28 : .92;
		asphaltMat.color.set(sim.raining ? 10134445 : 16777215);
		renderer.toneMappingExposure = 1.05 + (1 - night) * .08 - rainAmt * .12;
		const fog = scene.fog;
		const horizon = night > .5 ? fogNight : rainAmt > 0 ? fogRain : fogHot;
		fog.color.copy(horizon);
		fog.density = .0065 + night * .004 + rainAmt * .01;
		skyMat.uniforms.uElev.value = elev;
		skyMat.uniforms.uSun.value.copy(sunVec);
		skyMat.uniforms.uRain.value = rainAmt;
		sky.position.set(camera.position.x, 0, camera.position.z);
		head.intensity = sim.mode === "drive" && night > .35 ? 10 * night : 0;
		const active = sim.ride === "car" ? rideCar : rideOkada;
		if (sim.mode === "drive") {
			head.position.set(sim.px, sim.py + .8, sim.pz);
			ahead.set(-Math.sin(sim.yaw), 0, -Math.cos(sim.yaw));
			head.target.position.set(sim.px + ahead.x * 10, sim.py + .4, sim.pz + ahead.z * 10);
			head.target.updateMatrixWorld();
			active.position.set(sim.px, sim.py, sim.pz);
			active.rotation.set(0, sim.yaw + Math.PI, sim.ride === "okada" ? 0 : 0);
			active.rotation.z = sim.ride === "okada" ? steerLean() : steerLean() * .35;
			rideOkada.visible = sim.ride === "okada";
			rideCar.visible = sim.ride === "car";
			avatar.position.set(sim.px + ahead.x * -.12, sim.py + (sim.ride === "okada" ? .48 : .42), sim.pz + ahead.z * -.12);
			avatar.rotation.set(0, sim.yaw + Math.PI, 0);
			legL.rotation.x = 1.05;
			legR.rotation.x = 1.05;
		} else {
			rideOkada.visible = false;
			rideCar.visible = false;
			head.intensity = 0;
			avatar.position.set(sim.px, sim.py, sim.pz);
			avatar.rotation.set(0, sim.yaw + Math.PI, 0);
			const swing = Math.sin(sim.walkPhase) * Math.min(.7, sim.footSpeed * .18);
			legL.rotation.x = swing;
			legR.rotation.x = -swing;
			armL.rotation.x = -swing;
			armR.rotation.x = swing;
		}
		parkedOkada.visible = sim.ride !== "okada";
		parkedCar.visible = sim.ride !== "car";
		parkedOkada.position.set(sim.okada.x, 0, sim.okada.z);
		parkedOkada.rotation.y = sim.okada.yaw + Math.PI;
		parkedCar.position.set(sim.car.x, 0, sim.car.z);
		parkedCar.rotation.y = sim.car.yaw + Math.PI;
		const ridingWith = sim.social.partner === "adesuwa" && sim.social.loyalty >= 40 && sim.social.mood !== "strained" && sim.mode === "drive" && sim.ride === "okada" && sim.phase === "play";
		partner.visible = sim.phase === "play" || sim.phase === "pause";
		if (ridingWith) {
			const bx = -Math.sin(sim.yaw);
			const bz = -Math.cos(sim.yaw);
			partner.position.set(sim.px - bx * .42, sim.py + .46, sim.pz - bz * .42);
			partner.rotation.set(0, sim.yaw + Math.PI, 0);
		} else {
			partner.position.set(ADESUWA.x, Math.sin(elapsed * 1.4) * .02, ADESUWA.z);
			partner.rotation.y = sim.social.mood === "strained" ? Math.PI : .6;
		}
		const anchor = markerTarget();
		marker.visible = !!anchor && sim.phase === "play";
		if (anchor) marker.position.set(anchor.x, 3 + Math.sin(elapsed * 3) * .25, anchor.z);
		if (sim.raining) {
			const arr = rain.geometry.attributes.position;
			const pos = arr.array;
			for (let i = 0; i < pos.length; i += 3) {
				pos[i + 1] -= dt * 18;
				if (pos[i + 1] < 0) pos[i + 1] = 22;
				pos[i] += sim.phase === "title" ? 0 : 0;
			}
			rain.position.set(camera.position.x, 0, camera.position.z);
			arr.needsUpdate = true;
			rain.visible = true;
		} else rain.visible = false;
		if (!reduce && sim.shake > 0) sim.shake = Math.max(0, sim.shake - dt * 1.4);
	}
	function steerLean() {
		let steer = 0;
		if (keys.has("KeyA") || keys.has("ArrowLeft")) steer += 1;
		if (keys.has("KeyD") || keys.has("ArrowRight")) steer -= 1;
		if (pad.joy) steer += -pad.joyX;
		return steer * .28;
	}
	function markerTarget() {
		if (!sim.job) {
			if (!sim.flags.reachedRamat) return {
				x: PARK.x,
				z: PARK.z
			};
			return null;
		}
		if (sim.job.id === "errand" && sim.job.stage === 0) return MAMA;
		if (sim.job.id === "errand") return ERRAND_DROP;
		if (sim.job.id === "fare" && sim.job.stage === 0) return FARE_PICK;
		return FARE_DROP;
	}
	function reelAnchor(t) {
		const stops = [
			{
				t: 0,
				x: -28,
				y: 9,
				z: 24,
				lx: -12,
				ly: 1.6,
				lz: 8
			},
			{
				t: 6,
				x: -36,
				y: 8,
				z: -24,
				lx: -8,
				ly: 1.4,
				lz: -42
			},
			{
				t: 12,
				x: -10,
				y: 18,
				z: -158,
				lx: 24,
				ly: 8.2,
				lz: -175
			},
			{
				t: 18,
				x: 48,
				y: 14,
				z: -198,
				lx: 78,
				ly: 2,
				lz: -220
			},
			{
				t: 24,
				x: 96,
				y: 11,
				z: -236,
				lx: 74,
				ly: 1.5,
				lz: -228
			},
			{
				t: 30,
				x: 30,
				y: 26,
				z: -140,
				lx: 10,
				ly: 7,
				lz: -175
			}
		];
		let i = 0;
		while (i < stops.length - 2 && t > stops[i + 1].t) i += 1;
		const a = stops[i];
		const b = stops[Math.min(stops.length - 1, i + 1)];
		const span = Math.max(.001, b.t - a.t);
		const u = Math.max(0, Math.min(1, (t - a.t) / span));
		const e = u * u * (3 - 2 * u);
		const mix = (p, q) => p + (q - p) * e;
		return {
			x: mix(a.x, b.x),
			y: mix(a.y, b.y),
			z: mix(a.z, b.z),
			lx: mix(a.lx, b.lx),
			ly: mix(a.ly, b.ly),
			lz: mix(a.lz, b.lz)
		};
	}
	function frameCamera(dt) {
		if (sim.phase === "reel") {
			const a = reelAnchor(sim.reelT);
			desired.set(a.x, a.y, a.z);
			look.set(a.lx, a.ly, a.lz);
			const k = 1 - Math.exp(-dt * 1.5);
			camPos.lerp(desired, k);
			camera.position.copy(camPos);
			camera.lookAt(look);
			camera.fov += (60 - camera.fov) * Math.min(1, dt * 2);
			camera.updateProjectionMatrix();
			return;
		}
		if (sim.phase === "title") {
			const x = -50 + (reduce ? .35 : elapsed % 32 / 32) * 140;
			desired.set(x, 14.5, -149);
			look.set(x + 16, 6.2, -175);
			const k = 1 - Math.exp(-dt * 1.4);
			camPos.lerp(desired, k);
			camera.position.copy(camPos);
			camera.lookAt(look);
			camera.fov += (62 - camera.fov) * Math.min(1, dt * 2);
			camera.updateProjectionMatrix();
			return;
		}
		const fx = -Math.sin(sim.yaw + sim.camOff);
		const fz = -Math.cos(sim.yaw + sim.camOff);
		const dist = sim.mode === "drive" ? 8.4 + Math.min(2.2, Math.abs(sim.speed) * .12) : 5.6;
		const height = sim.mode === "drive" ? 3.15 : 2.35;
		desired.set(sim.px - fx * dist, sim.py + height, sim.pz - fz * dist);
		const steps = 8;
		let clearX = sim.px;
		let clearY = sim.py + 1.5;
		let clearZ = sim.pz;
		for (let i = 1; i <= steps; i++) {
			const t = i / steps;
			const x = sim.px + (desired.x - sim.px) * t;
			const y = sim.py + 1.5 + (desired.y - (sim.py + 1.5)) * t;
			const z = sim.pz + (desired.z - sim.pz) * t;
			if (y < 4.2 && pointInSolid(x, z)) break;
			clearX = x;
			clearY = y;
			clearZ = z;
		}
		desired.set(clearX, clearY, clearZ);
		if (sim.shake > 0 && !reduce) {
			desired.x += Math.sin(elapsed * 48) * sim.shake * .15;
			desired.y += Math.cos(elapsed * 37) * sim.shake * .1;
		}
		const k = 1 - Math.exp(-dt * (sim.mode === "drive" ? 4.5 : 7));
		camPos.lerp(desired, k);
		camera.position.copy(camPos);
		look.set(sim.px + fx * 1.8, sim.py + (sim.mode === "drive" ? 1.15 : 1.25), sim.pz + fz * 1.8);
		camera.lookAt(look);
		const fov = sim.mode === "drive" ? 64 + Math.min(6, Math.abs(sim.speed) * .35) : 56;
		camera.fov += (fov - camera.fov) * Math.min(1, dt * 3);
		camera.updateProjectionMatrix();
		if (!dragging) sim.camOff *= Math.exp(-dt * 2.4);
	}
	function drawMap() {
		if (!mapCtx || !minimap || !mapBase) return;
		const w = minimap.width;
		const h = minimap.height;
		mapCtx.clearRect(0, 0, w, h);
		mapCtx.drawImage(mapBuffer, 0, 0, w, h);
		const project = (x, z) => ({
			x: (12 + (x + 170) / 350 * 296) * (w / 320),
			y: (12 + (z + 310) / 380 * 296) * (h / 320)
		});
		if (sim.phase !== "title") {
			const p = project(sim.px, sim.pz);
			mapCtx.save();
			mapCtx.translate(p.x, p.y);
			mapCtx.rotate(Math.atan2(-Math.cos(sim.yaw), -Math.sin(sim.yaw)));
			mapCtx.fillStyle = "#d4652f";
			mapCtx.beginPath();
			mapCtx.moveTo(7, 0);
			mapCtx.lineTo(-5, 4.5);
			mapCtx.lineTo(-5, -4.5);
			mapCtx.closePath();
			mapCtx.fill();
			mapCtx.restore();
		}
		const marks = [
			{
				x: UNION_YARD.x,
				z: UNION_YARD.z,
				c: "#d4652f"
			},
			{
				x: -18,
				z: -40,
				c: "#e0b15a"
			},
			{
				x: 68,
				z: -214,
				c: "#3e6b52"
			},
			{
				x: NIGHT_CORNER.x,
				z: NIGHT_CORNER.z,
				c: "#f4ebd8"
			}
		];
		for (const mark of marks) {
			const q = project(mark.x, mark.z);
			mapCtx.fillStyle = mark.c;
			mapCtx.fillRect(q.x - 2.2, q.y - 2.2, 4.4, 4.4);
		}
	}
	let acc = 0;
	function loop(timestamp) {
		timer.update(timestamp);
		const frameDt = Math.min(timer.getDelta(), .05);
		elapsed += frameDt;
		if (sim.phase === "reel") {
			sim.reelT += frameDt;
			const beat = sim.reelT < 6 ? 0 : sim.reelT < 12 ? 1 : sim.reelT < 18 ? 2 : sim.reelT < 24 ? 3 : 4;
			if (beat !== sim.reelBeat) {
				sim.reelBeat = beat;
				const lines = [
					"Ikpoba Hill. Rent is due before pride.",
					"Oregbeni does not only sell food. It sells names.",
					"The flyover is a border. Under it, another law.",
					"Rain makes every faction honest.",
					"Ramat Park. Choose who rides home with you."
				];
				sim.minutes = [
					420,
					660,
					960,
					1104,
					1230
				][beat];
				sim.raining = beat >= 3;
				say(lines[beat]);
			}
			if (sim.reelT >= 30) {
				sim.phase = "title";
				sim.raining = false;
				sim.reelT = 30;
				publish(true, "The corridor is still there. Step into it.");
			}
		}
		if (sim.phase === "title" || sim.phase === "reel" || sim.phase === "play" && !sim.panel) {
			acc += frameDt;
			let guard = 0;
			while (acc >= STEP && guard++ < 5) {
				stepAgents(STEP);
				if (sim.phase === "play" && !sim.panel) stepPlayer(STEP);
				acc -= STEP;
			}
		} else acc = 0;
		writeAgents();
		poseWorld(frameDt);
		frameCamera(frameDt);
		const market = clamp(1 - dist2(-20, -40) / 40, 0, 1);
		audio.update(frameDt, {
			driving: sim.mode === "drive" && sim.phase === "play",
			speed: sim.speed,
			raining: sim.raining,
			walking: sim.mode === "foot" && sim.footSpeed > .4 && sim.phase === "play" && !sim.panel,
			market
		});
		if (sim.phase === "play" && !sim.panel) {
			saveAcc += frameDt;
			if (saveAcc > 18) {
				saveAcc = 0;
				writeSave(snapshot());
			}
		}
		hudAcc += frameDt;
		publish(false);
		drawMap();
		renderer.render(scene, camera);
	}
	const probe = {
		getYaw: () => sim.yaw,
		getSpeed: () => sim.mode === "drive" ? Math.abs(sim.speed) : sim.footSpeed,
		setKeys,
		setSteer: (v) => setSteer(v)
	};
	window.__controlsTest = probe;
	bridge.api = api;
	if (bridge.pendingNew) {
		const cfg = bridge.pendingNew;
		bridge.pendingNew = null;
		api.startNew(cfg);
	} else if (bridge.pendingContinue) {
		bridge.pendingContinue = false;
		api.continueGame();
	}
	publish(true);
	renderer.setAnimationLoop(loop);
	const onHide = () => {
		if (document.hidden && sim.phase === "play") writeSave(snapshot());
	};
	document.addEventListener("visibilitychange", onHide);
	return () => {
		renderer.setAnimationLoop(null);
		document.removeEventListener("visibilitychange", onHide);
		for (const dispose of disposers) dispose();
		timer.dispose();
		audio.dispose();
		if (bridge.api === api) bridge.api = null;
		if (window.__controlsTest === probe) delete window.__controlsTest;
		for (const geo of geos) geo.dispose();
		for (const mat of mats) mat.dispose();
		facade.dispose();
		glow.dispose();
		asphaltMap.dispose();
		laterite.dispose();
		concreteMap.dispose();
		renderer.dispose();
	};
}
var CLUSTERS = [
	"Partner dynamics",
	"Social web and kinship",
	"Faction organisms",
	"Behavioral simulation",
	"Cross-system payoff"
];
var SUGGESTIONS = [
	{
		n: 1,
		cluster: CLUSTERS[0],
		name: "Promise Ledger",
		fantasy: "A partner who remembers the exact sentence you agreed to, not a heart meter.",
		choice: "Accept rice, a clear night, or a guild errand. Sleep on it and the promise flips to broken without a cutscene apology.",
		systems: "Loyalty, market prices, Night Line heat, and whether she will sit the okada on the next fare.",
		flavor: "In Benin City a plate of rice can be louder than cash. The ledger treats food, face, and money as different currencies.",
		depth: "Broken promises alter her route for days: she stops meeting you at the board and starts texting your uncle instead."
	},
	{
		n: 2,
		cluster: CLUSTERS[0],
		name: "Three Ways to Speak",
		fantasy: "The recruit conversation is a build, not a yes/no.",
		choice: "Kin, straight, or business. Each writes opening respect into a different faction and sets her mood to warm, wary, or proud.",
		systems: "Oregbeni prices, Union access, Night Line suspicion, haggle permission.",
		flavor: "Calling someone cousin before you have earned it is a recognized social move — and a debt.",
		depth: "Proud partners push high-margin jobs and judge you for safe ones. Warm partners veto spectacle."
	},
	{
		n: 3,
		cluster: CLUSTERS[0],
		name: "Pillion Politics",
		fantasy: "She rides the okada and changes the fare, the route risk, and who sees you.",
		choice: "Take her along, leave her, or ride after she has refused. Refusal is a system state, not a locked mission.",
		systems: "Fare payout, witness memory, accident blame, faction sightings.",
		flavor: "An extra body on a bike is read instantly at a junction: couple, courier, or someone being moved.",
		depth: "NPCs store 'last seen with' for a week. A rival can mention the pillion in a shakedown."
	},
	{
		n: 4,
		cluster: CLUSTERS[0],
		name: "Mood Stack",
		fantasy: "Warm, wary, proud, strained — four operating systems, not four faces.",
		choice: "You can push a proud partner into warm with guild work, or into strained with one Night Line pickup.",
		systems: "Dialogue availability, haggle override, phone pickup, sleep consequences.",
		flavor: "Strained is not angry shouting. It is the call that rings out, which in this culture is a public fact.",
		depth: "Mood plus loyalty plus today's heat produce refusal thresholds that move without a designer flag."
	},
	{
		n: 5,
		cluster: CLUSTERS[0],
		name: "Partner Economy",
		fantasy: "She has her own naira, her own rent, and will not be a costume.",
		choice: "Cover her room, split a fare, or let her take a market shift that ties her to Mama Eki's books.",
		systems: "If you drain her savings she takes a Night Line errand alone. You inherit the heat.",
		flavor: "Women in the market already run credit. She is not waiting to be rescued from it.",
		depth: "Her off-screen day is simulated in the same tick as factions, so you return to consequences."
	},
	{
		n: 6,
		cluster: CLUSTERS[0],
		name: "Jealous Routes",
		fantasy: "A second bond — a cousin, a rider, a guild senior — competes for your evenings.",
		choice: "Who you sit with at Ramat Park writes a rumor before it writes a romance.",
		systems: "Park territory, family face, partner loyalty, owambe invitations.",
		flavor: "People do not say 'relationship status'. They say who you were seen with under the flyover.",
		depth: "Rumors propagate through the market at closing time, one stall per hour."
	},
	{
		n: 7,
		cluster: CLUSTERS[0],
		name: "Refusal Window",
		fantasy: "She can pull the key out of a job while you are already on the bike.",
		choice: "Turn around, drop her at the junction, or override her and take the loyalty hit in public.",
		systems: "Heat spike if you override near witnesses. Union respect if you turn the bike.",
		flavor: "Public override is shame. Private override is a fight at home. Both are tracked.",
		depth: "Witness count is geometric: stalls open, rain, time of day. Rain lowers witnesses and raises moral cost."
	},
	{
		n: 8,
		cluster: CLUSTERS[0],
		name: "Shared Bed, Separate Ledger",
		fantasy: "Moving into the Ramat room together changes rent, gossip, and who may knock.",
		choice: "One room, two rooms, or she keeps the hill and you take the park.",
		systems: "Rent due, Night Line visits, family phone calls, save-game home spawn.",
		flavor: "A woman entering a man's new room is a statement to the compound, not an unlockable skin.",
		depth: "Knock events at night differ by address. The hill knock is Union. The Ramat knock is Night Line."
	},
	{
		n: 9,
		cluster: CLUSTERS[1],
		name: "Family Face",
		fantasy: "A meter for how the extended house speaks your name when you are not there.",
		choice: "Send school fees to the village uncle, show up for a naming, or let the city make you a story.",
		systems: "Credit limits, shrine-adjacent courtesy, who will hide you when heat spikes.",
		flavor: "Edo kinship is not a flavor quote. It is collateral. Your mother's people can close a door the police cannot.",
		depth: "Family face decays if you only send money and never appear. Cash without presence reads as guilt."
	},
	{
		n: 10,
		cluster: CLUSTERS[1],
		name: "Esusu Table",
		fantasy: "A rotating savings pool run by market women. You may join, host, or rob the idea of it — not the women.",
		choice: "Pay your hand, skip a week, or vouch for a rider who will default.",
		systems: "Large cash infusions, market respect, a default that poisons prices on your street.",
		flavor: "Esusu is older than the banks on the ring road. Default is social death, not a credit score.",
		depth: "The table meets on a real weekday in the sim. Miss it because you were on a job and the city notices."
	},
	{
		n: 11,
		cluster: CLUSTERS[1],
		name: "Compound Courtesy",
		fantasy: "Greetings are gameplay. Who you greet first in a yard sets the whole visit.",
		choice: "Elder, landlord, or the person you actually came to see.",
		systems: "Access to rooms, rumor accuracy, small discounts, or a closed gate.",
		flavor: "Walking past an elder to shout a friend's name is a legible insult.",
		depth: "Each compound stores last-greeting. Repeat offenses stack into a yard ban without a quest marker."
	},
	{
		n: 12,
		cluster: CLUSTERS[1],
		name: "Name Weight",
		fantasy: "Your background — student, apprentice, trader — is a rumor seed, not a class perk.",
		choice: "Lean into it, hide it, or let Adesuwa introduce you under a different work.",
		systems: "Opening respect, which jobs are offered, how the task force addresses you.",
		flavor: "A student on an okada at noon is a story. A trader on the same bike is infrastructure.",
		depth: "NPCs misremember your background if they only met you in the wrong clothes."
	},
	{
		n: 13,
		cluster: CLUSTERS[1],
		name: "Owambe Gate",
		fantasy: "A weekend celebration is a heist of access, not of jewelry.",
		choice: "Enter as family, as hired hand, or crash it and burn family face.",
		systems: "Political contacts, outfit durability, photos that become evidence or status.",
		flavor: "Aso-ebi color is a pass. Wear the wrong wax print and the ushers do not need to shout.",
		depth: "Photos persist on phones in the sim. A picture at the party can surface during a later shakedown."
	},
	{
		n: 14,
		cluster: CLUSTERS[1],
		name: "Uncle in the Village",
		fantasy: "A voice that is not in the city and cannot be intimidated by city factions.",
		choice: "Send money, send yourself for a weekend, or lie about both.",
		systems: "A separate map node that pauses city heat but advances faction schemes without you.",
		flavor: "The village is not a tutorial farm. It is the place your alibi goes to die or to live.",
		depth: "While you are away, Night Line and Union still tick. You return to a city that did not pause."
	},
	{
		n: 15,
		cluster: CLUSTERS[1],
		name: "Market Credit Book",
		fantasy: "Mama Eki's book is a weapon. Your name in it is either trust or a collar.",
		choice: "Clear it weekly, let Adesuwa underwrite you, or run a tab until she stops selling rice.",
		systems: "Food, haggle, partner promises, faction embargoes.",
		flavor: "Refusal is quiet. She simply does not have rice 'for you' when Night Line money is on your clothes.",
		depth: "The book is shared with two other stalls. Embargo spreads by evening."
	},
	{
		n: 16,
		cluster: CLUSTERS[1],
		name: "Public Shame, Private Heat",
		fantasy: "Two reputations: what the street says, and what armed people know.",
		choice: "You can be loved and hunted, or feared and fed. The HUD never collapses them into one star.",
		systems: "Family face vs city heat vs four faction respects.",
		flavor: "A person can be 'a good son' and still be waved down on the slope.",
		depth: "Mission givers read different meters. The guild reads face. The task force reads heat."
	},
	{
		n: 17,
		cluster: CLUSTERS[2],
		name: "Four Organisms",
		fantasy: "Hill Union, Oregbeni Circle, Bronze Shade, Night Line — each with a purse, a territory, and a daily goal.",
		choice: "Feed one and starve another. Neutrality is a slow bleed, not a safe lane.",
		systems: "Prices, okada access, park safety at night, guild training, rent protection.",
		flavor: "They are not color-swapped gangs. A market circle and a night park crew do not want the same city.",
		depth: "Each dawn they spend yesterday's purse on recruitment, bribes, or a party. You see the spend as street changes."
	},
	{
		n: 18,
		cluster: CLUSTERS[2],
		name: "The Flyover Border",
		fantasy: "The deck and the ground junction are different jurisdictions that share a shadow.",
		choice: "Cross on the deck, under it, or stop on the ramp where neither crew is comfortable.",
		systems: "Traffic law, ambush chance, who can see your plate, rain grip.",
		flavor: "Ramat Park flyover is already a landmark in the slice. The expansion makes the height political.",
		depth: "A chase that changes level changes the faction that is allowed to follow."
	},
	{
		n: 19,
		cluster: CLUSTERS[2],
		name: "Purse and Payroll",
		fantasy: "Factions miss payday and their riders get sloppy, loud, or poachable.",
		choice: "Hit a purse, cover a payroll to buy a week of peace, or hire the unpaid.",
		systems: "Economy, recruitment, street aggression curves.",
		flavor: "An unpaid junction does not become noble. It becomes expensive for everyone passing.",
		depth: "Payroll failure is simulated, not scripted. Your economic sabotage can cause it without a mission."
	},
	{
		n: 20,
		cluster: CLUSTERS[2],
		name: "Adaptive Grudges",
		fantasy: "Rivals change tactics after you beat the same move twice.",
		choice: "They stop waving you down and start pricing your landlord, your partner, or your fuel.",
		systems: "Rent, Mama Eki, okada fuel, Adesuwa's off-screen day.",
		flavor: "The second response is social, not a bigger gun. That is the local grammar of pressure.",
		depth: "Tactic memory is per faction, three deep. The fourth visit gets an unexpected courtesy, which is worse."
	},
	{
		n: 21,
		cluster: CLUSTERS[2],
		name: "Territory Weather",
		fantasy: "Blocks flip ownership by stickers, greetings, and who fuels bikes there — not by a capture bar.",
		choice: "Spend a day being seen. Or one night being feared. They write different owners.",
		systems: "Minimap tint, prices, which radio tag plays, random events.",
		flavor: "A corner can belong to the women in the morning and the park crew at night. Both are true.",
		depth: "Daypart ownership is a first-class rule. Noon and midnight are different maps."
	},
	{
		n: 22,
		cluster: CLUSTERS[2],
		name: "Task Force as Weather",
		fantasy: "City attention is not a wanted star. It is checkpoints, delayed fares, and a quieter market.",
		choice: "Pay the slope, cool off in the village, or keep earning until the corridor closes.",
		systems: "Heat, naira, speed, partner mood, time of day.",
		flavor: "The wave-down has no receipt. Everyone already understands the fiction.",
		depth: "Heat decays slowly if you live ordinary life — food, rent, greetings — faster than if you hide."
	},
	{
		n: 23,
		cluster: CLUSTERS[2],
		name: "Poach and Exile",
		fantasy: "Named riders can be pulled from one organism to another.",
		choice: "Pay their debt, marry into their yard, or humiliate their captain in public.",
		systems: "Faction purse, your crew capacity, retaliation style.",
		flavor: "People change crews for rent and insult, rarely for ideology.",
		depth: "A poached rider keeps grudges from the old crew and leaks your routes for a week."
	},
	{
		n: 24,
		cluster: CLUSTERS[2],
		name: "Palace Weather",
		fantasy: "The Oba's court is not a dungeon and not a faction you join. It is climate.",
		choice: "A festival, a curfew, a title dispute downtown changes what the street is allowed to do that week.",
		systems: "All four factions lose or gain room to move. Your jobs reschedule themselves.",
		flavor: "Benin kingship is historical power, handled here as civic weather, never as loot.",
		depth: "You cannot steal palace bronzes. The game refuses the fantasy and offers patronage, rumor, and procession routes instead."
	},
	{
		n: 25,
		cluster: CLUSTERS[2],
		name: "Iron Vow, Fictional",
		fantasy: "A campus society with oaths, alumni, and blackmail — invented, not a documentary of any real confraternity.",
		choice: "Decline, owe a favor, or burn the vow and gain enemies with degrees.",
		systems: "Student background leverage, white-collar leaks, partner shame if she is tied to campus.",
		flavor: "The danger is administrative and social: results, housing, a father's name. Not a shooter arena.",
		depth: "Alumni appear years later as landlords and task-force cousins. The vow has a long half-life."
	},
	{
		n: 26,
		cluster: CLUSTERS[2],
		name: "Truce Windows",
		fantasy: "Rain, a burial, or a title ceremony forces a temporary ceasefire the player can exploit or honor.",
		choice: "Move goods during the truce, attend and gain face, or break it and become the story of the year.",
		systems: "Heat multiplier, family face, all faction respects.",
		flavor: "There are days the street agrees not to perform violence. Breaking that is a different crime from ordinary heat.",
		depth: "Breaking a burial truce blacklists you from esusu permanently. The market has a longer memory than the park."
	},
	{
		n: 27,
		cluster: CLUSTERS[3],
		name: "Five-Layer NPC",
		fantasy: "Every named person is personality, mood, relationship, reputation toward you, and bodily state.",
		choice: "Talk at the wrong layer and the right words fail. A hungry captain does not hear respect.",
		systems: "Schedules, food, rain, grief days, your last public act.",
		flavor: "Mama Eki is not a shop UI. She is tired when the drain floods and generous when you greet her mother.",
		depth: "Needs are simulated hourly. Dialogue reads the top unmet need first."
	},
	{
		n: 28,
		cluster: CLUSTERS[3],
		name: "Rumor Bus",
		fantasy: "Gossip travels on danfo routes and okada benches at a knowable speed.",
		choice: "Seed a lie, outrun a truth, or sit in the vehicle that is carrying your name.",
		systems: "Traffic lines already in the city become the narrative network.",
		flavor: "The person who knows is the person who shared a bench, not the person with a quest update.",
		depth: "You can intercept a rumor by riding the same road before it reaches Ramat."
	},
	{
		n: 29,
		cluster: CLUSTERS[3],
		name: "Grief Day",
		fantasy: "A death in a compound — from age, not from your gun — retunes the block.",
		choice: "Pay condolence, avoid the street, or collect a debt anyway.",
		systems: "Prices pause, factions go quiet, family face swings hard.",
		flavor: "Condolence money has a grammar. Too little is an insult. Too much is a confession.",
		depth: "The block stores who showed up. Months later they mention the absence."
	},
	{
		n: 30,
		cluster: CLUSTERS[3],
		name: "Status Costume",
		fantasy: "Cloth is a system. Wax print, ironed shirt, mechanic oil, aso-ebi.",
		choice: "Change before you enter. The same sentence lands differently in oil and in white.",
		systems: "Access, prices, partner mood, task-force bias.",
		flavor: "Benin street fashion is precise. The game treats tailoring as equipment with social stats.",
		depth: "Outfits soil in rain and after bike work. Vanity has upkeep."
	},
	{
		n: 31,
		cluster: CLUSTERS[3],
		name: "Harmattan Mind",
		fantasy: "Season changes sight distance, temper, and theft.",
		choice: "Use the dust or suffer it. Factions get irritable. Partners get headaches. You get cover.",
		systems: "Fog, aggression, fuel, health, rumor speed.",
		flavor: "Dry season is not a texture pack. It is when the city is short with itself.",
		depth: "A multi-day harmattan arc shifts every mood baseline up in irritability."
	},
	{
		n: 32,
		cluster: CLUSTERS[3],
		name: "Boredom and Swagger",
		fantasy: "Idle factions start trouble to feel alive. Idle players get noticed for the wrong stillness.",
		choice: "Be ordinary on purpose — sit at Ramat — or feed the street a performance.",
		systems: "The existing park sit action becomes a de-escalation with witnesses.",
		flavor: "Sitting without performing is a status move if your clothes can carry it.",
		depth: "If you only do crime, ordinary vendors stop giving you ordinary prices. You have become illegible as a customer."
	},
	{
		n: 33,
		cluster: CLUSTERS[3],
		name: "Voice of the Bike",
		fantasy: "Okada riders narrate the city in pidgin and English, and they are often right.",
		choice: "Tip the bench, argue, or ignore a warning that was mechanically true.",
		systems: "Their gossip is bound to real sim variables: heat, rain, purse, your partner.",
		flavor: "The radio is not lore. It is a debug console the city is allowed to speak.",
		depth: "If a rider is wrong, it is because their faction lied to them, and you can trace the lie."
	},
	{
		n: 34,
		cluster: CLUSTERS[4],
		name: "Rent as Front Line",
		fantasy: "The hill ledger is already in the game. Factions can pay it, inflate it, or evict you by whispering to the landlord.",
		choice: "Let Union cover you, pay clean, or owe the room until the lock changes.",
		systems: "Home spawn, family face, Union respect, heat.",
		flavor: "Housing is the actual turf war. The park is just where it becomes visible.",
		depth: "Eviction moves your bed and your save point. No mission required."
	},
	{
		n: 35,
		cluster: CLUSTERS[4],
		name: "Fuel, Rain, Allegiance",
		fantasy: "The ₦400 fill-up becomes factional. Some kiosks will not sell to you in the rain if the wrong crew owns the junction.",
		choice: "Coast, push the bike, or burn a favor.",
		systems: "Existing fuel sim, weather, territory daypart.",
		flavor: "Running out of fuel on the deck in rain is a social emergency, not only a driving one.",
		depth: "Adesuwa will come with a keg if loyalty is high and she is not strained — taking her own risk."
	},
	{
		n: 36,
		cluster: CLUSTERS[4],
		name: "The Parcel Knows",
		fantasy: "Errands already cross Oregbeni and the hill. Parcels gain faction tags.",
		choice: "Open it, deliver it blind, or reroute it to a third party.",
		systems: "Job board, heat, market trust, partner promise.",
		flavor: "Everyone in the market is carrying someone else's risk in nylon.",
		depth: "Opening a parcel can solve a rumor or create one. The content is procedural from faction state."
	},
	{
		n: 37,
		cluster: CLUSTERS[4],
		name: "Bronze That Is Not Loot",
		fantasy: "Skill at the fictional stall earns patronage jobs: repairs, copies, ceremonies. Never palace theft.",
		choice: "Take a commission that launders your reputation or refuse and stay a pair of dirty hands.",
		systems: "Skill, guild respect, family face, naira, heat decay.",
		flavor: "Igun Street's real guilds are the cultural north star. The game refuses to turn their history into a pickup.",
		depth: "High skill changes how elites speak to you. It does not give you a sword."
	},
	{
		n: 38,
		cluster: CLUSTERS[4],
		name: "Night Price of a Fare",
		fantasy: "The Ramat fare pays more after dark and writes your plate into Night Line's book if she is not on the bike.",
		choice: "Day rate, night rate, or no rate. She negotiates a bonus when she rides.",
		systems: "Existing fare job, time of day, pillion, heat.",
		flavor: "A passenger at night is either a fare or a witness. You do not get to decide which until you drop them.",
		depth: "Some passengers are faction auditors. They pay, then the respect graph twitches."
	},
	{
		n: 39,
		cluster: CLUSTERS[4],
		name: "Drain Politics",
		fantasy: "The blocked drain report is already a civic act. In the expansion it is a favor that belongs to someone.",
		choice: "Report it clean, report it through Union so they own the repair, or ignore it until flood day.",
		systems: "Ward desk, Union purse, market mood, rain severity.",
		flavor: "Infrastructure is patronage. Who fixed the gutter owns the greetings for a month.",
		depth: "Flood day, if you ignored it, raises hunger and temper across Oregbeni and blames the last person who walked past."
	},
	{
		n: 40,
		cluster: CLUSTERS[4],
		name: "The Living Week",
		fantasy: "Rent, esusu, owambe, grief, payroll, and harmattan share one calendar. You cannot do all of them well.",
		choice: "Each week you pick which organism to disappoint. The city keeps score in people, not in XP.",
		systems: "Every system above, plus sleep, the clock, and the save file.",
		flavor: "The fantasy is not 'become king of Benin'. It is 'be someone the hill still nods to'.",
		depth: "A month later the game can recite your week without a quest log: who you fed, who you dodged, who rode home."
	}
];
var WONDERS = [
	{
		n: 1,
		name: "Dual-level city law",
		what: "Deck and ground are different legal and social maps sharing one shadow.",
		why: "The flyover stops being a prop and becomes the sentence the game is about."
	},
	{
		n: 2,
		name: "Kinship collateral",
		what: "Extended family can hide you, bankrupt you, or clear your name.",
		why: "Western wanted-stars cannot model how West African cities actually absorb a person."
	},
	{
		n: 3,
		name: "Esusu as a heist target you are punished for imagining",
		what: "Join a women's savings table. Robbing it is possible and socially terminal.",
		why: "The interesting crime is against a social institution, not a jewelry store."
	},
	{
		n: 4,
		name: "Promise persistence",
		what: "Partners store exact obligations across sleeps and seasons.",
		why: "Memory is the difference between a companion and a perk."
	},
	{
		n: 5,
		name: "Faction purses",
		what: "Crews earn, spend, miss payroll, and change behavior.",
		why: "Rival gangs feel like organisms instead of spawners."
	},
	{
		n: 6,
		name: "Rumor on real roads",
		what: "Gossip moves on the danfo and okada lines you can see.",
		why: "You can outrun a story in traffic."
	},
	{
		n: 7,
		name: "Daypart territory",
		what: "A corner has a morning owner and a night owner.",
		why: "Matches market cities, and makes the clock a weapon."
	},
	{
		n: 8,
		name: "Quiet embargo",
		what: "Vendors refuse you without a fight when your affiliations curdle.",
		why: "Social death is more frightening than a shootout if the game commits."
	},
	{
		n: 9,
		name: "Task force without a star",
		what: "Heat is checkpoints, delays, and missing receipts.",
		why: "Authority feels local, corrupt, and ordinary."
	},
	{
		n: 10,
		name: "Cloth as equipment",
		what: "Wax, white, oil, aso-ebi change every conversation.",
		why: "Fashion is already how status is spoken. The game should compile it."
	},
	{
		n: 11,
		name: "Palace as climate",
		what: "Court events reshape the week. The palace cannot be robbed.",
		why: "Ambition with cultural discipline. Players feel the limit as design, not as a missing asset."
	},
	{
		n: 12,
		name: "Fictional bronze craft",
		what: "Patronage and skill at a clearly fictional stall. Real guilds stay respected and unstolen.",
		why: "Depth without extraction."
	},
	{
		n: 13,
		name: "Off-screen partner days",
		what: "She works, spends, and gets approached when you are elsewhere.",
		why: "The city is alive because someone you love is not waiting in a room."
	},
	{
		n: 14,
		name: "Adaptive pressure",
		what: "After two identical wins, a faction switches from muscle to rent, fuel, or family.",
		why: "Rockstar-grade reactivity: the counterplay learns."
	},
	{
		n: 15,
		name: "Truce calendar",
		what: "Burials and festivals impose real ceasefires.",
		why: "Breaking them is the most memorable crime in the game."
	},
	{
		n: 16,
		name: "Condolence grammar",
		what: "Grief days with a correct amount to bring.",
		why: "Teaches the player the city's moral physics through play."
	},
	{
		n: 17,
		name: "Village alibi",
		what: "Leaving town cools heat and lets factions move unsupervised.",
		why: "Absence is a strategy with a bill."
	},
	{
		n: 18,
		name: "Owambe infiltration",
		what: "A party where the prize is access and photographs.",
		why: "Social stealth more original than another mansion raid."
	},
	{
		n: 19,
		name: "Compound greeting order",
		what: "Who you greet first opens or closes the yard.",
		why: "Makes courtesy mechanical and readable."
	},
	{
		n: 20,
		name: "Two reputations",
		what: "Family face and street heat never merge.",
		why: "You can be a good nephew and a problem for the corridor. That contradiction is the drama."
	},
	{
		n: 21,
		name: "Living radio",
		what: "Riders report actual sim variables in voice.",
		why: "The player trusts the world because it can be overheard telling the truth."
	},
	{
		n: 22,
		name: "Rain as politics",
		what: "Weather changes grip, witnesses, temper, and drain blame.",
		why: "The existing rain system becomes narrative."
	},
	{
		n: 23,
		name: "Housing war",
		what: "Eviction moves your spawn. Factions fight over the ledger.",
		why: "Turf you sleep in matters more than turf you paint."
	},
	{
		n: 24,
		name: "Passenger auditors",
		what: "Some fares are spies who pay you.",
		why: "The job board becomes unsafe in an interesting way."
	},
	{
		n: 25,
		name: "Seasonal irritability",
		what: "Harmattan shifts every mood baseline.",
		why: "A year in the city feels different from a looped Tuesday."
	},
	{
		n: 26,
		name: "Witness geometry",
		what: "Stalls, rain, and hour decide who saw the override.",
		why: "Public and private are simulated spaces."
	},
	{
		n: 27,
		name: "Payroll poaching",
		what: "Unpaid riders can be hired and still leak.",
		why: "Recruitment is risky, which makes a crew feel earned."
	},
	{
		n: 28,
		name: "The week you cannot win",
		what: "Calendar collisions force a disappointment.",
		why: "Long-term drama without a bigger map."
	},
	{
		n: 29,
		name: "Sit as de-escalation",
		what: "The park bench is a mechanical truce if your status can hold it.",
		why: "Not every powerful verb is acceleration."
	},
	{
		n: 30,
		name: "Memory recap",
		what: "The city can retell your month in people, not missions.",
		why: "Players leave with stories they authored. That is the whole ambition."
	}
];
var ROADMAP = [
	"Prototype the promise ledger, four respects, and heat checkpoint on the existing hill-to-Ramat slice. This build already runs that seed.",
	"Give Adesuwa an off-screen day and a purse. Fail states should happen while you are riding.",
	"Add daypart territory tints and rumor moving along the current traffic splines.",
	"Build esusu and family face as the second currency. Do not add guns before this exists.",
	"Palace weather and burial truces as calendar events that reschedule the job board.",
	"Only then expand the map beyond the slice. A larger city without these organisms will feel like a cheaper import."
];
function Codex({ onClose }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "absolute inset-0 z-30 flex flex-col bg-bg/95 text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "safe-top flex items-center justify-between gap-3 border-b border-line px-4 py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs tracking-[0.18em] text-brass uppercase",
				children: "Production floor"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl leading-none",
				children: "Iron and bronze"
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onClose,
				className: "min-h-11 rounded-full border border-line bg-surface px-4 text-sm text-fg",
				children: "Close"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-h-0 flex-1 overflow-y-auto px-4 py-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-3xl text-sm leading-relaxed text-muted",
					children: "Forty living systems and thirty wonders for BENIN LIFE. This is the city design: Benin City, not a borrowed coast. The playable slice already runs the promise ledger, four respects, heat, and Adesuwa. The rest is the build order, not a wishlist of missions."
				}),
				SUGGESTIONS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "mt-4 border-t border-line pt-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs tracking-wide text-brass uppercase",
							children: [
								String(item.n).padStart(2, "0"),
								" · ",
								item.cluster
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-xl leading-tight",
							children: item.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "mt-2 grid gap-2 text-sm leading-relaxed",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted",
									children: "Fantasy"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: item.fantasy })] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted",
									children: "Choice"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: item.choice })] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted",
									children: "Systems"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: item.systems })] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted",
									children: "Ground"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: item.flavor })] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted",
									children: "Long game"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: item.depth })] })
							]
						})
					]
				}, item.n)),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display mt-8 text-2xl",
					children: "Thirty wonders"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "mt-3 grid gap-3",
					children: WONDERS.map((wonder) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-2xl border border-line bg-surface px-3 py-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-brass",
								children: String(wonder.n).padStart(2, "0")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-lg leading-tight",
								children: wonder.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm leading-relaxed",
								children: wonder.what
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm leading-relaxed text-muted",
								children: wonder.why
							})
						]
					}, wonder.n))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display mt-8 text-2xl",
					children: "Build this first"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "mt-3 mb-10 grid gap-2 text-sm leading-relaxed",
					children: ROADMAP.map((step, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-2xl bg-surface-2 px-3 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-brass",
							children: [index + 1, ". "]
						}), step]
					}, step))
				})
			]
		})]
	});
}
var BACKGROUNDS = [
	{
		id: "student",
		title: "Student",
		detail: "The market knows your face."
	},
	{
		id: "apprentice",
		title: "Apprentice",
		detail: "Bronze Shade trusts your hands."
	},
	{
		id: "trader",
		title: "Trader",
		detail: "Union standing. The car is yours."
	}
];
var CAPTIONS = [
	[0, "Ikpoba Hill. The day starts owing the room."],
	[5, "Oregbeni sells food, then it sells your name."],
	[11, "The flyover holds two cities in one shadow."],
	[16, "After rain, the park changes owners."],
	[22, "Someone on the roadside will remember the promise."],
	[27, "BENIN LIFE. The corridor is waiting."]
];
function clock(mins) {
	const m = Math.floor(mins) % 1440;
	const h = Math.floor(m / 60);
	const min = Math.floor(m % 60);
	return `${h % 12 || 12}:${min.toString().padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
}
function naira(value) {
	return `₦${Math.round(value).toLocaleString("en-NG")}`;
}
function BeninShell() {
	const viewRef = (0, import_react.useRef)(null);
	const mapRef = (0, import_react.useRef)(null);
	const videoRef = (0, import_react.useRef)(null);
	const hud = useHud();
	const [name, setName] = (0, import_react.useState)("Osaze");
	const [background, setBackground] = (0, import_react.useState)("student");
	const [skin, setSkin] = (0, import_react.useState)(1);
	const [cloth, setCloth] = (0, import_react.useState)(0);
	const [overlay, setOverlay] = (0, import_react.useState)("none");
	const [caption, setCaption] = (0, import_react.useState)(CAPTIONS[0][1]);
	const [hasSave, setHasSave] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setHasSave(!!loadSave());
		const view = viewRef.current;
		if (!view) return;
		return mount(view, mapRef.current);
	}, []);
	const playing = hud.phase === "play";
	const showHud = playing || hud.phase === "pause" || hud.phase === "reel";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "game-root relative h-dvh w-full overflow-hidden bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: viewRef,
				className: "absolute inset-0 h-full w-full"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "vignette pointer-events-none absolute inset-0" }),
			showHud && hud.phase !== "reel" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "safe-top pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 px-3 pt-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pointer-events-auto max-w-[16rem] rounded-2xl border border-line bg-bg/80 px-3 py-2 backdrop-blur-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs tracking-wide text-brass uppercase",
							children: hud.place
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-display text-lg leading-tight",
							children: [
								"Day ",
								hud.day,
								" · ",
								clock(hud.minutes)
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: hud.raining ? "Rain on the hill" : "Dry corridor"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 grid grid-cols-4 gap-1",
							children: FACTIONS.map((faction) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								title: faction.name,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-1 overflow-hidden rounded-full bg-line",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-full bg-brass",
										style: { width: `${hud.social.respect[faction.id]}%` }
									})
								})
							}, faction.id))
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-col items-end gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pointer-events-auto rounded-2xl border border-line bg-bg/80 px-3 py-2 text-right backdrop-blur-md",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-xl leading-none",
							children: naira(hud.naira)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted",
							children: ["Heat ", Math.round(hud.social.heat)]
						})]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: mapRef,
				width: 320,
				height: 320,
				className: `pointer-events-none absolute top-24 right-3 z-10 h-24 w-24 rounded-2xl border border-line bg-surface ${playing || hud.phase === "pause" ? "" : "hidden"}`
			}),
			hud.phase === "reel" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-x-0 bottom-24 z-20 px-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-lg rounded-2xl border border-line bg-bg/80 px-4 py-3 backdrop-blur-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs tracking-[0.16em] text-brass uppercase",
							children: "Corridor reel"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-xl leading-snug",
							children: hud.moment
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 h-1 overflow-hidden rounded-full bg-line",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-full bg-primary",
								style: { width: `${Math.min(100, hud.reelT / 30 * 100)}%` }
							})
						})
					]
				})
			}),
			playing && !hud.panel && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-x-0 bottom-0 z-10 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-2 rounded-2xl border border-line bg-bg/75 px-3 py-2 backdrop-blur-md",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: "Now"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm leading-snug",
							children: hud.objective
						})]
					}),
					hud.moment && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-2 rounded-2xl bg-surface/90 px-3 py-2 text-sm leading-snug text-fg",
						children: hud.moment
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-end justify-between gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stick, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-1 flex-col items-stretch gap-2",
								children: [hud.prompt && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "min-h-11 rounded-full bg-primary px-4 text-sm font-medium text-primary-fg",
									onClick: () => {
										pad.interact = true;
									},
									children: hud.prompt.replace(/^E · /, "")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-end gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
											label: "Phone",
											onClick: () => callApi((api) => api.openPhone()),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-5 w-5" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
											label: "Map",
											onClick: () => callApi((api) => api.openMap()),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Map$1, { className: "h-5 w-5" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
											label: "Pause",
											onClick: () => callApi((api) => api.togglePause()),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs font-medium",
												children: "II"
											})
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HoldButton, {
										label: "Run",
										onHold: (down) => pad.run = down
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "min-h-11 min-w-11 rounded-full border border-line bg-surface px-3 text-sm",
										onClick: () => {
											pad.mount = true;
										},
										children: "Ride"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "min-h-11 min-w-11 rounded-full border border-line bg-surface px-3 text-sm",
										onClick: () => {
											pad.horn = true;
										},
										children: "Horn"
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-center text-xs text-muted",
						children: [hud.mode === "drive" ? "W throttle · A left · D right · F step off" : "WASD walk · Shift run · E speak · F ride", hud.social.partner === "adesuwa" ? ` · Adesuwa ${hud.social.mood}` : ""]
					})
				]
			}),
			hud.phase === "title" && overlay === "none" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 z-20 flex items-end justify-center bg-gradient-to-t from-bg via-bg/70 to-transparent sm:items-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "safe-bot max-h-[92dvh] w-full max-w-lg overflow-y-auto px-4 py-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs tracking-[0.22em] text-brass uppercase",
							children: "Benin City · open corridor"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-5xl leading-none sm:text-6xl",
							children: "BENIN LIFE"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 max-w-md text-sm leading-relaxed text-muted",
							children: "Ikpoba Hill to Ramat Park. Rent, okada, a market that can refuse you, and a woman who keeps promises longer than factions keep peace."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "mt-4 block text-xs text-muted",
							children: ["Name", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: name,
								maxLength: 18,
								onChange: (event) => setName(event.target.value),
								className: "mt-1 min-h-11 w-full rounded-xl border border-line bg-surface px-3 text-base text-fg outline-none"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 grid grid-cols-3 gap-2",
							children: BACKGROUNDS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setBackground(item.id),
								className: `min-h-11 rounded-xl border px-2 py-2 text-left ${background === item.id ? "border-brass bg-surface-2" : "border-line bg-surface"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-sm",
									children: item.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-xs leading-snug text-muted",
									children: item.detail
								})]
							}, item.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Swatches, {
								label: "Skin",
								count: 4,
								value: skin,
								prefix: "skin",
								onPick: setSkin
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Swatches, {
								label: "Cloth",
								count: 4,
								value: cloth,
								prefix: "cloth",
								onPick: setCloth
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 grid gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "min-h-12 rounded-full bg-primary text-base font-medium text-primary-fg",
									onClick: () => startNew({
										name: name.trim() || "Osaze",
										background,
										skin,
										cloth
									}),
									children: "Start the day"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									disabled: !hasSave,
									className: "min-h-11 rounded-full border border-line bg-surface text-sm disabled:opacity-40",
									onClick: () => continueGame(),
									children: "Continue"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "min-h-11 rounded-full border border-brass bg-surface text-sm text-brass",
										onClick: () => {
											setCaption(CAPTIONS[0][1]);
											setOverlay("trailer");
										},
										children: "Thirty seconds"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "min-h-11 rounded-full border border-line bg-surface text-sm",
										onClick: () => callApi((api) => api.playReel()),
										children: "Fly the corridor"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "inline-flex min-h-11 items-center justify-center gap-2 rounded-full text-sm text-muted",
									onClick: () => setOverlay("codex"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "h-4 w-4" }), "Production codex · 40 systems"]
								})
							]
						})
					]
				})
			}),
			hud.phase === "reel" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "absolute top-4 right-4 z-30 min-h-11 rounded-full border border-line bg-bg/80 px-4 text-sm",
				onClick: () => callApi((api) => api.skipReel()),
				children: "Skip"
			}),
			hud.panel && hud.phase === "play" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PanelFrame, {
				title: panelTitle(hud.panel),
				onClose: () => callApi((api) => api.closePanel()),
				children: [
					hud.panel === "shop" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2",
						children: [Object.keys(GOODS).map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "min-h-11 rounded-xl border border-line bg-surface px-3 text-left text-sm",
							onClick: () => callApi((api) => api.buy(id)),
							children: [
								GOODS[id].name,
								" · ",
								naira(GOODS[id].price),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "block text-xs text-muted",
									children: ["Holding ", hud.inv[id]]
								})
							]
						}, id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "min-h-11 rounded-full border border-brass text-sm text-brass",
							onClick: () => callApi((api) => api.haggle()),
							children: "Ask last price"
						})]
					}),
					hud.panel === "jobs" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "min-h-11 rounded-xl bg-surface px-3 text-left text-sm",
							onClick: () => callApi((api) => api.acceptJob("errand")),
							children: [
								"Parcel for Mama Eki · ",
								naira(2200),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-xs text-muted",
									children: "Walk it back up the hill."
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "min-h-11 rounded-xl bg-surface px-3 text-left text-sm",
							onClick: () => callApi((api) => api.acceptJob("fare")),
							children: [
								"Okada fare to Ramat · ",
								naira(1400),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-xs text-muted",
									children: "Adesuwa can lift the price if she rides."
								})
							]
						})]
					}),
					hud.panel === "phone" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: hud.social.partner === "adesuwa" ? `Adesuwa · ${hud.social.mood} · loyalty ${Math.round(hud.social.loyalty)} · promise ${hud.social.promise}` : "No one is saved on this line yet."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "min-h-11 rounded-xl bg-primary text-sm text-primary-fg",
								onClick: () => callApi((api) => api.partnerCall()),
								children: "Call Adesuwa"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-3 gap-2",
								children: Object.keys(GOODS).map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "min-h-11 rounded-xl bg-surface text-xs",
									onClick: () => callApi((api) => api.useItem(id)),
									children: [
										"Eat ",
										GOODS[id].name,
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block text-muted",
											children: hud.inv[id]
										})
									]
								}, id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-surface text-sm",
									onClick: () => callApi((api) => api.setRain(!hud.raining)),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudRain, { className: "h-4 w-4" }), hud.raining ? "Call the rain off" : "Call the rain"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-surface text-sm",
									onClick: () => callApi((api) => api.toggleMute()),
									children: [hud.muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "h-4 w-4" }), hud.muted ? "Sound off" : "Sound on"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-4 gap-2",
								children: [
									["Dawn", 420],
									["Noon", 720],
									["Gold", 1050],
									["Night", 1260]
								].map(([label, minutes]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "min-h-11 rounded-xl bg-surface text-xs",
									onClick: () => callApi((api) => api.setHour(minutes)),
									children: label
								}, label))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "grid gap-1 text-xs text-muted",
								children: FACTIONS.map((faction) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: faction.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-fg",
										children: Math.round(hud.social.respect[faction.id])
									})]
								}, faction.id))
							})
						]
					}),
					hud.panel === "map" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-sm leading-relaxed",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
								"You are in ",
								hud.place,
								"."
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-muted",
								children: "Orange is Hill Union, brass is Oregbeni, green is Bronze Shade, ivory is Night Line. The deck and the ground road are not the same street."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2",
								children: hud.objective
							})
						]
					}),
					hud.panel === "heritage" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 text-sm leading-relaxed",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Benin City’s bronze-casting tradition is centuries old, historically centred on the Igun street guilds. Bronze Shade is a fictional practice stall in this slice — not a palace object, and not a stand-in for the families and museums who hold that history." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "min-h-11 rounded-full bg-primary text-sm text-primary-fg",
								onClick: () => callApi((api) => api.practise()),
								children: "Practise the pour"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "min-h-11 rounded-full border border-brass text-sm text-brass",
								onClick: () => callApi((api) => api.sideJob("guild")),
								children: "Commission wax · ₦200"
							})
						]
					}),
					hud.panel === "partner" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-2 text-sm",
						children: hud.social.partner === "none" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "leading-relaxed text-muted",
								children: "Adesuwa waits like the board is a bus stop and a courtroom. Pick how you are known."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToneButton, {
								title: "Call her cousin",
								detail: "Warm. The market softens. Kinship is a loan.",
								onClick: () => callApi((api) => api.meetPartner("kin"))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToneButton, {
								title: "Speak straight",
								detail: "Wary. She rides when the job is clean.",
								onClick: () => callApi((api) => api.meetPartner("straight"))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToneButton, {
								title: "Talk business",
								detail: "Proud. Night Line hears ambition.",
								onClick: () => callApi((api) => api.meetPartner("business"))
							})
						] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
								hud.social.mood,
								" · loyalty ",
								Math.round(hud.social.loyalty),
								" · promise ",
								hud.social.promise
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-muted",
								children: "If she is not strained and loyalty holds, she sits the okada and the Ramat fare goes up."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "min-h-11 rounded-full bg-primary text-sm text-primary-fg",
								onClick: () => callApi((api) => api.giveRice()),
								children: "Hand her rice"
							})
						] })
					}),
					hud.panel === "factions" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-muted",
								children: "Cash from one organism is an insult to another. Heat does not ask permission."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "min-h-11 rounded-xl bg-surface px-3 text-left",
								onClick: () => callApi((api) => api.sideJob("union")),
								children: [
									"Carry for Hill Union · ",
									naira(1800),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-xs text-muted",
										children: "Night Line will mark it."
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "min-h-11 rounded-xl bg-surface px-3 text-left",
								onClick: () => callApi((api) => api.sideJob("night")),
								children: [
									"Take Night Line cash · ",
									naira(2800),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-xs text-muted",
										children: "Breaks a clear-night promise if one is open."
									})
								]
							})
						]
					}),
					hud.panel === "room" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							"A room nearer the park. The hill key is let go. Deposit ",
							naira(22e3),
							", a game rate."
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "min-h-11 rounded-full bg-primary text-sm text-primary-fg",
							onClick: () => callApi((api) => api.moveHome()),
							children: "Take the Ramat key"
						})]
					}),
					hud.panel === "ledger" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							"Due today ",
							naira(hud.rentDue),
							hud.debt > 0 ? ` plus debt ${naira(hud.debt)}` : "",
							". Home is the ",
							hud.home,
							"."
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "min-h-11 rounded-full bg-primary text-sm text-primary-fg",
							onClick: () => callApi((api) => api.payRent()),
							children: "Clear the ledger"
						})]
					}),
					hud.panel === "sleep" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Sleep ends the day. An open promise becomes a broken one." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "min-h-11 rounded-full bg-primary text-sm text-primary-fg",
							onClick: () => callApi((api) => api.sleep()),
							children: "Sleep"
						})]
					}),
					hud.panel === "stall" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: [
								"Buyer ",
								Math.min(hud.stallStep + 1, 3),
								" of 3 · taken ",
								naira(hud.stallProfit)
							]
						}), [
							["low", "Thin margin"],
							["fair", "Fair price"],
							["high", "They may walk"]
						].map(([kind, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "min-h-11 rounded-xl bg-surface text-sm",
							onClick: () => callApi((api) => api.stallChoice(kind)),
							children: label
						}, kind))]
					}),
					hud.panel === "pause" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "min-h-11 rounded-full bg-primary text-sm text-primary-fg",
							onClick: () => callApi((api) => api.togglePause()),
							children: "Resume"
						})
					})
				]
			}),
			hud.phase === "pause" && !hud.panel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 z-20 flex items-center justify-center bg-bg/70 px-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-sm rounded-3xl border border-line bg-surface p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-3xl",
							children: "Paused"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "The hill keeps your place."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "mt-4 min-h-11 w-full rounded-full bg-primary text-sm text-primary-fg",
							onClick: () => callApi((api) => api.togglePause()),
							children: "Resume"
						})
					]
				})
			}),
			overlay === "codex" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Codex, { onClose: () => setOverlay("none") }),
			overlay === "trailer" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-0 z-40 flex flex-col bg-bg",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "safe-top flex items-center justify-between px-3 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs tracking-[0.16em] text-brass uppercase",
							children: "Thirty seconds · premiere"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "min-h-11 rounded-full border border-line px-4 text-sm",
							onClick: () => {
								videoRef.current?.pause();
								setOverlay("none");
							},
							children: "Close"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
						ref: videoRef,
						className: "min-h-0 w-full flex-1 bg-bg object-contain",
						src: "/trailer.mp4",
						autoPlay: true,
						playsInline: true,
						controls: true,
						onTimeUpdate: (event) => {
							const t = event.currentTarget.currentTime;
							const line = [...CAPTIONS].reverse().find(([at]) => t >= at);
							if (line) setCaption(line[1]);
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "safe-bot px-4 py-3 text-center font-display text-lg leading-snug",
						children: caption
					})
				]
			}),
			!hud.ready && !hud.error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 z-50 flex items-center justify-center bg-bg",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Raising the corridor…"
				})
			}),
			hud.error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 z-50 flex items-center justify-center bg-bg px-6 text-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: hud.error })
			})
		]
	});
}
function panelTitle(panel) {
	switch (panel) {
		case "shop": return "Mama Eki";
		case "jobs": return "Notice board";
		case "phone": return "Phone";
		case "map": return "Corridor";
		case "heritage": return "Bronze Shade";
		case "partner": return "Adesuwa";
		case "factions": return "The names";
		case "room": return "Ramat room";
		case "ledger": return "Rent ledger";
		case "sleep": return "Sleep";
		case "stall": return "Kiosk";
		default: return "Pause";
	}
}
function PanelFrame({ title, onClose, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-x-0 bottom-0 z-20 mx-auto w-full max-w-lg px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "max-h-[70dvh] overflow-y-auto rounded-3xl border border-line bg-bg/95 p-4 shadow-2xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl leading-none",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "min-h-11 rounded-full bg-surface px-4 text-sm",
					onClick: onClose,
					children: "Close"
				})]
			}), children]
		})
	});
}
function ToneButton({ title, detail, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: "min-h-11 rounded-xl border border-line bg-surface px-3 py-2 text-left",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "block",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "block text-xs text-muted",
			children: detail
		})]
	});
}
function IconButton({ label, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": label,
		onClick,
		className: "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-line bg-surface text-fg",
		children
	});
}
function HoldButton({ label, onHold }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		className: "min-h-11 rounded-full border border-line bg-surface px-3 text-sm",
		onPointerDown: () => onHold(true),
		onPointerUp: () => onHold(false),
		onPointerLeave: () => onHold(false),
		children: label
	});
}
function Stick() {
	const ref = (0, import_react.useRef)(null);
	const origin = (0, import_react.useRef)(null);
	function point(event) {
		const node = ref.current;
		if (!node || !origin.current) return;
		const rect = node.getBoundingClientRect();
		const dx = (event.clientX - origin.current.x) / (rect.width * .45);
		const dy = (origin.current.y - event.clientY) / (rect.height * .45);
		pad.joy = true;
		pad.joyX = Math.max(-1, Math.min(1, dx));
		pad.joyY = Math.max(-1, Math.min(1, dy));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref,
		className: "touch-controls relative h-28 w-28 shrink-0 rounded-full border border-line bg-surface/80",
		onPointerDown: (event) => {
			event.currentTarget.setPointerCapture(event.pointerId);
			origin.current = {
				x: event.clientX,
				y: event.clientY
			};
			point(event);
		},
		onPointerMove: (event) => {
			if (!origin.current) return;
			point(event);
		},
		onPointerUp: () => {
			origin.current = null;
			pad.joy = false;
			pad.joyX = 0;
			pad.joyY = 0;
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute top-1/2 left-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" })
	});
}
function Swatches({ label, count, value, prefix, onPick }) {
	const colors = prefix === "skin" ? [
		"bg-skin-0",
		"bg-skin-1",
		"bg-skin-2",
		"bg-skin-3"
	] : [
		"bg-cloth-0",
		"bg-cloth-1",
		"bg-cloth-2",
		"bg-cloth-3"
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-xs text-muted",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-1 flex gap-2",
		children: Array.from({ length: count }, (_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			"aria-label": `${label} ${index + 1}`,
			onClick: () => onPick(index),
			className: `h-11 w-11 rounded-full ${colors[index]} ${value === index ? "ring-2 ring-brass" : ""}`
		}, index))
	})] });
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BeninShell, {});
}
//#endregion
export { Home as component };
