import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';
import { equipmentData, categories } from '../data/equipment';

const Favorites = () => {
  const navigate = useNavigate();
  const favorites = useStore(state => state.favorites);
  const toggleFavorite = useStore(state => state.toggleFavorite);

  // Get the actual equipment objects for the favorited IDs
  const favoriteItems = equipmentData.filter(eq => favorites.includes(eq.id));

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem' }}
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-gradient" style={{ marginBottom: 0, fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Heart size={28} color="var(--accent-primary)" fill="var(--accent-primary)" /> อุปกรณ์โปรด
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>My Favorite Equipment</p>
        </div>
      </div>

      {favoriteItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-secondary)', borderRadius: '12px', color: 'var(--text-tertiary)' }}>
          <Heart size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h3>ยังไม่มีรายการโปรด</h3>
          <p>กลับไปที่คลังอุปกรณ์แล้วกดรูปหัวใจเพื่อเพิ่มอุปกรณ์ที่คุณสนใจมาไว้ที่นี่</p>
          <button 
            onClick={() => navigate('/learning')}
            style={{ marginTop: '1.5rem', background: 'var(--accent-primary)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ไปหน้าคลังอุปกรณ์
          </button>
        </div>
      ) : (
        <div className="grid-3">
          {favoriteItems.map(eq => {
            const categoryObj = categories.find(c => c.id === eq.category);
            return (
              <div key={eq.id} className="equipment-card animate-fade-in" style={{ position: 'relative' }}>
                <Link to={`/equipment/${eq.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <span className={`tag ${eq.category === 'air-conditioning' ? 'tag-ac' : 'tag-solar'}`} style={{ margin: 0 }}>
                      {eq.abbreviation}
                    </span>
                    <span style={{ fontSize: '1.5rem' }}>{eq.symbol}</span>
                  </div>
                  
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                    {eq.name}
                  </h3>
                  
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    {eq.nameEng}
                  </p>
                  
                  <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                    <strong>หมวดหมู่:</strong> {categoryObj ? categoryObj.name : eq.category}
                  </div>
                </Link>

                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    toggleFavorite(eq.id);
                    toast.success('ลบออกจากรายการโปรด');
                  }}
                  style={{
                    position: 'absolute',
                    top: '1.5rem',
                    right: '1.5rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: '#ef4444',
                    borderRadius: '50%',
                    padding: '0.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  title="ลบออกจากรายการโปรด"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Favorites;
