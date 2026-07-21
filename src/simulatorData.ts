import { ProcessTag, SimulationScenario, TestSuiteResult } from './types';

export const INITIAL_TAGS: ProcessTag[] = [
  // Wells
  { tagName: 'WELL1_FLOW', description: 'Well 1 liquid+gas flow', unit: 'm3/h', minVal: 0, maxVal: 1200, currentValue: 450, normalRange: '300-800', updateRate: '1s', type: 'Analog', category: 'Wells' },
  { tagName: 'WELL2_FLOW', description: 'Well 2 liquid+gas flow', unit: 'm3/h', minVal: 0, maxVal: 1000, currentValue: 380, normalRange: '200-700', updateRate: '1s', type: 'Analog', category: 'Wells' },
  { tagName: 'WELL3_FLOW', description: 'Well 3 liquid+gas flow', unit: 'm3/h', minVal: 0, maxVal: 900, currentValue: 310, normalRange: '150-600', updateRate: '1s', type: 'Analog', category: 'Wells' },
  { tagName: 'WELL4_FLOW', description: 'Well 4 liquid+gas flow', unit: 'm3/h', minVal: 0, maxVal: 800, currentValue: 290, normalRange: '100-500', updateRate: '1s', type: 'Analog', category: 'Wells' },
  { tagName: 'WELL1_GAS_FRAC', description: 'Well 1 gas fraction', unit: 'vol%', minVal: 0, maxVal: 100, currentValue: 12.5, normalRange: '5-25', updateRate: '1s', type: 'Analog', category: 'Wells' },
  { tagName: 'WELL2_GAS_FRAC', description: 'Well 2 gas fraction', unit: 'vol%', minVal: 0, maxVal: 100, currentValue: 14.2, normalRange: '5-25', updateRate: '1s', type: 'Analog', category: 'Wells' },
  { tagName: 'WELL1_STATUS', description: 'Well 1 production state', unit: 'state', minVal: 0, maxVal: 1, currentValue: 1, normalRange: '0=Off, 1=On', updateRate: '1s', type: 'Discrete', category: 'Wells' },
  { tagName: 'WELL2_STATUS', description: 'Well 2 production state', unit: 'state', minVal: 0, maxVal: 1, currentValue: 1, normalRange: '0=Off, 1=On', updateRate: '1s', type: 'Discrete', category: 'Wells' },
  { tagName: 'WELL1_CHOKE_VALVE', description: 'Well 1 choke valve opening', unit: '%', minVal: 0, maxVal: 100, currentValue: 45, normalRange: '30-80', updateRate: '1s', type: 'Analog', category: 'Wells' },

  // Topside Separation
  { tagName: 'INLET_PRESS', description: 'Platform inlet manifold pressure', unit: 'barg', minVal: 5, maxVal: 80, currentValue: 42.5, normalRange: '30-55', updateRate: '1s', type: 'Analog', category: 'Topside Separation' },
  { tagName: 'INLET_TEMP', description: 'Platform inlet temperature', unit: 'degC', minVal: -5, maxVal: 120, currentValue: 38.4, normalRange: '20-65', updateRate: '1s', type: 'Analog', category: 'Topside Separation' },
  { tagName: 'SEP_LEVEL', description: 'Separator liquid level', unit: '%', minVal: 0, maxVal: 100, currentValue: 45.2, normalRange: '30-60', updateRate: '1s', type: 'Analog', category: 'Topside Separation' },
  { tagName: 'SEP_PRESS', description: 'Separator pressure', unit: 'barg', minVal: 1, maxVal: 50, currentValue: 22.4, normalRange: '15-35', updateRate: '1s', type: 'Analog', category: 'Topside Separation' },
  { tagName: 'SEP_TEMP', description: 'Separator operational temperature', unit: 'degC', minVal: 0, maxVal: 150, currentValue: 48.6, normalRange: '30-70', updateRate: '1s', type: 'Analog', category: 'Topside Separation' },
  { tagName: 'SEP_ESD_VALVE', description: 'Separator Emergency Shut Down valve', unit: 'state', minVal: 0, maxVal: 1, currentValue: 1, normalRange: '0=Closed, 1=Open', updateRate: '1s', type: 'Discrete', category: 'Topside Separation' },
  { tagName: 'SEP_OUT_OIL_FLOW', description: 'Separator oil output flow', unit: 'm3/h', minVal: 0, maxVal: 1000, currentValue: 620, normalRange: '400-800', updateRate: '1s', type: 'Analog', category: 'Topside Separation' },
  { tagName: 'SEP_OUT_GAS_FLOW', description: 'Separator gas output flow', unit: 'kNm3/h', minVal: 0, maxVal: 500, currentValue: 185, normalRange: '100-300', updateRate: '1s', type: 'Analog', category: 'Topside Separation' },

  // PGC Compressor (Pipeline Gas Compressor)
  { tagName: 'PGC_SUCTION_P', description: 'PGC suction pressure', unit: 'barg', minVal: 1, maxVal: 30, currentValue: 18.2, normalRange: '12-25', updateRate: '1s', type: 'Analog', category: 'PGC Compressor' },
  { tagName: 'PGC_DISCHARGE_P', description: 'PGC discharge pipeline pressure', unit: 'barg', minVal: 10, maxVal: 120, currentValue: 72.4, normalRange: '50-95', updateRate: '1s', type: 'Analog', category: 'PGC Compressor' },
  { tagName: 'PGC_RPM', description: 'PGC turbine speed', unit: 'rpm', minVal: 0, maxVal: 12000, currentValue: 8400, normalRange: '6000-10500', updateRate: '1s', type: 'Analog', category: 'PGC Compressor' },
  { tagName: 'PGC_STATUS', description: 'PGC compressor running status', unit: 'state', minVal: 0, maxVal: 2, currentValue: 1, normalRange: '0=Stop, 1=Run, 2=Trip', updateRate: '1s', type: 'Discrete', category: 'PGC Compressor' },
  { tagName: 'PGC_BEARING_TEMP', description: 'PGC turbine main bearing temperature', unit: 'degC', minVal: 0, maxVal: 180, currentValue: 74.2, normalRange: '40-95', updateRate: '1s', type: 'Analog', category: 'PGC Compressor' },
  { tagName: 'PGC_BYPASS_VALVE', description: 'PGC anti-surge bypass valve opening', unit: '%', minVal: 0, maxVal: 100, currentValue: 0, normalRange: '0-10', updateRate: '1s', type: 'Analog', category: 'PGC Compressor' },

  // Booster Pumps
  { tagName: 'BOOST_PUMP_A_RPM', description: 'Booster Pump A impeller speed', unit: 'rpm', minVal: 0, maxVal: 3600, currentValue: 2950, normalRange: '2400-3200', updateRate: '1s', type: 'Analog', category: 'Booster Pumps' },
  { tagName: 'BOOST_PUMP_B_RPM', description: 'Booster Pump B (Standby) speed', unit: 'rpm', minVal: 0, maxVal: 3600, currentValue: 0, normalRange: '0=Idle, 2400-3200', updateRate: '1s', type: 'Analog', category: 'Booster Pumps' },
  { tagName: 'BOOST_PUMP_STATUS', description: 'Booster Pump A operational status', unit: 'state', minVal: 0, maxVal: 2, currentValue: 1, normalRange: '0=Stop, 1=Run, 2=Fault', updateRate: '1s', type: 'Discrete', category: 'Booster Pumps' },
  { tagName: 'STANDBY_PUMP_STATUS', description: 'Booster Pump B operational status', unit: 'state', minVal: 0, maxVal: 1, currentValue: 0, normalRange: '0=Stop/Standby, 1=Run', updateRate: '1s', type: 'Discrete', category: 'Booster Pumps' },
  { tagName: 'BOOST_PUMP_FLOW', description: 'Booster pump discharge liquid flow', unit: 'm3/h', minVal: 0, maxVal: 1200, currentValue: 780, normalRange: '500-1000', updateRate: '1s', type: 'Analog', category: 'Booster Pumps' },
  { tagName: 'BOOST_PUMP_PRESS_OUT', description: 'Booster pump manifold discharge pressure', unit: 'barg', minVal: 0, maxVal: 100, currentValue: 54.8, normalRange: '40-75', updateRate: '1s', type: 'Analog', category: 'Booster Pumps' },
  { tagName: 'VALVE_BYPASS_POS', description: 'Booster loop bypass valve position', unit: '%', minVal: 0, maxVal: 100, currentValue: 0, normalRange: '0=Normal Closed', updateRate: '1s', type: 'Analog', category: 'Booster Pumps' },

  // Water Injection
  { tagName: 'WATER_INJ_FLOW', description: 'Seawater injection volume rate', unit: 'm3/h', minVal: 0, maxVal: 800, currentValue: 420, normalRange: '300-600', updateRate: '1s', type: 'Analog', category: 'Water Injection' },
  { tagName: 'WATER_INJ_PRESS', description: 'Water injection wellhead line pressure', unit: 'barg', minVal: 0, maxVal: 150, currentValue: 112.5, normalRange: '90-130', updateRate: '1s', type: 'Analog', category: 'Water Injection' },
  { tagName: 'WATER_INJ_STATUS', description: 'Water injection pump state', unit: 'state', minVal: 0, maxVal: 1, currentValue: 1, normalRange: '0=Off, 1=On', updateRate: '1s', type: 'Discrete', category: 'Water Injection' },
  { tagName: 'WATER_INJ_VALVE', description: 'Water injection flow control valve', unit: '%', minVal: 0, maxVal: 100, currentValue: 58, normalRange: '20-80', updateRate: '1s', type: 'Analog', category: 'Water Injection' },

  // Power Gen
  { tagName: 'GEN1_POWER', description: 'Main Turbogenerator 1 electrical load', unit: 'MW', minVal: 0, maxVal: 25, currentValue: 14.8, normalRange: '8-20', updateRate: '1s', type: 'Analog', category: 'Power Gen' },
  { tagName: 'GEN2_POWER', description: 'Turbogenerator 2 electrical load', unit: 'MW', minVal: 0, maxVal: 25, currentValue: 0, normalRange: '0=Idle, 8-20', updateRate: '1s', type: 'Analog', category: 'Power Gen' },
  { tagName: 'GEN1_STATUS', description: 'Main Turbogenerator 1 active status', unit: 'state', minVal: 0, maxVal: 1, currentValue: 1, normalRange: '0=Offline, 1=Online', updateRate: '1s', type: 'Discrete', category: 'Power Gen' },
  { tagName: 'GEN2_STATUS', description: 'Turbogenerator 2 standby status', unit: 'state', minVal: 0, maxVal: 1, currentValue: 0, normalRange: '0=Offline, 1=Online', updateRate: '1s', type: 'Discrete', category: 'Power Gen' },
  { tagName: 'BUS_VOLTAGE', description: 'Main switchgear bus bar voltage', unit: 'kV', minVal: 0, maxVal: 15, currentValue: 13.8, normalRange: '13.2-14.2', updateRate: '1s', type: 'Analog', category: 'Power Gen' },

  // Subsea Systems
  { tagName: 'SUBSEA_COMM_RTT', description: 'Subsea fiber-optic network ping RTT', unit: 'ms', minVal: 0, maxVal: 5000, currentValue: 45, normalRange: '20-100', updateRate: '1s', type: 'Analog', category: 'Subsea Systems' },
  { tagName: 'SUBSEA_POWER_STATUS', description: 'Subsea high voltage umbilical power feed', unit: 'state', minVal: 0, maxVal: 1, currentValue: 1, normalRange: '0=Dead, 1=Healthy', updateRate: '1s', type: 'Discrete', category: 'Subsea Systems' },
  { tagName: 'SUBSEA_MANIFOLD_P', description: 'Subsea production manifold upstream pressure', unit: 'barg', minVal: 0, maxVal: 200, currentValue: 142.6, normalRange: '110-170', updateRate: '1s', type: 'Analog', category: 'Subsea Systems' },
  { tagName: 'SUBSEA_ESD_VALVE', description: 'Subsea manifold isolation safety valve', unit: 'state', minVal: 0, maxVal: 1, currentValue: 1, normalRange: '0=Shut, 1=Open', updateRate: '1s', type: 'Discrete', category: 'Subsea Systems' }
];

