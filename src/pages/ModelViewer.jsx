import React, { useState, Suspense, useEffect } from 'react';
import { ArrowLeft, AlertTriangle, Upload, CheckCircle, Trash2, Plus, Pencil, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html, Bounds, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { saveModelDB, deleteModelDB, getAllModelsDB, updateModelAnnotationsDB } from '../utils/db';
import toast from 'react-hot-toast';

// --- Static GLTF Model (for preset server files) ---
const StaticGltfModel = ({ url }) => {
  useGLTF.clear(url);
  const gltf = useGLTF(url, 'https://www.gstatic.com/draco/versioned/decoders/1.5.5/');
  return <primitive object={gltf.scene} />;
};

// --- Annotation Component ---
const Annotation = ({ position, text, onDelete }) => {
  return (
    <Html position={position} center distanceFactor={10} zIndexRange={[100, 0]}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none' }}>
        <div style={{ padding: '0.4rem 0.8rem', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(4px)', border: '1px solid var(--accent-primary)', borderRadius: '8px', color: 'white', fontSize: '0.85rem', fontWeight: 'bold', whiteSpace: 'nowrap', pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
          {text}
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center' }} title="ลบจุดอธิบาย">
            <X size={14} />
          </button>
        </div>
        <div style={{ width: '2px', height: '20px', background: 'var(--accent-primary)' }}></div>
        <div style={{ width: '8px', height: '8px', background: 'var(--accent-primary)', borderRadius: '50%', boxShadow: '0 0 8px var(--accent-primary)' }}></div>
      </div>
    </Html>
  );
};

// --- Dynamic Model using raw GLTFLoader (for uploaded blob URLs) ---
const DynamicGltfModel = ({ url, annotations = [], onAddAnnotation, onDeleteAnnotation }) => {
  const [scene, setScene] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setScene(null);
    setError(null);

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.5/');

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      url,
      (gltf) => {
        setScene(gltf.scene);
      },
      undefined,
      (err) => {
        console.error('GLTFLoader error:', err);
        setError(err);
      }
    );

    return () => {
      dracoLoader.dispose();
    };
  }, [url]);

  if (error) return <Html center><div style={{ color: '#ef4444', background: 'rgba(0,0,0,0.8)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}><AlertTriangle size={32} /><p style={{ margin: '0.5rem 0 0' }}>โหลดไฟล์ไม่ได้<br/><small>ตรวจสอบว่าเป็นไฟล์ .glb ที่สมบูรณ์</small></p></div></Html>;
  if (!scene) return <Html center><div style={{ color: 'white', background: 'rgba(0,0,0,0.7)', padding: '1rem 2rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#00F0FF', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /><style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>กำลังโหลดโมเดล...</div></Html>;

  const handleDoubleClick = (e) => {
    // Only intercept double clicks if onAddAnnotation is provided
    if (!onAddAnnotation) return;
    e.stopPropagation();
    const text = window.prompt('กรอกคำอธิบายสำหรับจุดนี้:');
    if (text && text.trim()) {
      const { x, y, z } = e.point;
      onAddAnnotation({ id: Date.now().toString(), text: text.trim(), position: [x, y, z] });
    }
  };

  return (
    <group>
      <Bounds fit clip observe margin={1.2}>
        <primitive object={scene} onDoubleClick={handleDoubleClick} />
      </Bounds>
      {annotations.map(ann => (
        <Annotation key={ann.id} position={ann.position} text={ann.text} onDelete={() => onDeleteAnnotation(ann.id)} />
      ))}
    </group>
  );
};

// --- Error Boundary ---
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidUpdate(prevProps) { if (this.props.resetKey !== prevProps.resetKey) this.setState({ hasError: false }); }
  render() {
    if (this.state.hasError) return <Html center><div style={{ color: '#ef4444', background: 'rgba(0,0,0,0.8)', padding: '1rem', borderRadius: '12px', textAlign: 'center', minWidth: '250px' }}><AlertTriangle size={32} /><p style={{ margin: '0.5rem 0 0', fontWeight: 'bold' }}>ไม่พบไฟล์โมเดล</p><p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem' }}>กรุณานำไฟล์ .glb ใส่ไว้ใน <code>public/models/</code></p></div></Html>;
    return this.props.children;
  }
}

// --- Static Model Scene (for preset models) ---
const StaticModelScene = ({ url }) => (
  <ErrorBoundary resetKey={url}>
    <Suspense fallback={<Html center><div style={{ color: 'white', background: 'rgba(0,0,0,0.7)', padding: '1rem 2rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#00F0FF', borderRadius: '50%', animation: 'spin2 1s linear infinite' }} /><style>{`@keyframes spin2 { 100% { transform: rotate(360deg); } }`}</style>กำลังโหลด...</div></Html>}>
      <Bounds fit clip observe margin={1.2}>
        <StaticGltfModel url={url} />
      </Bounds>
      <ContactShadows position={[0, -0.5, 0]} opacity={0.7} scale={10} blur={2.5} far={4} />
    </Suspense>
  </ErrorBoundary>
);

const ModelViewer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const modelParam = queryParams.get('model');

  const [activeModel, setActiveModel] = useState(null);
  const [uploadedModels, setUploadedModels] = useState([]);
  const [selectedUpload, setSelectedUpload] = useState(null);
  const [canvasKey, setCanvasKey] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  // Load persisted models from IndexedDB on mount
  useEffect(() => {
    getAllModelsDB().then(stored => {
      if (stored.length > 0) {
        const loaded = stored.map(m => ({
          id: m.id,
          name: m.name,
          url: URL.createObjectURL(new Blob([m.buffer], { type: 'model/gltf-binary' })),
          annotations: m.annotations || []
        }));
        setUploadedModels(loaded);
      }
    }).catch(console.error);

    return () => {
      // Cleanup blob URLs on unmount
      setUploadedModels(prev => {
        prev.forEach(m => URL.revokeObjectURL(m.url));
        return [];
      });
    };
  }, []);

  useEffect(() => {
    if (modelParam) {
      setSelectedUpload(null);
      setCanvasKey(k => k + 1);
    }
  }, [modelParam]);

  const handlePresetClick = (filename) => {
    setSelectedUpload(null);
    setActiveModel(filename);
    setCanvasKey(k => k + 1);
    navigate(`/learning/3d?model=${filename}`, { replace: true });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const buffer = await file.arrayBuffer();
      const id = Date.now().toString();
      await saveModelDB({ id, name: file.name, buffer });
      const url = URL.createObjectURL(new Blob([buffer], { type: 'model/gltf-binary' }));
      const newModel = { name: file.name, url, id };
      setUploadedModels(prev => [...prev, newModel]);
      setSelectedUpload(newModel.id);
      setCanvasKey(k => k + 1);
      toast.success(`บันทึก "${file.name}" เรียบร้อยแล้ว!`);
    } catch (err) {
      console.error(err);
      toast.error('เกิดข้อผิดพลาดในการบันทึกไฟล์');
    }
    e.target.value = '';
  };

  const handleSelectUpload = (model) => {
    setSelectedUpload(model.id);
    setCanvasKey(k => k + 1);
  };

  const handleDeleteUpload = async (id) => {
    try {
      await deleteModelDB(id);
      setUploadedModels(prev => {
        const model = prev.find(m => m.id === id);
        if (model) URL.revokeObjectURL(model.url);
        return prev.filter(m => m.id !== id);
      });
      if (selectedUpload === id) {
        setSelectedUpload(null);
        setCanvasKey(k => k + 1);
      }
      toast.success('ลบโมเดลแล้ว');
    } catch (err) {
      toast.error('ลบไม่สำเร็จ');
    }
  };

  const handleRename = async (id) => {
    const trimmed = editingName.trim();
    if (!trimmed) { setEditingId(null); return; }
    try {
      const stored = await getAllModelsDB();
      const existing = stored.find(m => m.id === id);
      if (existing) await saveModelDB({ ...existing, name: trimmed });
      setUploadedModels(prev => prev.map(m => m.id === id ? { ...m, name: trimmed } : m));
      toast.success('เปลี่ยนชื่อสำเร็จ');
    } catch {
      toast.error('เปลี่ยนชื่อไม่สำเร็จ');
    }
    setEditingId(null);
  };

  const handleAddAnnotation = async (newAnnotation) => {
    if (!selectedUpload) return;
    try {
      const stored = await getAllModelsDB();
      const existing = stored.find(m => m.id === selectedUpload);
      if (existing) {
        const updatedAnnotations = [...(existing.annotations || []), newAnnotation];
        await updateModelAnnotationsDB(selectedUpload, updatedAnnotations);
        setUploadedModels(prev => prev.map(m => m.id === selectedUpload ? { ...m, annotations: updatedAnnotations } : m));
        toast.success('เพิ่มจุดอธิบายแล้ว');
      }
    } catch {
      toast.error('บันทึกจุดอธิบายไม่สำเร็จ');
    }
  };

  const handleDeleteAnnotation = async (annotationId) => {
    if (!selectedUpload) return;
    try {
      const stored = await getAllModelsDB();
      const existing = stored.find(m => m.id === selectedUpload);
      if (existing) {
        const updatedAnnotations = (existing.annotations || []).filter(a => a.id !== annotationId);
        await updateModelAnnotationsDB(selectedUpload, updatedAnnotations);
        setUploadedModels(prev => prev.map(m => m.id === selectedUpload ? { ...m, annotations: updatedAnnotations } : m));
        toast.success('ลบจุดอธิบายแล้ว');
      }
    } catch {
      toast.error('ลบจุดอธิบายไม่สำเร็จ');
    }
  };

  const isUsingCustom = !!selectedUpload;
  const currentUpload = uploadedModels.find(m => m.id === selectedUpload);
  const presetUrl = activeModel ? `/models/${activeModel}` : null;

  return (
    <div className="animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', flexShrink: 0 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem' }}>
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-gradient" style={{ marginBottom: 0, fontSize: '2rem' }}>โมเดล 3 มิติเชิงโต้ตอบ</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Interactive 3D Equipment Viewer{currentUpload ? ` — ${currentUpload.name}` : ''}</p>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'flex-start', flex: 1, minHeight: 0 }}>
        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="equipment-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.1rem' }}>โมเดลของคุณ</h3>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'var(--accent-primary)', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 'bold' }}>
                <Plus size={14} /> เพิ่มไฟล์
                <input type="file" accept=".glb,.gltf" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '1rem' }}>รองรับไฟล์ .glb / .gltf • บันทึกถาวรในเครื่องคุณ</p>

            {uploadedModels.length === 0 ? (
              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-tertiary)', border: '2px dashed var(--border-color)', color: 'var(--text-tertiary)', padding: '2rem', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center' }}>
                <Upload size={28} />
                <span style={{ fontSize: '0.9rem' }}>คลิกเพื่อเพิ่มไฟล์ .glb</span>
                <input type="file" accept=".glb,.gltf" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {uploadedModels.map(model => (
                  <div key={model.id}>
                    {editingId === model.id ? (
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <input
                          autoFocus
                          value={editingName}
                          onChange={e => setEditingName(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleRename(model.id); if (e.key === 'Escape') setEditingId(null); }}
                          style={{ flex: 1, padding: '0.55rem 0.75rem', borderRadius: '8px', fontSize: '0.85rem' }}
                        />
                        <button onClick={() => handleRename(model.id)} style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid #10b981', color: '#10b981', padding: '0.55rem 0.6rem', borderRadius: '8px', cursor: 'pointer', display: 'flex' }}><CheckCircle size={14} /></button>
                        <button onClick={() => setEditingId(null)} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '0.55rem 0.6rem', borderRadius: '8px', cursor: 'pointer', display: 'flex' }}><X size={14} /></button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <button
                          onClick={() => handleSelectUpload(model)}
                          style={{ flex: 1, background: selectedUpload === model.id ? 'rgba(0,240,255,0.1)' : 'var(--bg-tertiary)', border: `1px solid ${selectedUpload === model.id ? 'var(--accent-ac)' : 'var(--border-color)'}`, padding: '0.6rem 0.75rem', borderRadius: '8px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', textAlign: 'left', overflow: 'hidden', transition: 'all 0.2s' }}
                        >
                          {selectedUpload === model.id && <CheckCircle size={14} color="var(--accent-ac)" style={{ flexShrink: 0 }} />}
                          <span style={{ fontSize: '0.83rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{model.name}</span>
                        </button>
                        <button
                          onClick={() => { setEditingId(model.id); setEditingName(model.name); }}
                          title="เปลี่ยนชื่อ"
                          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '0.6rem', borderRadius: '8px', cursor: 'pointer', flexShrink: 0, display: 'flex' }}
                        ><Pencil size={13} /></button>
                        <button
                          onClick={() => handleDeleteUpload(model.id)}
                          title="ลบ"
                          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', padding: '0.6rem', borderRadius: '8px', cursor: 'pointer', flexShrink: 0, display: 'flex' }}
                        ><Trash2 size={13} /></button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="equipment-card" style={{ padding: '1.5rem', border: '1px solid var(--border-color)', marginTop: '1.5rem' }}>
                <h4 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>จุดอธิบาย (Hotspots)</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, lineHeight: '1.6' }}>
                  <strong>ดับเบิลคลิก</strong> ที่ส่วนใดก็ได้ของโมเดลเพื่อเพิ่มจุดอธิบาย พิกัดและข้อความจะถูกบันทึกไว้ในฐานข้อมูล
                </p>
              </div>
            </>
          )}
        </div>

          <div className="equipment-card" style={{ padding: '1.5rem', border: '1px solid var(--border-color)' }}>
            <h4 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>การควบคุมกล้อง</h4>
            <ul style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, paddingLeft: '1.5rem', lineHeight: '2' }}>
              <li><strong>คลิกซ้ายค้าง:</strong> หมุนมุมมอง</li>
              <li><strong>คลิกขวาค้าง:</strong> เลื่อนกล้อง (Pan)</li>
              <li><strong>ลูกกลิ้งเมาส์:</strong> ซูมเข้า-ออก</li>
            </ul>
          </div>
        </div>

        {/* 3D Viewport */}
        <div className="equipment-card" style={{ padding: 0, height: '600px', overflow: 'hidden', position: 'relative', border: '1px solid var(--border-color)' }}>
          <Canvas key={canvasKey} shadows camera={{ position: [2, 2, 2], fov: 50 }}>
            <color attach="background" args={['#1e293b']} />
            <Environment preset="city" />
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />

            {isUsingCustom && currentUpload
              ? <DynamicGltfModel url={currentUpload.url} annotations={currentUpload.annotations} onAddAnnotation={handleAddAnnotation} onDeleteAnnotation={handleDeleteAnnotation} />
              : <Html center><div style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '1rem' }}><Upload size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} /><br/><span style={{ fontSize: '0.9rem', opacity: 0.6 }}>เพิ่มไฟล์ .glb ในปุ่มด้านซ้าย</span></div></Html>
            }

            <OrbitControls makeDefault />
          </Canvas>

          <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.5)', padding: '0.4rem 0.8rem', borderRadius: '20px', color: 'white', fontSize: '0.75rem', backdropFilter: 'blur(4px)' }}>
            React Three Fiber · GLTF
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelViewer;
