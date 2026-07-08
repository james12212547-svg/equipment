import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Zap, Info, Settings, AlertTriangle, Upload, Image as ImageIcon, Download, FileText, ChevronRight, Home, Heart, Box } from 'lucide-react';
import toast from 'react-hot-toast';
import { equipmentData, categories } from '../data/equipment';
import { saveImage, loadImage } from '../utils/db';
import { compressImage } from '../utils/imageUtils';
import useStore from '../store/useStore';
import AddEquipmentModal from '../components/AddEquipmentModal';
import { Pencil } from 'lucide-react';

const EquipmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [localImage, setLocalImage] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);
  
  const favorites = useStore(state => state.favorites);
  const toggleFavorite = useStore(state => state.toggleFavorite);
  const customEquipmentList = useStore(state => state.customEquipment);
  const deleteCustomEquipment = useStore(state => state.deleteCustomEquipment);
  const addCustomEquipment = useStore(state => state.addCustomEquipment);
  const isFav = favorites.includes(id);
  const [showEditModal, setShowEditModal] = useState(false);

  // Merge so that customEquipment overwrites equipmentData
  const customIds = new Set(customEquipmentList.map(eq => eq.id));
  const filteredStatic = equipmentData.filter(eq => !customIds.has(eq.id));
  const allEquipment = [...filteredStatic, ...customEquipmentList];
  
  const equipment = allEquipment.find(eq => eq.id === id);

  useEffect(() => {
    if (id) {
      loadImage(id).then(savedImg => {
        if (savedImg) {
          setLocalImage(savedImg);
        } else {
          setLocalImage(null);
        }
      }).catch(err => console.error('Error loading image', err));
    }
  }, [id]);

  if (!equipment) return <div>ไม่พบข้อมูลอุปกรณ์</div>;

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file);
        await saveImage(id, compressedBase64);
        setLocalImage(compressedBase64);
        toast.success('อัปโหลดรูปภาพสำเร็จ!');
      } catch (error) {
        console.error('Error saving image to IndexedDB:', error);
        toast.error('เกิดข้อผิดพลาดในการบันทึกรูปภาพครับ พื้นที่อาจจะเต็มจริงๆ');
      }
    }
    // รีเซ็ตค่า input เพื่อให้สามารถเลือกไฟล์เดิมซ้ำได้ (แก้ปัญหาเปลี่ยนรูปเดิมแล้วเงียบ)
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const displayImage = localImage || equipment.image;

  const tagClass = equipment.category === 'air-conditioning' ? 'tag-ac' : 'tag-solar';

  const handleDownloadDatasheet = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 500);
  };

  const categoryObj = categories.find(c => c.id === equipment.category);
  const categoryName = categoryObj ? categoryObj.name : '';

  const handleDelete = () => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบข้อมูลอุปกรณ์นี้?')) {
      deleteCustomEquipment(id);
      toast.success('ลบข้อมูลอุปกรณ์เรียบร้อยแล้ว');
      navigate(-1);
    }
  };

  return (
    <>
    {/* --- Normal Screen View --- */}
    <div className="animate-fade-in no-print" style={{ paddingBottom: '2rem' }}>
      
      {/* Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-tertiary)', fontSize: '0.9rem', flexWrap: 'wrap' }}>
        <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Home size={16} /> หน้าแรก
        </Link>
        <ChevronRight size={16} />
        <Link to={`/category/${equipment.category}`} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
          {categoryName}
        </Link>
        <ChevronRight size={16} />
        <span style={{ color: 'var(--text-primary)' }}>{equipment.name}</span>
      </div>

      <button 
        onClick={() => navigate(-1)} 
        style={{ 
          background: 'var(--glass-bg)', 
          backdropFilter: 'blur(10px)',
          border: '1px solid var(--border-color)', 
          color: 'var(--text-primary)', 
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '0.75rem', 
          borderRadius: '50%',
          position: 'absolute',
          top: '2rem',
          left: '2rem',
          zIndex: 10
        }}
      >
        <ArrowLeft size={24} />
      </button>

      <div style={{ 
        width: '100%', 
        height: '40vh', 
        minHeight: '300px',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        position: 'relative',
        marginBottom: '2rem',
        marginTop: '3.5rem', // Added margin to clear breadcrumbs
        background: 'var(--bg-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-tertiary)'
      }}>
        {displayImage ? (
          <img 
            src={displayImage} 
            alt={equipment.name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <ImageIcon size={48} opacity={0.5} />
            <span style={{ fontSize: '1.2rem' }}>ยังไม่มีรูปภาพ</span>
          </div>
        )}

        <button 
          onClick={triggerFileInput}
          style={{
            position: 'absolute',
            bottom: '2rem',
            right: '2rem',
            background: 'var(--accent-primary)',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 10,
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Upload size={18} />
          {displayImage ? 'เปลี่ยนรูปภาพ' : 'อัปโหลดรูปภาพ'}
        </button>
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          style={{ display: 'none' }}
        />

        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, width: '100%', height: '50%',
          background: 'linear-gradient(to top, var(--bg-primary) 0%, transparent 100%)',
          pointerEvents: 'none'
        }}></div>
      </div>

      <div style={{ position: 'relative', zIndex: 2, marginTop: '-4rem', padding: '0 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <span className={`tag ${tagClass}`} style={{ margin: 0 }}>{equipment.abbreviation}</span>
          <span style={{ fontSize: '1.5rem', background: 'var(--bg-secondary)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            {equipment.symbol}
          </span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>{equipment.name}</h1>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '1.1rem', marginBottom: '2rem' }}>{equipment.nameEng}</p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
            <button 
              onClick={() => {
                toggleFavorite(id);
                toast.success(isFav ? 'ลบออกจากรายการโปรด' : 'เพิ่มลงในรายการโปรดแล้ว');
              }} 
              style={{ 
                background: isFav ? 'rgba(239, 68, 68, 0.1)' : 'transparent', 
                color: isFav ? '#ef4444' : 'var(--text-secondary)', 
                border: isFav ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border-color)', 
                padding: '0.6rem 1.25rem', 
                borderRadius: '2rem', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.4rem', 
                fontWeight: '500',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease'
              }}
            >
              <Heart size={18} fill={isFav ? '#ef4444' : 'none'} color={isFav ? '#ef4444' : 'currentColor'} /> {isFav ? 'เลิกถูกใจ' : 'ถูกใจ'}
            </button>
            <button 
              onClick={handleDownloadDatasheet} 
              style={{ 
                background: 'rgba(16, 185, 129, 0.1)', 
                color: '#10b981', 
                border: '1px solid rgba(16, 185, 129, 0.3)', 
                padding: '0.6rem 1.25rem', 
                borderRadius: '2rem', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.4rem', 
                fontWeight: '500',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease' 
              }}
            >
              <Download size={18} /> โหลด Datasheet
            </button>
            <button 
              onClick={() => {
                const modelFile = equipment.category === 'air-conditioning' ? 'ac_compressor.glb' : 'solar_panel.glb';
                navigate(`/learning/3d?model=${modelFile}`);
              }} 
              style={{ 
                background: 'rgba(0, 240, 255, 0.1)', 
                color: 'var(--accent-ac)', 
                border: '1px solid rgba(0, 240, 255, 0.3)', 
                padding: '0.6rem 1.25rem', 
                borderRadius: '2rem', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.4rem', 
                fontWeight: '500',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease' 
              }}
            >
              <Box size={18} /> ดู 3D Model
            </button>
            <button 
              onClick={() => setShowEditModal(true)}
              style={{ 
                background: 'transparent', 
                color: 'var(--text-primary)', 
                border: '1px solid var(--border-color)', 
                padding: '0.6rem 1.25rem', 
                borderRadius: '2rem', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.4rem', 
                fontWeight: '500',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease' 
              }}
            >
              <Pencil size={18} /> แก้ไขข้อมูล
            </button>
            {equipment.isCustom && (
              <button 
                onClick={handleDelete}
                style={{ 
                  background: 'transparent', 
                  color: '#ef4444', 
                  border: '1px dashed rgba(239, 68, 68, 0.5)', 
                  padding: '0.6rem 1.25rem', 
                  borderRadius: '2rem', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.4rem', 
                  fontWeight: '500',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease' 
                }}
              >
                ลบข้อมูล
              </button>
            )}
          </div>
        </div>

        <div className="grid-2">
          {/* Function & Principle */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)' }}>
              <Info size={20} /> หน้าที่และการทำงาน
            </h3>
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>เอาไว้ใช้ทำอะไร?</h4>
              <p>{equipment.function}</p>
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>หลักการทำงานเบื้องต้น</h4>
              <p>{equipment.principle}</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Specs */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-secondary)' }}>
                <Settings size={20} /> สเปคทางเทคนิค
              </h3>
              <ul style={{ listStyle: 'none' }}>
                {equipment.specs.map((spec, index) => (
                  <li key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    padding: '0.75rem 0',
                    borderBottom: index !== equipment.specs.length - 1 ? '1px solid var(--border-color)' : 'none'
                  }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{spec.label}</span>
                    <span style={{ fontWeight: '500' }}>{spec.value}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Warnings */}
            <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #ef4444' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', marginBottom: '0.5rem' }}>
                <AlertTriangle size={18} /> ข้อควรระวัง
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
                {equipment.warnings}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    {showEditModal && (
      <AddEquipmentModal 
        categoryId={equipment.category}
        initialData={equipment}
        onClose={() => setShowEditModal(false)}
        onSave={(data) => {
          addCustomEquipment(data);
          setShowEditModal(false);
        }}
      />
    )}

    {/* --- Print View Section (Hidden normally, shown when printing) --- */}
    {isPrinting && (
      <div className="print-only" style={{ padding: '40px', background: 'white', color: 'black', minHeight: '100vh', fontFamily: 'sans-serif' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #3b82f6', paddingBottom: '20px', marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ background: '#3b82f6', color: 'white', padding: '12px', borderRadius: '8px' }}>
              <FileText size={36} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '28px', color: '#1e293b' }}>TECHNICAL DATASHEET</h1>
              <p style={{ margin: '5px 0 0', color: '#64748b', fontSize: '14px', fontWeight: 'bold' }}>ENGINEERING LEARNING HUB</p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>Document Generated</p>
            <p style={{ margin: 0, fontWeight: 'bold' }}>{new Date().toLocaleDateString('th-TH')}</p>
          </div>
        </div>

        {/* Equipment Name */}
        <div style={{ marginBottom: '30px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', margin: '0 0 10px', color: '#0f172a' }}>{equipment.name}</h2>
          <p style={{ fontSize: '18px', margin: 0, color: '#475569' }}>{equipment.nameEng} ({equipment.abbreviation})</p>
        </div>

        {/* Layout: Image + Description */}
        <div style={{ display: 'flex', gap: '30px', marginBottom: '40px' }}>
          
          {/* Image */}
          <div style={{ flex: '0 0 40%' }}>
            {displayImage ? (
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={displayImage} alt={equipment.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              </div>
            ) : (
              <div style={{ border: '1px dashed #cbd5e1', borderRadius: '8px', height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', color: '#94a3b8' }}>
                ไม่มีรูปภาพประกอบ
              </div>
            )}
          </div>

          {/* Description */}
          <div style={{ flex: '1' }}>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#2563eb', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', marginBottom: '10px' }}>หน้าที่และการใช้งาน (Function)</h3>
              <p style={{ lineHeight: '1.6', color: '#334155', margin: 0 }}>{equipment.function}</p>
            </div>
            <div>
              <h3 style={{ color: '#2563eb', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', marginBottom: '10px' }}>หลักการทำงาน (Working Principle)</h3>
              <p style={{ lineHeight: '1.6', color: '#334155', margin: 0 }}>{equipment.principle}</p>
            </div>
          </div>
        </div>

        {/* Technical Specs Table */}
        {equipment.specs && equipment.specs.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ color: '#2563eb', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', marginBottom: '15px' }}>ข้อมูลจำเพาะทางเทคนิค (Technical Specifications)</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {equipment.specs.map((spec, index) => (
                  <tr key={index} style={{ background: index % 2 === 0 ? '#f8fafc' : 'white' }}>
                    <th style={{ width: '30%', padding: '12px 15px', border: '1px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>{spec.label}</th>
                    <td style={{ padding: '12px 15px', border: '1px solid #e2e8f0', color: '#0f172a', fontWeight: '500' }}>{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Warnings */}
        {equipment.warnings && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderLeft: '4px solid #ef4444', padding: '20px', borderRadius: '4px', marginBottom: '40px' }}>
            <h4 style={{ margin: '0 0 10px', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} /> ข้อควรระวังด้านความปลอดภัยและวิศวกรรม (Engineering Warnings)
            </h4>
            <p style={{ margin: 0, color: '#7f1d1d', lineHeight: '1.6' }}>{equipment.warnings}</p>
          </div>
        )}

        {/* Footer */}
        <div style={{ position: 'fixed', bottom: '40px', left: '40px', right: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
          <p style={{ margin: 0 }}>เอกสารข้อมูลจำเพาะทางเทคนิค - ผลิตโดย Engineering Learning Hub</p>
          <p style={{ margin: '5px 0 0' }}>ใช้สำหรับอ้างอิงภายในระบบเท่านั้น (For Internal Reference Only)</p>
        </div>
        
      </div>
    )}
    </>
  );
};

export default EquipmentDetail;
