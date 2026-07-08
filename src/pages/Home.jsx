import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { categories, equipmentData } from '../data/equipment';
import useStore from '../store/useStore';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const customEquipment = useStore(state => state.customEquipment);

  const customIds = new Set(customEquipment.map(eq => eq.id));
  const filteredStatic = equipmentData.filter(eq => !customIds.has(eq.id));
  const allEquipment = [...filteredStatic, ...customEquipment];

  let filteredEquipment = allEquipment;

  if (searchQuery.trim() !== '' || selectedCategory !== 'all') {
    const lowerQuery = searchQuery.toLowerCase();
    
    filteredEquipment = filteredEquipment.filter(eq => {
      // 1. Category Filter
      if (selectedCategory !== 'all' && eq.category !== selectedCategory) {
        return false;
      }
      
      // 2. Search Query Filter
      if (searchQuery.trim() !== '') {
        const matchName = eq.name?.toLowerCase().includes(lowerQuery);
        const matchNameEng = eq.nameEng?.toLowerCase().includes(lowerQuery);
        const matchAbbrev = eq.abbreviation?.toLowerCase().includes(lowerQuery);
        const matchFunc = eq.function?.toLowerCase().includes(lowerQuery);
        
        // Search inside specs (for specifications or brands)
        const matchSpecs = eq.specs?.some(spec => 
          spec.label?.toLowerCase().includes(lowerQuery) || 
          spec.value?.toLowerCase().includes(lowerQuery)
        );

        return matchName || matchNameEng || matchAbbrev || matchFunc || matchSpecs;
      }
      
      return true;
    });
  }

  const isSearching = searchQuery.trim() !== '' || selectedCategory !== 'all';

  return (
    <div className="animate-fade-in">
      <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>ข้อมูลอุปกรณ์ไฟฟ้า</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        แหล่งรวมข้อมูลอ้างอิงอุปกรณ์ไฟฟ้าสำหรับงานวิศวกรรม
      </p>

      {/* Global Search & Filter */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ marginBottom: 0, flex: '1 1 300px' }}>
          <Search size={20} color="var(--text-tertiary)" />
          <input 
            type="text" 
            placeholder="ค้นหาอุปกรณ์, สเปก, ยี่ห้อ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: '0.5rem 1.5rem', flex: '0 0 auto' }}>
          <Filter size={18} color="var(--text-tertiary)" />
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', fontSize: '1rem', cursor: 'pointer' }}
          >
            <option value="all">ทุกหมวดหมู่</option>
            {categories.map(c => (
              <option key={c.id} value={c.id} style={{ color: 'initial', background: 'initial' }}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      {!isSearching ? (
        <>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>หมวดหมู่อุปกรณ์</h2>
          <div className="grid-2">
            {categories.map(category => (
              <Link 
                to={`/category/${category.id}`} 
                key={category.id} 
                className="category-card"
              >
                {category.image && <img src={category.image} alt={category.name} />}
                <div className="category-card-content">
                  <h3 className={category.id === 'air-conditioning' ? 'text-gradient-ac' : 'text-gradient-solar'} style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>
                    {category.name}
                  </h3>
                  <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}>
                    {category.nameEng}
                  </p>
                  <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem', marginTop: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {category.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem' }}>ผลการค้นหา ({filteredEquipment.length})</h2>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              ล้างการค้นหา
            </button>
          </div>
          
          <div className="grid-3">
            {filteredEquipment.map(eq => {
              const tagClass = eq.category === 'air-conditioning' ? 'tag-ac' : 'tag-solar';
              return (
                <Link to={`/equipment/${eq.id}`} key={eq.id} className="equipment-card animate-fade-in">
                  <div className="equipment-img-container">
                    {eq.image ? (
                      <img src={eq.image} alt={eq.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-tertiary)', background: 'var(--bg-tertiary)'}}>ไม่มีรูปภาพ</div>
                    )}
                  </div>
                  <div className="equipment-info">
                    <span className={`tag ${tagClass}`}>{eq.abbreviation || (eq.category === 'air-conditioning' ? 'AC' : 'SOLAR')}</span>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{eq.name}</h3>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>{eq.nameEng}</p>
                  </div>
                </Link>
              );
            })}
          </div>
          
          {filteredEquipment.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-color)' }}>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '1.1rem' }}>ไม่พบอุปกรณ์ที่ตรงกับคำค้นหา</p>
              <button 
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                style={{ marginTop: '1rem', padding: '0.5rem 1.5rem', background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
              >
                ล้างการค้นหาและดูทั้งหมด
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