export const SCENARIOS: SimulationScenario[] = [
  {
    scenarioId: 'startup_001',
    title: 'Offshore Complex Cold Startup',
    description: 'Walk through the Standard Operating Procedure (SOP) to safely bootstrap the topside process separator, turbogenerators, and Wells 1-2 from cold shut-in state.',
    durationSec: 300,
    events: [
      { timeSec: 0, type: 'system', targetTag: 'GEN1_STATUS', value: 0, description: 'Power grid is currently black' },
      { timeSec: 0, type: 'system', targetTag: 'WELL1_STATUS', value: 0, description: 'Well 1 is shut-in' },
      { timeSec: 0, type: 'system', targetTag: 'WELL1_CHOKE_VALVE', value: 0, description: 'Choke is closed' },
      { timeSec: 0, type: 'system', targetTag: 'SEP_LEVEL', value: 12.0, description: 'Separator level at bottom minimum (12%)' },
      { timeSec: 0, type: 'system', targetTag: 'INLET_PRESS', value: 4.5, description: 'Platform inlet pressure depressurized' }
    ],
    expectedOperatorActions: [
      { timeWindowSec: [1, 60], action: 'Sync Main Turbogenerator (GEN1_STATUS = 1)', successCriteria: 'Start GEN1, verify BUS_VOLTAGE reaches 13.8kV and GEN1_POWER starts carrying minimal load.', completed: false, status: 'pending' },
      { timeWindowSec: [30, 150], action: 'Open Well 1 Choke Valve to 45%', successCriteria: 'WELL1_CHOKE_VALVE set to 45% and WELL1_STATUS switched to 1.', completed: false, status: 'pending' },
      { timeWindowSec: [100, 240], action: 'Stabilize Separator Liquid Level to 40%-55%', successCriteria: 'Liquid flows through SEP_OUT_OIL_FLOW, SEP_LEVEL reaches the normal range of 40-55%.', completed: false, status: 'pending' }
    ]
  },
  {
    scenarioId: 'booster_trip_001',
    title: 'Booster Pump Mechanical Trip',
    description: 'Handle a sudden, critical mechanical failure of the primary Booster Pump A. Standard protective controls will trip the pump. Act fast to avoid topside overpressure and process trip!',
    durationSec: 400,
    events: [
      { timeSec: 15, type: 'fault', targetTag: 'BOOST_PUMP_STATUS', value: 2, description: 'Booster Pump A trips with a high-vibration fault' },
      { timeSec: 15, type: 'auto', targetTag: 'BOOST_PUMP_A_RPM', value: 0, description: 'Booster Pump A speed decelerates to 0 RPM' },
      { timeSec: 16, type: 'auto', targetTag: 'VALVE_BYPASS_POS', value: 100, description: 'Topside safety control opens booster loop bypass valve fully' },
      { timeSec: 18, type: 'auto', targetTag: 'BOOST_PUMP_FLOW', value: 180, description: 'Discharge liquid flow falls dramatically' },
      { timeSec: 25, type: 'system', targetTag: 'SEP_LEVEL', value: 68.4, description: 'Liquid separator level rises rapidly (now 68.4%)' }
    ],
    expectedOperatorActions: [
      { timeWindowSec: [15, 80], action: 'Open bypass loop fully and acknowledge high separator level alarm', successCriteria: 'VALVE_BYPASS_POS verified at 100% and alarm acknowledged.', completed: false, status: 'pending' },
      { timeWindowSec: [30, 180], action: 'Initiate Standby Booster Pump B (STANDBY_PUMP_STATUS = 1)', successCriteria: 'Start Booster Pump B (STANDBY_PUMP_STATUS set to 1), verify BOOST_PUMP_B_RPM stabilizes around 2950 RPM.', completed: false, status: 'pending' },
      { timeWindowSec: [100, 300], action: 'Restore normal separation levels and flow by closing the bypass', successCriteria: 'Gradually close VALVE_BYPASS_POS to 0%, verify SEP_LEVEL stabilizes below 55% and pump flow is above 600 m3/h.', completed: false, status: 'pending' }
    ]
  },
  {
    scenarioId: 'subsea_fault_001',
    title: 'Subsea Umbilical & Comms Fault',
    description: 'The subsea fiber-optic communications cable experiences high attenuation or physical rupture. Control telemetry to the unmanned wellheads is severely degraded. Isolate subsea feeds and trigger Emergency Shutdown.',
    durationSec: 500,
    events: [
      { timeSec: 20, type: 'fault', targetTag: 'SUBSEA_COMM_RTT', value: 4850, description: 'Fiber-optic ping latency spikes to 4,850ms (packet loss 92%)' },
      { timeSec: 22, type: 'fault', targetTag: 'SUBSEA_POWER_STATUS', value: 0, description: 'High-voltage umbilical power feed drops (Ground fault detected)' },
      { timeSec: 25, type: 'system', targetTag: 'SUBSEA_MANIFOLD_P', value: 188.5, description: 'Subsea production manifold upstream pressure accumulates to dangerous level (188.5 barg)' }
    ],
    expectedOperatorActions: [
      { timeWindowSec: [20, 90], action: 'Activate safety bypass and acknowledge subsea communication alarms', successCriteria: 'Communications alarm acknowledged, operator switches well control from remote subsea to local manual.', completed: false, status: 'pending' },
      { timeWindowSec: [40, 180], action: 'Close Subsea Manifold ESD Valve (SUBSEA_ESD_VALVE = 0)', successCriteria: 'Set SUBSEA_ESD_VALVE to 0 to isolate subsea flow and prevent hydrocarbon venting.', completed: false, status: 'pending' },
      { timeWindowSec: [60, 250], action: 'Shutdown production wells and trigger separator ESD isolation (SEP_ESD_VALVE = 0)', successCriteria: 'Set WELL1_STATUS and WELL2_STATUS to 0, close SEP_ESD_VALVE to bring the topside separation train into secure hot-standby.', completed: false, status: 'pending' }
    ]
  }
];

