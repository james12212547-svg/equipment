import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Radio, Server, Activity, Zap, ThermometerSnowflake, Sun, Wind, 
  AlertTriangle, RefreshCcw, Database, ShieldAlert, Cpu, Terminal, Play, Pause, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const protocols = [
  { id: 'modbus_rtu', name: 'Modbus RTU (RS-485)', desc: '9600 Baud, 8N1, Slave ID: 1', color: '#0080FF' },
  { id: 'modbus_tcp', name: 'Modbus TCP/IP', desc: 'Host: 192.168.1.100:502', color: '#10B981' },
  { id: 'bacnet', name: 'BACnet / IP', desc: 'Device ID: 1001 (Port 47808)', color: '#9333EA' },
  { id: 'mqtt', name: 'MQTT Broker', desc: 'Topic: telemetry/building/sensors', color: '#F59E0B' }
];

const deviceFleets = {
  power_meter: {
    name: 'Digital Power Meter (PM-5000)',
    icon: Zap,
    color: '#0080FF',
    unitName: 'ตู้จ่ายไฟหลัก MDB-01 ชั้น B1',
    registers: [
      { addr: '40001', name: 'Voltage L1-N', type: 'Float32', hex: '0x43660000', scale: '1.0', unit: 'V' },
      { addr: '40003', name: 'Current L1', type: 'Float32', hex: '0x416B3333', scale: '1.0', unit: 'A' },
      { addr: '40005', name: 'Active Power Total', type: 'Float32', hex: '0x42280000', scale: '1.0', unit: 'kW' },
      { addr: '40007', name: 'Frequency', type: 'Float32', hex: '0x42480000', scale: '1.0', unit: 'Hz' },
      { addr: '40009', name: 'Power Factor', type: 'Float32', hex: '0x3F733333', scale: '1.0', unit: 'PF' }
    ]
  },
  chiller_plant: {
    name: 'Chiller Plant Gateway (CP-MODBUS-01)',
    icon: ThermometerSnowflake,
    color: '#10B981',
    unitName: 'ห้องเครื่องทำน้ำเย็น Chiller Room',
    registers: [
      { addr: '40101', name: 'Chilled Water Supply (T_chws)', type: 'Int16', hex: '0x0044', scale: '0.1', unit: '°C' },
      { addr: '40102', name: 'Chilled Water Return (T_chwr)', type: 'Int16', hex: '0x007C', scale: '0.1', unit: '°C' },
      { addr: '40103', name: 'Water Flow Rate', type: 'Int16', hex: '0x01CC', scale: '1.0', unit: 'GPM' },
      { addr: '40104', name: 'Chiller Motor Load', type: 'Int16', hex: '0x0052', scale: '1.0', unit: '%' }
    ]
  },
  solar_gateway: {
    name: 'Solar Inverter Gateway (SUN2000)',
    icon: Sun,
    color: '#F59E0B',
    unitName: 'ระบบโซลาร์เซลล์หลังคา Rooftop 10kW',
    registers: [
      { addr: '30001', name: 'Inverter Operating Status', type: 'Uint16', hex: '0x0001', scale: '1.0', unit: 'Status' },
      { addr: '30002', name: 'DC Input String Voltage', type: 'Uint16', hex: '0x1ECC', scale: '0.1', unit: 'VDC' },
      { addr: '30003', name: 'AC Active Power Output', type: 'Uint32', hex: '0x00002580', scale: '1.0', unit: 'W' },
      { addr: '30005', name: 'Daily Energy Yield', type: 'Uint32', hex: '0x0000A600', scale: '0.01', unit: 'kWh' }
    ]
  },
  ahu_iaq: {
    name: 'AHU & Indoor Air Quality (IAQ-100)',
    icon: Wind,
    color: '#9333EA',
    unitName: 'เครื่องจ่ายลมเย็น AHU-02 ชั้น 3',
    registers: [
      { addr: '40201', name: 'Room Temperature', type: 'Int16', hex: '0x00F4', scale: '0.1', unit: '°C' },
      { addr: '40202', name: 'Relative Humidity', type: 'Int16', hex: '0x0208', scale: '0.1', unit: '%' },
      { addr: '40203', name: 'CO2 Concentration', type: 'Uint16', hex: '0x0310', scale: '1.0', unit: 'PPM' },
      { addr: '40204', name: 'Duct Static Pressure', type: 'Uint16', hex: '0x00F0', scale: '1.0', unit: 'Pa' }
    ]
  }
};

