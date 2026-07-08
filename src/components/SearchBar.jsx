import { Search } from 'lucide-react';

const SearchBar = ({ onSearch }) => {
  return (
    <div className="search-bar">
      <Search size={20} color="var(--text-tertiary)" />
      <input 
        type="text" 
        placeholder="ค้นหาอุปกรณ์ไฟฟ้า (เช่น ชิลเลอร์, แผงโซลาร์, Inverter)..." 
        onChange={(e) => onSearch && onSearch(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
