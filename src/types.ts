export interface ProcessTag {
  tagName: string;
  description: string;
  unit: string;
  minVal: number;
  maxVal: number;
  currentValue: number;
  normalRange: string;
  updateRate: string;
  type: 'Analog' | 'Discrete';
  category: 'Wells' | 'Topside Separation' | 'PGC Compressor' | 'Booster Pumps' | 'Water Injection' | 'Power Gen' | 'Subsea Systems';
}

export interface ScenarioEvent {
  timeSec: number;
  type: 'fault' | 'action' | 'auto' | 'system';
  targetTag: string;
  value: any;
  description: string;
}

export interface OperatorAction {
  timeWindowSec: [number, number];
  action: string;
  successCriteria: string;
  completed: boolean;
  status: 'pending' | 'success' | 'failed';
}

export interface SimulationScenario {
  scenarioId: string;
  title: string;
  description: string;
  durationSec: number;
  events: ScenarioEvent[];
  expectedOperatorActions: OperatorAction[];
}

export interface ActiveSimulationState {
  isPlaying: boolean;
  timeSec: number;
  speedMultiplier: number;
  activeScenarioId: string | null;
  logs: { timeSec: number; message: string; type: 'info' | 'warning' | 'error' | 'success' }[];
  tags: Record<string, number | string>;
}

export interface TestSuiteResult {
  id: string;
  name: string;
  category: 'Physics Fidelity' | 'Transient Behavior' | 'UI Performance' | 'Security';
  assertion: string;
  status: 'passed' | 'failed' | 'running' | 'idle';
  valueMeasured: string;
  targetRange: string;
}