export const THREEJS_MANIFEST_RAW = {
  "sceneName": "ShallowWaterProcessComplex",
  "engine": "threejs",
  "units": "meters",
  "assets": [
    { "id": "platform_topsides", "path": "assets/platform_topsides.glb", "lod": [0, 1, 2] },
    { "id": "pgc_skid", "path": "assets/pgc_skid.glb", "lod": [0, 1] },
    { "id": "booster_skid", "path": "assets/booster_skid.glb", "lod": [0, 1] },
    { "id": "water_injection_skid", "path": "assets/water_injection_skid.glb", "lod": [0, 1] },
    { "id": "unmanned_wellhead", "path": "assets/unmanned_wellhead.glb", "lod": [1, 2] },
    { "id": "subsea_manifold", "path": "assets/subsea_manifold.glb", "lod": [0, 1] },
    { "id": "vessel", "path": "assets/vessel.glb", "lod": [1, 2] },
    { "id": "helicopter", "path": "assets/helicopter.glb", "lod": [1, 2] }
  ],
  "lodRules": { "distances": { "LOD0": 20, "LOD1": 200, "LOD2": 1000 }, "impostorDistance": 1200 },
  "cameras": {
    "clusterMap": { "type": "orthographic", "pos": [0, 200, 0], "lookAt": [0, 0, 0] },
    "approachSpline": { "type": "spline", "points": [[0, 200, 0], [50, 80, 30], [20, 30, 10]] },
    "systemFocus": { "type": "spline", "points": [[20, 30, 10], [15, 10, 5], [10, 5, 2]] },
    "closeUp": { "type": "orbit", "target": "pgc_skid" }
  },
  "tagOverlayRules": {
    "colorByState": { "normal": "#2ecc71", "warn": "#f1c40f", "alarm": "#e74c3c" },
    "display": { "lineLimit": 1, "showSparkline": true, "sparklineWindowSec": 30 },
    "clickAction": { "openPanel": "dcsMimic", "panelRoute": "/dcs/{tag}" }
  },
  "scenarioSchema": {
    "scenarioId": "string",
    "title": "string",
    "durationSec": "number",
    "events": [{ "timeSec": "number", "type": "fault|action|auto", "targetTag": "string", "value": "any", "description": "string" }],
    "expectedOperatorActions": [{ "timeWindowSec": "[start,end]", "action": "string", "successCriteria": "string" }]
  },
  "integration": {
    "opcua": { "endpoint": "opc.tcp://edge-gateway:4840", "mappingFile": "opc_mapping.json" },
    "historian": { "playbackApi": "https://hist.api/playback", "auth": "token" },
    "romService": { "endpoint": "https://rom.server/evaluate", "mode": "server" }
  },
  "performance": { "targetUIResponseMs": 500, "maxTagUpdateHz": 20, "batchUpdateMs": 50 }
};

