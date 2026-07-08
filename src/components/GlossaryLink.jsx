import { glossaryData } from '../data/glossary';
import './Tooltip.css';

export default function GlossaryLink({ term }) {
  // Find the term in the array (case-insensitive)
  const termData = glossaryData.find(
    (item) => item.term.toUpperCase() === term.toUpperCase()
  );

  if (!termData) return <span>{term}</span>;

  return (
    <span className="tooltip-container" style={{ borderBottom: '1px dashed var(--accent-ac)', cursor: 'help', color: 'var(--text-primary)' }}>
      {term}
      <span className="tooltip-content">
        <strong>{termData.full}</strong><br />
        <span style={{ fontSize: '0.85rem', color: 'var(--accent-ac)' }}>{termData.th}</span><br />
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{termData.desc}</span>
      </span>
    </span>
  );
}
