import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize GoogleGenAI server-side with User-Agent set to 'aistudio-build'
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (geminiApiKey) {
  aiClient = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// In-Memory Simulation State
interface SimulationState {
  isPlaying: boolean;
  timeSec: number;
  speedMultiplier: number;
  activeScenarioId: string | null;
  logs: { timeSec: number; message: string; type: 'info' | 'warning' | 'error' | 'success' }[];
  tags: Record<string, number | string>;
  actionHistory: string[];
}

// Initialize tags
const initialTags: Record<string, number | string> = {
  WELL1_FLOW: 450,
  WELL2_FLOW: 380,
  WELL3_FLOW: 310,
  WELL4_FLOW: 290,
  WELL1_GAS_FRAC: 12.5,
  WELL2_GAS_FRAC: 14.2,
  WELL1_STATUS: 1,
  WELL2_STATUS: 1,
  WELL1_CHOKE_VALVE: 45,
  INLET_PRESS: 42.5,
  INLET_TEMP: 38.4,
  SEP_LEVEL: 45.2,
  SEP_PRESS: 22.4,
  SEP_TEMP: 48.6,
  SEP_ESD_VALVE: 1,
  SEP_OUT_OIL_FLOW: 620,
  SEP_OUT_GAS_FLOW: 185,
  PGC_SUCTION_P: 18.2,
  PGC_DISCHARGE_P: 72.4,
  PGC_RPM: 8400,
  PGC_STATUS: 1,
  PGC_BEARING_TEMP: 74.2,
  PGC_BYPASS_VALVE: 0,
  BOOST_PUMP_A_RPM: 2950,
  BOOST_PUMP_B_RPM: 0,
  BOOST_PUMP_STATUS: 1, // 0=Stop, 1=Run, 2=Fault
  STANDBY_PUMP_STATUS: 0, // 0=Stop/Standby, 1=Run
  BOOST_PUMP_FLOW: 780,
  BOOST_PUMP_PRESS_OUT: 54.8,
  VALVE_BYPASS_POS: 0,
  WATER_INJ_FLOW: 420,
  WATER_INJ_PRESS: 112.5,
  WATER_INJ_STATUS: 1,
  WATER_INJ_VALVE: 58,
  GEN1_POWER: 14.8,
  GEN2_POWER: 0,
  GEN1_STATUS: 1,
  GEN2_STATUS: 0,
  BUS_VOLTAGE: 13.8,
  SUBSEA_COMM_RTT: 45,
  SUBSEA_POWER_STATUS: 1,
  SUBSEA_MANIFOLD_P: 142.6,
  SUBSEA_ESD_VALVE: 1,
};

let simState: SimulationState = {
  isPlaying: false,
  timeSec: 0,
  speedMultiplier: 1,
  activeScenarioId: null,
  logs: [{ timeSec: 0, message: "Offshore Complex Process Simulator initialized in Steady State.", type: "info" }],
  tags: { ...initialTags },
  actionHistory: []
};

// Physics Simulation Tick Logic
function runPhysicsTick() {
  if (!simState.isPlaying) return;

  simState.timeSec += 1;
  const t = simState.timeSec;

  // 1. Process Scenario events
  if (simState.activeScenarioId === 'startup_001') {
    // Startup scenario events
    if (t === 1) {
      simState.tags.GEN1_STATUS = 0;
      simState.tags.BUS_VOLTAGE = 0;
      simState.tags.WELL1_STATUS = 0;
      simState.tags.WELL2_STATUS = 0;
      simState.tags.WELL1_CHOKE_VALVE = 0;
      simState.tags.SEP_LEVEL = 12.0;
      simState.tags.INLET_PRESS = 4.5;
      simState.logs.push({ timeSec: t, message: "Scenario START: Power grid is currently black. Separator dry. Wells shut in.", type: "warning" });
    }
  } else if (simState.activeScenarioId === 'booster_trip_001') {
    // Booster Trip Scenario
    if (t === 15) {
      simState.tags.BOOST_PUMP_STATUS = 2; // Trip
      simState.tags.BOOST_PUMP_A_RPM = 0;
      simState.tags.VALVE_BYPASS_POS = 100; // Bypass opens
      simState.tags.BOOST_PUMP_FLOW = 120;
      simState.logs.push({ timeSec: t, message: "ALARM: Booster Pump A has tripped due to high vibration! Bypass valve opened.", type: "error" });
    }
  } else if (simState.activeScenarioId === 'subsea_fault_001') {
    // Subsea Fault Scenario
    if (t === 20) {
      simState.tags.SUBSEA_COMM_RTT = 4850;
      simState.tags.SUBSEA_POWER_STATUS = 0;
      simState.tags.SUBSEA_MANIFOLD_P = 188.5;
      simState.logs.push({ timeSec: t, message: "ALARM: Subsea communications and power fault detected on telemetry link! High latency.", type: "error" });
    }
  }

  // 2. Physical Feedback Loops
  // Wells status and choke valve controls well flows
  const w1_status = Number(simState.tags.WELL1_STATUS);
  const w2_status = Number(simState.tags.WELL2_STATUS);
  const w3_status = Number(simState.tags.WELL3_STATUS);
  const w4_status = Number(simState.tags.WELL4_STATUS);

  const choke1 = Number(simState.tags.WELL1_CHOKE_VALVE);

  if (w1_status === 1) {
    simState.tags.WELL1_FLOW = Number((choke1 * 10 + 50 * Math.sin(t / 10)).toFixed(1));
  } else {
    simState.tags.WELL1_FLOW = 0;
  }

  if (w2_status === 1) {
    simState.tags.WELL2_FLOW = Number((380 + 30 * Math.sin(t / 12)).toFixed(1));
  } else {
    simState.tags.WELL2_FLOW = 0;
  }

  const inletFlow = Number(simState.tags.WELL1_FLOW) + Number(simState.tags.WELL2_FLOW);
  simState.tags.INLET_PRESS = Number((inletFlow * 0.08 + 10 + 2 * Math.sin(t / 8)).toFixed(1));

  // Separator level physics
  // Inflow = inletFlow
  // Outflow depends on Booster Pump RPM or bypass valve
  const pumpARpm = Number(simState.tags.BOOST_PUMP_A_RPM);
  const pumpBRpm = Number(simState.tags.BOOST_PUMP_B_RPM);
  const bypassPos = Number(simState.tags.VALVE_BYPASS_POS);

  const pumpAStatus = Number(simState.tags.BOOST_PUMP_STATUS);
  const pumpBStatus = Number(simState.tags.STANDBY_PUMP_STATUS);

  // Dynamic pump RPM calculation
  if (pumpAStatus === 1 && simState.tags.GEN1_STATUS === 1) {
    simState.tags.BOOST_PUMP_A_RPM = Math.min(2950, Number(simState.tags.BOOST_PUMP_A_RPM) + 300);
  } else {
    simState.tags.BOOST_PUMP_A_RPM = Math.max(0, Number(simState.tags.BOOST_PUMP_A_RPM) - 400);
  }

  if (pumpBStatus === 1 && simState.tags.GEN1_STATUS === 1) {
    simState.tags.BOOST_PUMP_B_RPM = Math.min(2950, Number(simState.tags.BOOST_PUMP_B_RPM) + 300);
  } else {
    simState.tags.BOOST_PUMP_B_RPM = Math.max(0, Number(simState.tags.BOOST_PUMP_B_RPM) - 400);
  }

  // Liquid Outflow
  const activePumpRpm = Math.max(Number(simState.tags.BOOST_PUMP_A_RPM), Number(simState.tags.BOOST_PUMP_B_RPM));
  let outflowOil = (activePumpRpm / 2950) * 650;
  if (bypassPos > 0) {
    outflowOil += (bypassPos / 100) * 150;
  }

  // If ESD valve is closed, separator outflow is completely blocked!
  if (Number(simState.tags.SEP_ESD_VALVE) === 0) {
    outflowOil = 0;
  }

  simState.tags.SEP_OUT_OIL_FLOW = Number(outflowOil.toFixed(1));

  // Level update
  const levelDiff = (inletFlow - outflowOil) * 0.03;
  let currentLevel = Number(simState.tags.SEP_LEVEL) + levelDiff;
  currentLevel = Math.max(0, Math.min(100, currentLevel));
  simState.tags.SEP_LEVEL = Number(currentLevel.toFixed(1));

  // Compressor (PGC) and separation pressure
  const pgcStatus = Number(simState.tags.PGC_STATUS);
  if (pgcStatus === 1 && simState.tags.GEN1_STATUS === 1) {
    simState.tags.PGC_RPM = Math.min(8400, Number(simState.tags.PGC_RPM) + 500);
  } else {
    simState.tags.PGC_RPM = Math.max(0, Number(simState.tags.PGC_RPM) - 800);
  }

  const pgcRpm = Number(simState.tags.PGC_RPM);
  simState.tags.SEP_PRESS = Number((20 + (inletFlow * 0.01) - (pgcRpm / 8400) * 5 + 1.2 * Math.sin(t / 15)).toFixed(1));
  simState.tags.PGC_DISCHARGE_P = Number((pgcRpm * 0.008 + 5).toFixed(1));

  // Alarm checking on level
  if (currentLevel > 75) {
    if (t % 20 === 0) {
      simState.logs.push({ timeSec: t, message: `CRITICAL ALARM: Separator High-High level at ${currentLevel.toFixed(1)}%! Carryover risk!`, type: "error" });
    }
  } else if (currentLevel > 60) {
    if (t % 30 === 0) {
      simState.logs.push({ timeSec: t, message: `WARNING: Separator liquid level high at ${currentLevel.toFixed(1)}%.`, type: "warning" });
    }
  }

  // Power load simulation
  if (Number(simState.tags.GEN1_STATUS) === 1) {
    simState.tags.BUS_VOLTAGE = 13.8;
    const basePower = 5.0;
    const pgcPower = (pgcRpm / 8400) * 6.5;
    const pumpPower = (activePumpRpm / 2950) * 2.8;
    simState.tags.GEN1_POWER = Number((basePower + pgcPower + pumpPower + Math.sin(t / 10)).toFixed(1));
  } else {
    simState.tags.BUS_VOLTAGE = 0;
    simState.tags.GEN1_POWER = 0;
  }
}

// Background simulator loop (runs once per second)
setInterval(() => {
  if (simState.isPlaying) {
    runPhysicsTick();
  }
}, 1000);

// API Endpoints

// Get current simulation state
app.get("/api/state", (req, res) => {
  res.json(simState);
});

// Control Simulation (Play, Pause, Speed, Reset)
app.post("/api/state/control", (req, res) => {
  const { action, value } = req.body;
  if (action === "play") {
    simState.isPlaying = true;
    simState.logs.push({ timeSec: simState.timeSec, message: "Simulation resumed.", type: "info" });
  } else if (action === "pause") {
    simState.isPlaying = false;
    simState.logs.push({ timeSec: simState.timeSec, message: "Simulation paused.", type: "info" });
  } else if (action === "speed") {
    simState.speedMultiplier = Number(value);
    simState.logs.push({ timeSec: simState.timeSec, message: `Simulation speed accelerated to ${value}x.`, type: "info" });
  } else if (action === "reset") {
    simState = {
      isPlaying: false,
      timeSec: 0,
      speedMultiplier: 1,
      activeScenarioId: null,
      logs: [{ timeSec: 0, message: "Offshore Complex Process Simulator reset to Steady State.", type: "info" }],
      tags: { ...initialTags },
      actionHistory: []
    };
  }
  res.json(simState);
});

// Trigger scenarios
app.post("/api/scenario/start", (req, res) => {
  const { scenarioId } = req.body;
  simState.activeScenarioId = scenarioId;
  simState.isPlaying = true;
  simState.timeSec = 0;
  simState.actionHistory = [];
  simState.logs = [{ timeSec: 0, message: `Scenario started: ${scenarioId}`, type: "info" }];

  if (scenarioId === 'startup_001') {
    simState.tags.GEN1_STATUS = 0;
    simState.tags.GEN1_POWER = 0;
    simState.tags.BUS_VOLTAGE = 0;
    simState.tags.WELL1_STATUS = 0;
    simState.tags.WELL2_STATUS = 0;
    simState.tags.WELL1_CHOKE_VALVE = 0;
    simState.tags.WELL1_FLOW = 0;
    simState.tags.WELL2_FLOW = 0;
    simState.tags.SEP_LEVEL = 12.0;
    simState.tags.INLET_PRESS = 4.5;
    simState.tags.BOOST_PUMP_STATUS = 0;
    simState.tags.BOOST_PUMP_A_RPM = 0;
    simState.tags.BOOST_PUMP_FLOW = 0;
  } else if (scenarioId === 'booster_trip_001') {
    simState.tags = { ...initialTags };
  } else if (scenarioId === 'subsea_fault_001') {
    simState.tags = { ...initialTags };
  }

  res.json(simState);
});

// Write / force process tags directly from trainee panel
app.post("/api/tags/write", (req, res) => {
  const { tagName, value } = req.body;
  if (tagName in simState.tags) {
    const prevVal = simState.tags[tagName];
    let parsedVal: string | number = value;
    if (!isNaN(Number(value)) && value !== "") {
      parsedVal = Number(value);
    }
    simState.tags[tagName] = parsedVal;
    simState.actionHistory.push(`${tagName} changed from ${prevVal} to ${parsedVal}`);
    simState.logs.push({
      timeSec: simState.timeSec,
      message: `OPERATOR ACTION: Set ${tagName} to ${parsedVal}`,
      type: "success"
    });
  }
  res.json(simState);
});

// Gemini Advisor API
app.post("/api/gemini/advisor", async (req, res) => {
  if (!aiClient) {
    return res.status(500).json({
      error: "Google Gemini API client is not configured. Please ensure process.env.GEMINI_API_KEY is supplied in Secrets."
    });
  }

  const { currentScenario, activeAlarms, actionsDone } = req.body;

  const prompt = `You are the lead AI Safety Officer & Lead Process Engineering Advisor on a shallow-water fixed-platform process complex.
The platform operators are conducting simulator-based standard operating procedure and hazard drills.

Analyze the current state of the process complex:
- Active Scenario: ${currentScenario || 'Steady State Normal Operations'}
- Active Warnings/Alarms and Out-of-Range Tags:
${JSON.stringify(activeAlarms, null, 2)}
- Trainee Action Logs:
${JSON.stringify(actionsDone, null, 2)}

Provide an advanced lead engineering safety analysis.
Your response MUST highlight:
1. Chemical and physics process impacts (e.g., how separator liquid carryover impacts compressor blades, surge limits, or pipeline transient pressure accumulator thresholds).
2. Precise operator corrective actions to take right now to recover the system safely.
3. Relevant Standard Operating Procedure (SOP) alignments.

Speak objectively, with high scientific and engineering rigor. Format your response beautifully in clear, professional Markdown. Do not praise yourself. Include brief structured advice.`;

  try {
    const response = await aiClient.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
      },
    });

    res.json({ advice: response.text });
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    res.status(500).json({ error: err.message || "An error occurred with the Gemini API." });
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