export const TWELVE_WEEK_SCHEDULE = [
  {
    weeks: '0-2',
    focus: 'Requirements & Data Access',
    tasks: [
      'Finalize operational simulator requirements & boundary constraints',
      'Conduct 120-tag mapping list with offshore instrumentation SMEs',
      'Export historian dataset from active field to seed the emulator',
      'SME interview sequence regarding common offshore fault modes',
      'Establish Git repository skeleton with full CI/CD configurations'
    ],
    artifacts: 'Tag CSV Schema, Historian sample, Project roadmap',
    status: 'completed'
  },
  {
    weeks: '3-6',
    focus: 'Process Complex MVP',
    tasks: [
      'Build physical solver equations for topside gas/liquid separations',
      'Deploy the 2D SVG animated process miming schematic panel',
      'Validate startup nominal scenario SOP with virtual control panel',
      'Develop reduced order model (ROM) neural network prototype for separator ramp-up',
      'Incorporate storyboard panel SVGs (A1 to A6) for Separation Unit'
    ],
    artifacts: 'Separation simulation model, SVG A1-A6, ROM prototype v1',
    status: 'completed'
  },
  {
    weeks: '7-9',
    focus: 'Bridge Platforms & Visualization',
    tasks: [
      'Simulate the Pipeline Gas Compressor (PGC) suction and surge loops',
      'Model booster pump impellers and Variable Frequency Drives (VFD)',
      'Model 13.8kV electrical network including generator sync controls',
      'Publish Three.js WebGL rendering manifest & camera position array',
      'Deliver storyboard panels (B1 to B6) covering bridge utilities'
    ],
    artifacts: 'PGC & Booster Model, SVG B1-B6, ThreeJS scene map',
    status: 'active'
  },
  {
    weeks: '10-12',
    focus: 'Unmanned Wellheads & Subsea',
    tasks: [
      'Model subsea production manifolds and well flows',
      'Build transmission logic for high-voltage power & telemetry lines',
      'Program helideck and supply vessel docking animations',
      'Design subsea pipeline transient pressure accumulator equations',
      'Consolidate storyboard panels (C1 to C6) and trigger full multi-platform fault test'
    ],
    artifacts: 'Subsea Model, SVG C1-C6, Multi-platform scenario',
    status: 'pending'
  },
  {
    weeks: '13-14',
    focus: 'Validation & Rollout',
    tasks: [
      'Run rigorous validation test suite against historical baseline',
      'Execute offshore trainer and SME pilot user trials',
      'Publish OPC UA server gateway mapping schema and config',
      'Build final operator handoff evidence package and documentation',
      'Complete production deployment and train offshore operations team'
    ],
    artifacts: 'OPC UA edge config, SOP training logs, Hand-off package',
    status: 'pending'
  }
];