const TelemetrySimulator = () => {
  const navigate = useNavigate();
  const [selectedProtocol, setSelectedProtocol] = useState('modbus_rtu');
  const [selectedDevice, setSelectedDevice] = useState('power_meter');
  const [isStreaming, setIsStreaming] = useState(true);
  const [streamIntervalMs, setStreamIntervalMs] = useState(1500);
  const [activeFault, setActiveFault] = useState(null);

  // Live Dynamic State
  const [liveValues, setLiveValues] = useState({
    voltL1: 230.2,
    currentA1: 14.5,
    powerKw: 42.0,
    frequency: 50.01,
    pf: 0.96,
    tchws: 6.8,
    tchwr: 12.4,
    flowGpm: 460,
    chillerLoad: 82,
    dcVolt: 492.5,
    acPowerW: 9650,
    dailyKwh: 42.8,
    roomTemp: 24.2,
    roomHumidity: 52.5,
    co2Ppm: 720,
    ductPressure: 240
  });

  const [consoleLogs, setConsoleLogs] = useState([
    `[SYS_INIT]: Telemetry Gateway Service Started.`,
    `[MODBUS]: Connection established on Port RS-485 (9600 Baud 8N1).`
  ]);

  const addLog = (msg) => {
    setConsoleLogs(prev => [...prev.slice(-15), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  // Telemetry Live Stream Loop
  useEffect(() => {
    if (!isStreaming) return;

    const timer = setInterval(() => {
      setLiveValues(prev => {
        // Random slight jitter to mimic real sensors
        const jitter = (range) => (Math.random() - 0.5) * range;
        
        let newVolt = prev.voltL1 + jitter(0.4);
        let newTchws = prev.tchws + jitter(0.1);
        let newCo2 = prev.co2Ppm + Math.floor(jitter(10));

        // Apply Fault Overrides if active
        if (activeFault === 'overvoltage') {
          newVolt = 254.8 + jitter(0.6);
        } else if (activeFault === 'chiller_high') {
          newTchws = 12.8 + jitter(0.2);
        } else if (activeFault === 'high_co2') {
          newCo2 = 1620 + Math.floor(jitter(20));
        }

        return {
          ...prev,
          voltL1: Number(newVolt.toFixed(1)),
          currentA1: Number((prev.currentA1 + jitter(0.2)).toFixed(1)),
          powerKw: Number((prev.powerKw + jitter(0.3)).toFixed(1)),
          frequency: Number((50.0 + jitter(0.04)).toFixed(2)),
          tchws: Number(newTchws.toFixed(1)),
          tchwr: Number((newTchws + 5.6).toFixed(1)),
          flowGpm: Math.round(prev.flowGpm + jitter(4)),
          acPowerW: Math.round(prev.acPowerW + jitter(40)),
          dailyKwh: Number((prev.dailyKwh + 0.01).toFixed(2)),
          roomTemp: Number((prev.roomTemp + jitter(0.05)).toFixed(1)),
          co2Ppm: Math.round(newCo2)
        };
      });

      // Add polling packet log
      const proto = protocols.find(p => p.id === selectedProtocol)?.name || 'MODBUS';
      addLog(`[POLL_TX]: Requesting ${selectedDevice.toUpperCase()} registers via ${proto}... RX OK (CRC16 Passed)`);

    }, streamIntervalMs);

    return () => clearInterval(timer);
  }, [isStreaming, streamIntervalMs, selectedProtocol, selectedDevice, activeFault]);

  const triggerFault = (faultType) => {
    if (activeFault === faultType) {
      setActiveFault(null);
      addLog(`[FAULT_CLEAR]: Anomaly ${faultType} resolved. Restoring normal telemetry baseline.`);
    } else {
      setActiveFault(faultType);
      addLog(`[CRITICAL_ALARM]: Injected Anomaly Event [${faultType.toUpperCase()}]! Alarm Relay Triggered.`);
    }
  };

  const currentDeviceObj = deviceFleets[selectedDevice];
  const DeviceIcon = currentDeviceObj.icon;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem' }}>
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-gradient-ac" style={{ marginBottom: '0.2rem', fontSize: '2rem' }}>จำลองข้อมูลเซนเซอร์และโพรโทคอลเรียลไทม์</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Real-Time IoT & Modbus Telemetry Simulator</p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Top Protocol Switcher */}
        <div style={{ background: 'var(--bg-secondary)', padding: '1.2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Radio size={18} color="var(--accent-ac)" /> เลือกโพรโทคอลการสื่อสาร (Industrial Protocol Selection):
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.8rem' }}>
            {protocols.map(p => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedProtocol(p.id);
                  addLog(`[PROTOCOL_SWITCH]: Switched to ${p.name}`);
                }}
                style={{
                  background: selectedProtocol === p.id ? p.color : 'var(--bg-primary)',
                  color: selectedProtocol === p.id ? 'white' : 'var(--text-primary)',
                  border: `1px solid ${selectedProtocol === p.id ? p.color : 'var(--border-color)'}`,
                  padding: '0.8rem 1rem',
                  borderRadius: '8px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{p.name}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.2rem' }}>{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Streaming Controls Bar */}
        <div style={{ background: 'var(--bg-secondary)', padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setIsStreaming(!isStreaming)}
              style={{
                background: isStreaming ? '#EF4444' : '#10B981',
                color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem'
              }}
            >
              {isStreaming ? <Pause size={18} /> : <Play size={18} />}
              {isStreaming ? 'หยุดการสตรีมข้อมูล' : 'เริ่มสตรีมข้อมูลสด'}
            </button>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              สถานะ: <strong style={{ color: isStreaming ? '#10B981' : '#EF4444' }}>{isStreaming ? '🟢 LIVE STREAMING' : '🔴 PAUSED'}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>ความถี่ส่งข้อมูล:</span>
            {[1000, 1500, 3000].map(ms => (
              <button
                key={ms}
                onClick={() => setStreamIntervalMs(ms)}
                style={{
                  background: streamIntervalMs === ms ? 'var(--accent-primary)' : 'var(--bg-primary)',
                  color: streamIntervalMs === ms ? 'white' : 'var(--text-secondary)',
                  border: '1px solid var(--border-color)', padding: '0.3rem 0.7rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem'
                }}
              >
                {ms / 1000}s
              </button>
            ))}
          </div>
        </div>

        {/* Device Fleet Tabs */}
        <div style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', paddingBottom: '0.4rem' }}>
          {Object.keys(deviceFleets).map(key => {
            const dev = deviceFleets[key];
            const IconComp = dev.icon;
            const isSelected = selectedDevice === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedDevice(key)}
                style={{
                  background: isSelected ? dev.color : 'var(--bg-secondary)',
                  color: isSelected ? 'white' : 'var(--text-secondary)',
                  border: `1px solid ${isSelected ? dev.color : 'var(--border-color)'}`,
                  padding: '0.7rem 1.2rem',
                  borderRadius: '50px',
                  fontWeight: isSelected ? 'bold' : 'normal',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s'
                }}
              >
                <IconComp size={18} /> {dev.name}
              </button>
            );
          })}
        </div>

        {/* Live Device Dashboard Display */}
        <div style={{ background: 'var(--bg-secondary)', padding: '1.8rem', borderRadius: 'var(--radius-md)', border: `2px solid ${currentDeviceObj.color}` }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ background: currentDeviceObj.color, padding: '0.8rem', borderRadius: '50%', color: 'white' }}>
                <DeviceIcon size={28} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', margin: 0 }}>{currentDeviceObj.name}</h2>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>📍 {currentDeviceObj.unitName}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-primary)', padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
              <Activity size={16} color={currentDeviceObj.color} className="animate-pulse" />
              <span>Polling Rate: <strong>{streamIntervalMs} ms</strong></span>
            </div>
          </div>

          {/* Live Values Gauges Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            
            {selectedDevice === 'power_meter' && (
              <>
                <div style={{ background: 'var(--bg-primary)', padding: '1.2rem', borderRadius: '8px', borderLeft: `4px solid ${liveValues.voltL1 > 250 ? '#EF4444' : '#0080FF'}` }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>แรงดันไฟฟ้า Volt L1-N</span>
                  <h3 style={{ margin: '0.3rem 0 0 0', fontSize: '1.8rem', color: liveValues.voltL1 > 250 ? '#EF4444' : 'var(--text-primary)' }}>
                    {liveValues.voltL1} <span style={{ fontSize: '1rem' }}>V</span>
                  </h3>
                </div>
                <div style={{ background: 'var(--bg-primary)', padding: '1.2rem', borderRadius: '8px', borderLeft: '4px solid #10B981' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>กระแสไฟฟ้า Current A1</span>
                  <h3 style={{ margin: '0.3rem 0 0 0', fontSize: '1.8rem', color: 'var(--text-primary)' }}>
                    {liveValues.currentA1} <span style={{ fontSize: '1rem' }}>A</span>
                  </h3>
                </div>
                <div style={{ background: 'var(--bg-primary)', padding: '1.2rem', borderRadius: '8px', borderLeft: '4px solid #F59E0B' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>กำลังไฟฟ้า Active Power</span>
                  <h3 style={{ margin: '0.3rem 0 0 0', fontSize: '1.8rem', color: 'var(--text-primary)' }}>
                    {liveValues.powerKw} <span style={{ fontSize: '1rem' }}>kW</span>
                  </h3>
                </div>
                <div style={{ background: 'var(--bg-primary)', padding: '1.2rem', borderRadius: '8px', borderLeft: '4px solid #9333EA' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>ความถี่ Frequency</span>
                  <h3 style={{ margin: '0.3rem 0 0 0', fontSize: '1.8rem', color: 'var(--text-primary)' }}>
                    {liveValues.frequency} <span style={{ fontSize: '1rem' }}>Hz</span>
                  </h3>
                </div>
              </>
            )}

            {selectedDevice === 'chiller_plant' && (
              <>
                <div style={{ background: 'var(--bg-primary)', padding: '1.2rem', borderRadius: '8px', borderLeft: `4px solid ${liveValues.tchws > 10 ? '#EF4444' : '#10B981'}` }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>น้ำเย็นจ่าย (T_chws)</span>
                  <h3 style={{ margin: '0.3rem 0 0 0', fontSize: '1.8rem', color: liveValues.tchws > 10 ? '#EF4444' : 'var(--text-primary)' }}>
                    {liveValues.tchws} <span style={{ fontSize: '1rem' }}>°C</span>
                  </h3>
                </div>
                <div style={{ background: 'var(--bg-primary)', padding: '1.2rem', borderRadius: '8px', borderLeft: '4px solid #0080FF' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>น้ำเย็นกลับ (T_chwr)</span>
                  <h3 style={{ margin: '0.3rem 0 0 0', fontSize: '1.8rem', color: 'var(--text-primary)' }}>
                    {liveValues.tchwr} <span style={{ fontSize: '1rem' }}>°C</span>
                  </h3>
                </div>
                <div style={{ background: 'var(--bg-primary)', padding: '1.2rem', borderRadius: '8px', borderLeft: '4px solid #F59E0B' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>อัตราการไหล Water Flow</span>
                  <h3 style={{ margin: '0.3rem 0 0 0', fontSize: '1.8rem', color: 'var(--text-primary)' }}>
                    {liveValues.flowGpm} <span style={{ fontSize: '1rem' }}>GPM</span>
                  </h3>
                </div>
              </>
            )}

            {selectedDevice === 'solar_gateway' && (
              <>
                <div style={{ background: 'var(--bg-primary)', padding: '1.2rem', borderRadius: '8px', borderLeft: '4px solid #F59E0B' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>แรงดัน DC String</span>
                  <h3 style={{ margin: '0.3rem 0 0 0', fontSize: '1.8rem', color: 'var(--text-primary)' }}>
                    {liveValues.dcVolt} <span style={{ fontSize: '1rem' }}>VDC</span>
                  </h3>
                </div>
                <div style={{ background: 'var(--bg-primary)', padding: '1.2rem', borderRadius: '8px', borderLeft: '4px solid #10B981' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>กำลังผลิต AC Output</span>
                  <h3 style={{ margin: '0.3rem 0 0 0', fontSize: '1.8rem', color: 'var(--text-primary)' }}>
                    {liveValues.acPowerW} <span style={{ fontSize: '1rem' }}>W</span>
                  </h3>
                </div>
                <div style={{ background: 'var(--bg-primary)', padding: '1.2rem', borderRadius: '8px', borderLeft: '4px solid #0080FF' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>พลังงานสะสมวันนี่</span>
                  <h3 style={{ margin: '0.3rem 0 0 0', fontSize: '1.8rem', color: 'var(--text-primary)' }}>
                    {liveValues.dailyKwh} <span style={{ fontSize: '1rem' }}>kWh</span>
                  </h3>
                </div>
              </>
            )}

            {selectedDevice === 'ahu_iaq' && (
              <>
                <div style={{ background: 'var(--bg-primary)', padding: '1.2rem', borderRadius: '8px', borderLeft: '4px solid #0080FF' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>อุณหภูมิห้อง Room Temp</span>
                  <h3 style={{ margin: '0.3rem 0 0 0', fontSize: '1.8rem', color: 'var(--text-primary)' }}>
                    {liveValues.roomTemp} <span style={{ fontSize: '1rem' }}>°C</span>
                  </h3>
                </div>
                <div style={{ background: 'var(--bg-primary)', padding: '1.2rem', borderRadius: '8px', borderLeft: `4px solid ${liveValues.co2Ppm > 1000 ? '#EF4444' : '#9333EA'}` }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>ก๊าซคาร์บอนไดออกไซด์ CO2</span>
                  <h3 style={{ margin: '0.3rem 0 0 0', fontSize: '1.8rem', color: liveValues.co2Ppm > 1000 ? '#EF4444' : 'var(--text-primary)' }}>
                    {liveValues.co2Ppm} <span style={{ fontSize: '1rem' }}>PPM</span>
                  </h3>
                </div>
              </>
            )}

          </div>

          {/* Fault Generator Controls */}
          <div style={{ background: 'var(--bg-primary)', padding: '1.2rem', borderRadius: '8px', border: '1px dashed var(--border-color)', marginBottom: '1.5rem' }}>
            <h4 style={{ margin: '0 0 0.8rem 0', fontSize: '0.95rem', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertTriangle size={18} /> จำลองเหตุการณ์ผิดปกติฉุกเฉิน (Fault & Anomaly Generator):
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
              <button
                onClick={() => triggerFault('overvoltage')}
                style={{
                  background: activeFault === 'overvoltage' ? '#EF4444' : 'var(--bg-tertiary)',
                  color: activeFault === 'overvoltage' ? 'white' : 'var(--text-primary)',
                  border: '1px solid var(--border-color)', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold'
                }}
              >
                ⚡ จำลองแรงดันเกิน Overvoltage (254V)
              </button>

              <button
                onClick={() => triggerFault('chiller_high')}
                style={{
                  background: activeFault === 'chiller_high' ? '#EF4444' : 'var(--bg-tertiary)',
                  color: activeFault === 'chiller_high' ? 'white' : 'var(--text-primary)',
                  border: '1px solid var(--border-color)', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold'
                }}
              >
                🧊 จำลองน้ำเย็นไม่ลง Chiller High T_chws (12.8°C)
              </button>

              <button
                onClick={() => triggerFault('high_co2')}
                style={{
                  background: activeFault === 'high_co2' ? '#EF4444' : 'var(--bg-tertiary)',
                  color: activeFault === 'high_co2' ? 'white' : 'var(--text-primary)',
                  border: '1px solid var(--border-color)', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold'
                }}
              >
                🌬️ จำลองอากาศอับ CO2 สูง (1620 PPM)
              </button>
            </div>
          </div>

          {/* Modbus Register Mapping Table Viewer */}
          <div>
            <h4 style={{ margin: '0 0 0.8rem 0', fontSize: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Database size={18} color={currentDeviceObj.color} /> ตารางผังตำแหน่ง Modbus Register Map (Address Viewer)
            </h4>
            
            <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '0.8rem' }}>Register Addr</th>
                    <th style={{ padding: '0.8rem' }}>Parameter Name</th>
                    <th style={{ padding: '0.8rem' }}>Data Type</th>
                    <th style={{ padding: '0.8rem' }}>Raw Hex</th>
                    <th style={{ padding: '0.8rem' }}>Scale</th>
                    <th style={{ padding: '0.8rem' }}>Scaled Value</th>
                  </tr>
                </thead>
                <tbody>
                  {currentDeviceObj.registers.map((reg, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                      <td style={{ padding: '0.8rem', fontFamily: 'monospace', color: currentDeviceObj.color, fontWeight: 'bold' }}>{reg.addr}</td>
                      <td style={{ padding: '0.8rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>{reg.name}</td>
                      <td style={{ padding: '0.8rem', color: 'var(--text-tertiary)' }}>{reg.type}</td>
                      <td style={{ padding: '0.8rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{reg.hex}</td>
                      <td style={{ padding: '0.8rem', color: 'var(--text-tertiary)' }}>{reg.scale}</td>
                      <td style={{ padding: '0.8rem', color: '#10B981', fontWeight: 'bold' }}>
                        {reg.name.includes('Voltage') ? liveValues.voltL1 : reg.name.includes('Current') ? liveValues.currentA1 : reg.name.includes('Supply') ? liveValues.tchws : reg.name.includes('CO2') ? liveValues.co2Ppm : 'OK'} {reg.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Live Terminal Log Viewer */}
        <div style={{ background: '#0F172A', color: '#38BDF8', padding: '1.2rem', borderRadius: 'var(--radius-md)', border: '1px solid #1E293B', fontFamily: 'monospace', fontSize: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94A3B8', borderBottom: '1px solid #1E293B', paddingBottom: '0.6rem', marginBottom: '0.8rem' }}>
            <Terminal size={16} /> TELEMETRY PACKET CONSOLE (RAW DATA STREAM)
          </div>
          <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {consoleLogs.map((log, i) => (
              <div key={i} style={{ color: log.includes('CRITICAL') ? '#EF4444' : log.includes('FAULT') ? '#F59E0B' : '#38BDF8' }}>
                {log}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TelemetrySimulator;
