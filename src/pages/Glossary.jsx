import { useState } from 'react';
import { ArrowLeft, Search, ChevronDown, ChevronUp, BookOpen, Zap, Sun, Wind, Info, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { glossaryData } from '../data/glossary';

const Glossary = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  const categories = [
    { id: 'All', label: 'ทั้งหมด', icon: <BookOpen size={16} /> },
    { id: 'Electrical', label: 'ระบบไฟฟ้า', icon: <Zap size={16} /> },
    { id: 'Solar', label: 'โซลาร์เซลล์', icon: <Sun size={16} /> },
    { id: 'HVAC', label: 'ระบบปรับอากาศ', icon: <Wind size={16} /> },
    { id: 'General', label: 'ทั่วไป & ความปลอดภัย', icon: <ShieldAlert size={16} /> }
  ];

  const filtered = glossaryData.filter(item => {
    const matchesSearch = item.term.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.full.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.th.includes(searchTerm);
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpand = (term) => {
    setExpandedId(expandedId === term ? null : term);
  };

  const handleRelatedClick = (relatedTerm) => {
    setSearchTerm(relatedTerm);
    setExpandedId(relatedTerm);
    setActiveCategory('All');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem' }}>
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-gradient-ac" style={{ marginBottom: '0.2rem', fontSize: '2rem' }}>พจนานุกรมศัพท์วิศวกรรม</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Deep-Dive Engineering Encyclopedia</p>
        </div>
      </div>

      <div className="equipment-card" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', background: 'var(--bg-secondary)' }}>
        
        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
          <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input 
            type="text" 
            placeholder="ค้นหาคำศัพท์, คำย่อ, หรือความหมายภาษาไทย..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '1rem 1rem 1rem 3rem', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--border-color)', 
              background: 'var(--bg-primary)', 
              color: 'var(--text-primary)', 
              fontSize: '1.1rem' 
            }}
          />
        </div>

        {/* Category Filters */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '1rem' }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '50px',
                border: activeCategory === cat.id ? 'none' : '1px solid var(--border-color)',
                background: activeCategory === cat.id ? 'var(--accent-primary)' : 'var(--bg-primary)',
                color: activeCategory === cat.id ? 'white' : 'var(--text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontWeight: activeCategory === cat.id ? 'bold' : 'normal',
                transition: 'all 0.2s ease'
              }}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* Glossary List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.length > 0 ? filtered.map((item) => {
            const isExpanded = expandedId === item.term;
            return (
              <div 
                key={item.term} 
                style={{ 
                  background: 'var(--bg-primary)', 
                  border: '1px solid var(--border-color)', 
                  borderLeft: `4px solid ${item.category === 'Solar' ? 'var(--accent-solar)' : item.category === 'HVAC' ? 'var(--accent-primary)' : 'var(--accent-ac)'}`, 
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Header (Clickable) */}
                <div 
                  onClick={() => toggleExpand(item.term)}
                  style={{ 
                    padding: '1.5rem', 
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: isExpanded ? 'rgba(0,0,0,0.2)' : 'transparent'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '0.2rem' }}>
                      <h3 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', margin: 0, fontWeight: 'bold' }}>{item.term}</h3>
                      <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.9rem' }}>{item.full}</span>
                    </div>
                    <p style={{ fontWeight: '500', color: 'var(--text-primary)', margin: 0 }}>{item.th}</p>
                  </div>
                  <div style={{ color: 'var(--text-tertiary)' }}>
                    {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', borderTop: '1px solid var(--border-color)', marginTop: '0.5rem', paddingTop: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.5rem', fontSize: '1.05rem' }}>
                      {item.desc}
                    </p>
                    
                    {/* Deep Dive Section */}
                    {item.deepDive && (
                      <div style={{ background: 'var(--bg-secondary)', padding: '1.2rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.2rem', borderLeft: '3px solid var(--accent-secondary)' }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 0.8rem 0', color: 'var(--accent-secondary)' }}>
                          <Info size={18} /> เจาะลึกหน้างานจริง (Deep Dive)
                        </h4>
                        <p style={{ color: 'var(--text-primary)', lineHeight: '1.6', margin: 0 }}>
                          {item.deepDive}
                        </p>
                      </div>
                    )}

                    {/* Examples Section */}
                    {item.examples && item.examples.length > 0 && (
                      <div style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>📝 ตัวอย่างการใช้งาน:</h4>
                        <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0, paddingLeft: '1.5rem' }}>
                          {item.examples.map((ex, i) => (
                            <li key={i} style={{ marginBottom: '0.3rem' }}>{ex}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Related Terms */}
                    {item.related && item.related.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap', borderTop: '1px dashed var(--border-color)', paddingTop: '1rem' }}>
                        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>คำศัพท์ที่เกี่ยวข้อง:</span>
                        {item.related.map(rel => (
                          <button 
                            key={rel}
                            onClick={(e) => { e.stopPropagation(); handleRelatedClick(rel); }}
                            style={{
                              background: 'var(--bg-tertiary)',
                              border: '1px solid var(--border-color)',
                              color: 'var(--accent-primary)',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              transition: 'all 0.2s'
                            }}
                            onMouseOver={e => e.currentTarget.style.background = 'var(--bg-primary)'}
                            onMouseOut={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                          >
                            {rel}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          }) : (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-tertiary)', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
              <Search size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p style={{ fontSize: '1.2rem', margin: 0 }}>ไม่พบคำศัพท์ "{searchTerm}" ในหมวดหมู่นี้</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Glossary;
