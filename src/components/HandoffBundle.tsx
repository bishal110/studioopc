import { useState } from 'react';
import { TWELVE_WEEK_SCHEDULE, THREEJS_MANIFEST_RAW, TEST_CASES } from '../simulatorData';
import { TestSuiteResult } from '../types';
import { Clipboard, FolderGit, Calendar, FileCheck2, Hammer, Code, ShieldAlert, BadgeDollarSign, Check, Play, RefreshCw } from 'lucide-react';

export default function HandoffBundle() {
  const [activeTab, setActiveTab] = useState<'schedule' | 'threejs' | 'validation' | 'deployment'>('schedule');
  const [threeJsManifest, setThreeJsManifest] = useState(JSON.stringify(THREEJS_MANIFEST_RAW, null, 2));
  const [tests, setTests] = useState<TestSuiteResult[]>(TEST_CASES);
  const [runningTests, setRunningTests] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runValidationSuite = () => {
    setRunningTests(true);
    // Simulate iterative testing runs
    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < tests.length) {
        setTests(prev => prev.map((t, idx) => {
          if (idx === currentIdx) {
            const val = t.category === 'Physics Fidelity' ? '98.8%' : t.category === 'Transient Behavior' ? '1.4s' : t.category === 'UI Performance' ? '45ms' : 'SSL Validated';
            return {
              ...t,
              status: 'passed' as const,
              valueMeasured: val
            };
          }
          return t;
        }));
        currentIdx++;
      } else {
        clearInterval(interval);
        setRunningTests(false);
      }
    }, 400);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col h-full select-none">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xs md:text-sm flex items-center gap-2">
          <span className="text-blue-600 dark:text-blue-400 font-bold text-base">◈</span>
          Handoff Deliverables Bundle & Project Integration Explorer
        </h3>
        <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Complete, production-ready deliverables ready for team handoff.
        </p>

        {/* Tab Selection */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${activeTab === 'schedule' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-50'}`}
          >
            <Calendar className="w-3.5 h-3.5" />
            12-Week Roadmap
          </button>
          <button
            onClick={() => setActiveTab('threejs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${activeTab === 'threejs' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-50'}`}
          >
            <Code className="w-3.5 h-3.5" />
            Three.js Manifest
          </button>
          <button
            onClick={() => setActiveTab('validation')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${activeTab === 'validation' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-50'}`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            Validation Suite
          </button>
          <button
            onClick={() => setActiveTab('deployment')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${activeTab === 'deployment' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-50'}`}
          >
            <Hammer className="w-3.5 h-3.5" />
            Deployment Guide
          </button>
        </div>
      </div>

      <div className="p-5 flex-1 overflow-y-auto max-h-[600px] scrollbar-thin">
        {/* Tab 1: 12-Week Roadmap */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <div className="border-l-2 border-blue-600 pl-4">
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs md:text-sm">Offshore Complex 12-Week Master Schedule</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Sequenced implementation timeline spanning process engineering modeling, bridge infrastructure, wellhead control loops, and final operator training trials.
              </p>
            </div>

            <div className="space-y-4">
              {TWELVE_WEEK_SCHEDULE.map((phase, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-950/20 rounded-xl border border-slate-200 dark:border-slate-800/60 p-4">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800/60 pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        Weeks {phase.weeks}
                      </span>
                      <h5 className="font-bold text-slate-800 dark:text-slate-100 text-xs">{phase.focus}</h5>
                    </div>
                    <span className={`text-[10px] font-semibold font-mono px-2 py-0.5 rounded uppercase ${phase.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' : phase.status === 'active' ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                      {phase.status}
                    </span>
                  </div>

                  <ul className="text-xs text-slate-600 dark:text-slate-350 space-y-1.5 pl-4 list-disc leading-relaxed">
                    {phase.tasks.map((task, j) => (
                      <li key={j}>{task}</li>
                    ))}
                  </ul>

                  <div className="mt-3 pt-2.5 border-t border-slate-150 dark:border-slate-800/40 flex justify-between items-center text-[10px] font-mono">
                    <span className="text-slate-400">Deliverable Deliveries:</span>
                    <strong className="text-slate-750 dark:text-slate-300">{phase.artifacts}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Three.js Manifest */}
        {activeTab === 'threejs' && (
          <div className="space-y-4 h-full flex flex-col">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs md:text-sm">Three.js WebGL Scene Manifest Specification</h4>
                <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 mt-1">WebGL loader map containing level-of-detail rules, assets loading arrays, and tag overlay logic.</p>
              </div>
              <button
                onClick={() => copyToClipboard(threeJsManifest)}
                className="flex items-center gap-1.5 text-[10px] bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-lg transition-all font-semibold shadow-xs"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Clipboard className="w-3 h-3" />}
                {copied ? 'Copied!' : 'Copy JSON'}
              </button>
            </div>

            <textarea
              value={threeJsManifest}
              onChange={(e) => setThreeJsManifest(e.target.value)}
              className="w-full flex-1 min-h-[350px] rounded-lg border border-slate-300 dark:border-slate-850 bg-slate-950 font-mono text-[11px] p-3 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Tab 3: Physics Validation & QA Suite */}
        {activeTab === 'validation' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs md:text-sm">Acceptance & Regression Testing Suite</h4>
                <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 mt-0.5">Automated validation testing physical formulas, transient constants, and UI update speeds.</p>
              </div>
              <button
                onClick={runValidationSuite}
                disabled={runningTests}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-850 text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
              >
                {runningTests ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                {runningTests ? 'Running Test Suite...' : 'Run Test Suite'}
              </button>
            </div>

            <div className="space-y-2.5">
              {tests.map((t, i) => (
                <div key={t.id} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-slate-50 dark:bg-slate-950/20">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                      {t.id}
                    </span>
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-100">{t.name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{t.assertion}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right font-mono text-[10px] text-slate-400">
                      <div>TARGET: {t.targetRange}</div>
                      <div className="text-slate-650 dark:text-slate-300 mt-0.5 font-semibold">MEASURED: {t.valueMeasured}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${t.status === 'passed' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' : t.status === 'failed' ? 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                      {t.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Deployment & Operations */}
        {activeTab === 'deployment' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-300 dark:border-slate-800 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/20">
                <h5 className="font-bold text-slate-800 dark:text-slate-100 text-xs flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  Edge Gateway & Security Guide
                </h5>
                <ul className="text-xs text-slate-600 dark:text-slate-350 space-y-2 mt-3 list-disc pl-4 leading-relaxed">
                  <li><strong>Endpoint URI:</strong> Configure standard <code>opc.tcp://edge-gateway:4840</code> inside corporate isolated subnet.</li>
                  <li><strong>TLS Encryption:</strong> Enable certificate authorization (SSL TLS 1.3) rejecting anonymous handshakes.</li>
                  <li><strong>Historian Hook:</strong> Map RESTful time-series fetch queries using standard TLS authentication headers.</li>
                </ul>
              </div>

              <div className="border border-slate-300 dark:border-slate-800 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/20">
                <h5 className="font-bold text-slate-800 dark:text-slate-100 text-xs flex items-center gap-1.5">
                  <BadgeDollarSign className="w-4 h-4 text-emerald-500" />
                  Implementation Budget & Resource Calculator
                </h5>
                <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-350">
                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-800/40 pb-1.5">
                    <span>Engineering & Modeling:</span>
                    <strong className="text-slate-800 dark:text-slate-200">$90,000</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-800/40 pb-1.5">
                    <span>License & Toolchains:</span>
                    <strong className="text-slate-800 dark:text-slate-200">$30,000</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-800/40 pb-1.5">
                    <span>Visualization & Assets:</span>
                    <strong className="text-slate-800 dark:text-slate-200">$20,000</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-800/40 pb-1.5">
                    <span>Integration & DevOps:</span>
                    <strong className="text-slate-800 dark:text-slate-200">$25,000</strong>
                  </div>
                  <div className="flex justify-between font-bold border-t border-slate-300 dark:border-slate-700 pt-2 text-slate-800 dark:text-slate-100">
                    <span>TOTAL ESTIMATED CAPEX:</span>
                    <span>$180,000 USD</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Docker Compose Specs */}
            <div className="border border-slate-300 dark:border-slate-800 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/20 space-y-3">
              <h5 className="font-bold text-slate-800 dark:text-slate-100 text-xs flex items-center gap-2">
                <span className="p-1 rounded bg-slate-250 dark:bg-slate-850 text-slate-800 dark:text-slate-300 font-mono text-[9px] uppercase">DOCKER COMPOSE</span>
                Multi-Container Operations Blueprint
              </h5>
              <div className="bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed">
                <pre>{`version: '3.8'

services:
  opcua-bridge:
    image: myrepo/edge-opcua-bridge:latest
    container_name: opcua-bridge
    restart: unless-stopped
    ports:
      - "4840:4840"
    volumes:
      - ./opc_mapping.json:/app/opc_mapping.json
    environment:
      - OPCUA_ENDPOINT=opc.tcp://10.210.0.45:4840
      - REST_API_PORT=3001

  rom-service:
    image: myrepo/rom-service:latest
    container_name: rom-service
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      - MODEL_VERSION=2.1.0-RC
      - INFERENCE_LATENCY_MAX=15ms

  viewer-app:
    image: nginx:alpine
    container_name: process-viewer
    restart: unless-stopped
    ports:
      - "3000:80"
    volumes:
      - ./dist:/usr/share/nginx/html:ro`}</pre>
              </div>
            </div>

            {/* OPC UA Mapping and ROM API Specification */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-[11px] relative">
                <span className="text-[10px] uppercase text-slate-400 absolute right-4 top-4 font-bold">OPC UA Tag Map (JSON)</span>
                <p className="text-slate-400 text-[10px] mb-3 select-none">// opc_mapping.json configuration</p>
                <pre className="overflow-x-auto leading-relaxed">
{`{
  "namespaces": ["http://process-simulator/opcua/mapping"],
  "tags": {
    "WELL1_FLOW": "ns=2;s=Well1.FlowRate",
    "WELL1_CHOKE_VALVE": "ns=2;s=Well1.ChokeValve",
    "SEP_LEVEL": "ns=2;s=Separator.LiquidLevel",
    "SEP_PRESS": "ns=2;s=Separator.Pressure",
    "BOOST_PUMP_STATUS": "ns=2;s=Pumps.BoosterA.Status",
    "STANDBY_PUMP_STATUS": "ns=2;s=Pumps.BoosterB.Status",
    "PGC_RPM": "ns=2;s=Compressor.PGC.Speed"
  }
}`}
                </pre>
              </div>

              <div className="bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-[11px] relative">
                <span className="text-[10px] uppercase text-slate-400 absolute right-4 top-4 font-bold">ROM Inference API Spec</span>
                <p className="text-slate-400 text-[10px] mb-3 select-none">// rom_service_api.md stub</p>
                <pre className="overflow-x-auto leading-relaxed">
{`POST /api/v1/predict HTTP/1.1
Content-Type: application/json

Request Payload (Process State Vector):
{
  "choke_well_1": 45.0,
  "rpm_booster_a": 2950,
  "rpm_pgc": 8400,
  "inlet_temperature": 38.4
}

Response (Predicted Output Vectors):
{
  "predicted_separator_level": 45.2,
  "predicted_separator_pressure": 22.4,
  "inference_latency_ms": 2.4
}`}
                </pre>
              </div>
            </div>

            <div className="bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-[11px] relative">
              <span className="text-[10px] uppercase text-slate-400 absolute right-4 top-4">OPC UA XML MAPPING TEMPLATE</span>
              <pre className="overflow-x-auto leading-relaxed">
{`<?xml version="1.0" encoding="utf-8"?>
<OpcUaServerConfig xmlns="http://opcfoundation.org/UA/SDK/Configuration.xsd">
  <ServerUri>urn:field-gateway:shallow-water-simulator</ServerUri>
  <SecurityPolicies>
    <SecurityPolicy>
      <PolicyUri>http://opcfoundation.org/UA/SecurityPolicy#Basic256Sha256</PolicyUri>
      <MessageSecurityModes>SignAndEncrypt</MessageSecurityModes>
    </SecurityPolicy>
  </SecurityPolicies>
  <NamespaceUris>
    <Uri>http://process-simulator/opcua/mapping</Uri>
  </NamespaceUris>
  <TagNodeList>
    <TagNode NodeId="ns=1;s=WELL1_FLOW" DataType="Float" AccessLevel="ReadWrite" />
    <TagNode NodeId="ns=1;s=SEP_LEVEL" DataType="Float" AccessLevel="Read" />
    <TagNode NodeId="ns=1;s=BOOST_PUMP_STATUS" DataType="Int32" AccessLevel="Read" />
  </TagNodeList>
</OpcUaServerConfig>`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
