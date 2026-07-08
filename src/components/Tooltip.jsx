import { Info } from 'lucide-react';
import './Tooltip.css';

export default function Tooltip({ text }) {
  return (
    <span className="tooltip-container">
      <Info size={16} className="tooltip-icon" />
      <span className="tooltip-content">{text}</span>
    </span>
  );
}
