import { useState, useRef } from 'react';
import { X, Upload, Plus, Trash2, Camera, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { compressImage } from '../utils/imageUtils';

const AddEquipmentModal = ({ categoryId, onClose, onSave, initialData = null }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    nameEng: initialData?.nameEng || '',
    abbreviation: initialData?.abbreviation || '',
    function: initialData?.function || '',
    principle: initialData?.principle || '',
    warnings: initialData?.warnings || '',
  });
  const [specs, setSpecs] = useState(initialData?.specs || []);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData?.image || '');
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSpec = () => {
    setSpecs(prev => [...prev, { label: '', value: '' }]);
  };

  const handleSpecChange = (index, field, value) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = value;
    setSpecs(newSpecs);
  };

  const handleRemoveSpec = (index) => {
    setSpecs(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageCapture = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file);
        setImagePreview(compressedBase64);
      } catch (error) {
        console.error("Compression error:", error);
        toast.error('ไม่สามารถประมวลผลรูปภาพได้');
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('กรุณากรอกชื่ออุปกรณ์');
      return;
    }

    const newId = initialData?.id || `custom-${Date.now()}`;
    const newEquipment = {
      ...initialData,
      id: newId,
      category: categoryId || initialData?.category,
      isCustom: true,
      ...formData,
      specs: specs.filter(s => s.label && s.value), // Remove empty specs
      image: imagePreview, // Save as Base64 in this simple implementation
    };

    onSave(newEquipment);
    toast.success(initialData ? 'อัปเดตข้อมูลอุปกรณ์สำเร็จ!' : 'เพิ่มข้อมูลอุปกรณ์ใหม่สำเร็จ!');
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '1rem'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '100%', maxWidth: '600px', maxHeight: '90vh',
        overflowY: 'auto', padding: '2rem', background: 'var(--bg-secondary)',
        position: 'relative'
      }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
        >
          <X size={24} />
        </button>

        <h2 style={{ marginBottom: '1.5rem' }}>{initialData ? 'แก้ไขข้อมูลอุปกรณ์' : 'เพิ่มอุปกรณ์ใหม่'}</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Image Upload */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
            <div 
              style={{
                width: '100%', height: '200px', borderRadius: 'var(--radius-md)',
                background: 'var(--bg-tertiary)', border: '2px dashed var(--border-color)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', position: 'relative'
              }}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-secondary)', gap: '0.5rem' }}>
                  <Upload size={32} />
                  <span>เพิ่มรูปภาพอุปกรณ์</span>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="filter-btn"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <ImageIcon size={18} /> เลือกรูป
              </button>
              <button 
                type="button" 
                onClick={() => cameraInputRef.current?.click()}
                className="filter-btn"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Camera size={18} /> ถ่ายรูป
              </button>
            </div>
            <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleImageCapture} />
            <input type="file" ref={cameraInputRef} accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleImageCapture} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>ชื่ออุปกรณ์ (ภาษาไทย) *</label>
            <input 
              type="text" name="name" value={formData.name} onChange={handleInputChange} required
              style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>ชื่ออุปกรณ์ (ภาษาอังกฤษ)</label>
            <input 
              type="text" name="nameEng" value={formData.nameEng} onChange={handleInputChange}
              style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>ตัวย่อ / ชื่อรุ่น (ถ้ามี)</label>
            <input 
              type="text" name="abbreviation" value={formData.abbreviation} onChange={handleInputChange}
              style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>หน้าที่หลัก / การใช้งาน</label>
            <textarea 
              name="function" value={formData.function} onChange={handleInputChange} rows={3}
              style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', width: '100%', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>หลักการทำงานเบื้องต้น</label>
            <textarea 
              name="principle" value={formData.principle} onChange={handleInputChange} rows={3}
              style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', width: '100%', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>ข้อควรระวัง (ถ้ามี)</label>
            <textarea 
              name="warnings" value={formData.warnings} onChange={handleInputChange} rows={3}
              style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', width: '100%', resize: 'vertical' }}
            />
          </div>

          {/* Specs Editor */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <label style={{ fontSize: '1rem', fontWeight: '500' }}>ข้อมูลสเปก (Specs)</label>
              <button 
                type="button" onClick={handleAddSpec}
                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'transparent', color: 'var(--accent-primary)', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
              >
                <Plus size={16} /> เพิ่ม
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {specs.map((spec, index) => (
                <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input 
                    type="text" placeholder="ชื่อสเปก (เช่น กระแสไฟ)" 
                    value={spec.label} onChange={(e) => handleSpecChange(index, 'label', e.target.value)}
                    style={{ flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                  />
                  <input 
                    type="text" placeholder="ค่า (เช่น 5A)" 
                    value={spec.value} onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                    style={{ flex: 2, padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                  />
                  <button 
                    type="button" onClick={() => handleRemoveSpec(index)}
                    style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem' }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {specs.length === 0 && (
                <div style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', textAlign: 'center', padding: '1rem' }}>
                  ยังไม่มีข้อมูลสเปก กดเพิ่มเพื่อใส่ข้อมูล
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button 
              type="button" onClick={onClose}
              style={{ flex: 1, padding: '1rem', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: '500' }}
            >
              ยกเลิก
            </button>
            <button 
              type="submit"
              style={{ flex: 2, padding: '1rem', background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: '500' }}
            >
              {initialData ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูลอุปกรณ์'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddEquipmentModal;