export const TEST_CASES: TestSuiteResult[] = [
  { id: 'PF-01', name: 'Steady-State Mass Balance', category: 'Physics Fidelity', assertion: 'Inlet Wells Mass Flow == Outflow Liquid + Outflow Gas', status: 'idle', valueMeasured: '0.00 kg/s', targetRange: 'Within ±2% error' },
  { id: 'PF-02', name: 'Separator Level Physics', category: 'Physics Fidelity', assertion: 'Level rises when separator out-flow is less than inlet-flow', status: 'idle', valueMeasured: '0.00 %', targetRange: 'Perfect direction check' },
  { id: 'TB-01', name: 'Booster Pump Trip Deceleration', category: 'Transient Behavior', assertion: 'RPM falls from 2950 to 0 in 3 seconds following a fault', status: 'idle', valueMeasured: '0.0 RPM', targetRange: 'Time constant 1.2s' },
  { id: 'TB-02', name: 'Anti-Surge Bypass Valve Protection', category: 'Transient Behavior', assertion: 'Valve opens to 100% within 1.5 seconds of compressor trip', status: 'idle', valueMeasured: '0.0 s', targetRange: '< 2.0 seconds' },
  { id: 'UI-01', name: 'Tag Update Latency', category: 'UI Performance', assertion: 'Main dashboard tag values update frequency rate', status: 'idle', valueMeasured: '0 ms', targetRange: '< 200 ms latency' },
  { id: 'UI-02', name: 'DCS Mimic Response Time', category: 'UI Performance', assertion: 'Click actions respond and load DCS mimic graphics panels', status: 'idle', valueMeasured: '0 ms', targetRange: '< 500 ms response' },
  { id: 'SEC-01', name: 'OPC UA Connection Security', category: 'Security', assertion: 'Rejects insecure anonymous OPC UA clients without certificates', status: 'idle', valueMeasured: 'Not Checked', targetRange: 'Must block with SSL TLS' }
];
