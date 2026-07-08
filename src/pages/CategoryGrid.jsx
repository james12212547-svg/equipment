import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, ChevronRight, Home } from 'lucide-react';
import { equipmentData, categories } from '../data/equipment';
import { loadImage } from '../utils/db';
import useStore from '../store/useStore';
import AddEquipmentModal from '../components/AddEquipmentModal';
import { Plus } from 'lucide-react';

const CategoryGrid = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'a-z'
  const [searchQuery, setSearchQuery] = useState('');
  const [localImages, setLocalImages] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const customEquipment = useStore(state => state.customEquipment);
  const addCustomEquipment = useStore(state => state.addCustomEquipment);
  
  const category = categories.find(c => c.id === categoryId);
  
  // Merge static data with custom equipment for this category (custom overwrites static)
  const catCustom = customEquipment.filter(eq => eq.category === categoryId);
  const customIds = new Set(catCustom.map(eq => eq.id));
  const catStatic = equipmentData.filter(eq => eq.category === categoryId && !customIds.has(eq.id));
  
  const allEquipment = [...catStatic, ...catCustom];

  let filteredEquipment = [...allEquipment];

  useEffect(() => {
    const fetchImages = () => {
      const categoryEquipment = equipmentData.filter(eq => eq.category === categoryId);
      
      // Load concurrently to speed up rendering and ensure React updates
      categoryEquipment.forEach(async (eq) => {
        try {
          const img = await loadImage(eq.id);
          if (img) {
            setLocalImages(prev => ({ ...prev, [eq.id]: img }));
          }
        } catch (e) {
          console.error('Error loading image for', eq.id, e);
        }
      });
    };
    if (categoryId) {
      fetchImages();
    }
  }, [categoryId]);
  
  if (searchQuery.trim() !== '') {
    const lowerQuery = searchQuery.toLowerCase();
    filteredEquipment = filteredEquipment.filter(eq => {
      const matchName = eq.name?.toLowerCase().includes(lowerQuery);
      const matchNameEng = eq.nameEng?.toLowerCase().includes(lowerQuery);
      const matchAbbrev = eq.abbreviation?.toLowerCase().includes(lowerQuery);
      const matchFunc = eq.function?.toLowerCase().includes(lowerQuery);
      
      const matchSpecs = eq.specs?.some(spec => 
        spec.label?.toLowerCase().includes(lowerQuery) || 
        spec.value?.toLowerCase().includes(lowerQuery)
      );

      return matchName || matchNameEng || matchAbbrev || matchFunc || matchSpecs;
    });
  }
  
  // Sort filter
  if (activeFilter === 'a-z') {
    filteredEquipment.sort((a, b) => a.name.localeCompare(b.name, 'th'));
  }

  if (!category) return <div>ไม่พบหมวดหมู่</div>;

  const tagClass = categoryId === 'air-conditioning' ? 'tag-ac' : 'tag-solar';

  return (
    <div className="animate-fade-in">
      
      {/* Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-tertiary)', fontSize: '0.9rem', flexWrap: 'wrap' }}>
        <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Home size={16} /> หน้าแรก
        </Link>
        <ChevronRight size={16} />
        <span style={{ color: 'var(--text-primary)' }}>{category.name}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', borderRadius: '50%' }}
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 style={{ marginBottom: 0, fontSize: '2rem' }}>{category.name}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{category.nameEng}</p>
        </div>
      </div>

      <div className="search-bar" style={{ marginBottom: '1.5rem' }}>
        <Search size={20} color="var(--text-tertiary)" />
        <input 
          type="text" 
          placeholder={`ค้นหาอุปกรณ์ในหมวด ${category.name}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="filter-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          <button 
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            ทั้งหมด
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'a-z' ? 'active' : ''}`}
            onClick={() => setActiveFilter('a-z')}
          >
            เรียงตามตัวอักษร (ก-ฮ)
          </button>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="filter-btn animate-fade-in"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--accent-primary)', color: 'white', border: 'none', padding: '0.5rem 1rem' }}
        >
          <Plus size={18} /> <span className="hide-on-mobile">เพิ่มสเปกใหม่</span>
        </button>
      </div>

      <div className="grid-3">
        {filteredEquipment.map(eq => {
          const displayImg = localImages[eq.id] || eq.image;
          
          return (
            <Link to={`/equipment/${eq.id}`} key={eq.id} className="equipment-card">
              <div className="equipment-img-container">
                {displayImg ? (
                  <img src={displayImg} alt={eq.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-tertiary)', background: 'var(--bg-tertiary)'}}>ไม่มีรูปภาพ</div>
                )}
              </div>
              <div className="equipment-info">
                <span className={`tag ${tagClass}`}>{eq.abbreviation}</span>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{eq.name}</h3>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>{eq.nameEng}</p>
              </div>
            </Link>
          );
        })}
      </div>
      
      {filteredEquipment.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>
          <p>ไม่พบอุปกรณ์ที่ค้นหา</p>
        </div>
      )}

      {showAddModal && (
        <AddEquipmentModal 
          categoryId={categoryId} 
          onClose={() => setShowAddModal(false)}
          onSave={addCustomEquipment}
        />
      )}
    </div>
  );
};

export default CategoryGrid;
