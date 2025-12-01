import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import './SearchBar.css';

function SearchBar({ onSelect, options, placeholder = "Rechercher une pathologie...", excludedIds = [] }) {
  const [query, setQuery] = useState('');
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (query.trim() === '') {
      setFilteredOptions([]);
      setIsOpen(false);
      return;
    }

    const filtered = options
      .filter(option => !excludedIds.includes(option.id))
      .filter(option =>
        option.name.toLowerCase().includes(query.toLowerCase())
      );
    setFilteredOptions(filtered);
    setIsOpen(filtered.length > 0);
    setSelectedIndex(-1);
  }, [query, options, excludedIds]);

  const handleSelect = (option) => {
    setQuery('');
    setIsOpen(false);
    onSelect(option);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Si on a une sélection, prendre celle-ci
      if (selectedIndex >= 0 && filteredOptions[selectedIndex]) {
        handleSelect(filteredOptions[selectedIndex]);
      } 
      // Sinon, prendre le premier élément de la liste filtrée
      else if (filteredOptions.length > 0) {
        handleSelect(filteredOptions[0]);
      }
      return;
    }

    if (!isOpen || filteredOptions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < filteredOptions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex];
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  return (
    <div className="search-bar-container">
      <div className="search-bar">
        <Search className="search-icon" size={20} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (filteredOptions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="search-input"
        />
        {query && (
          <button
            className="clear-button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            aria-label="Effacer"
          >
            <X size={18} />
          </button>
        )}
      </div>
      {isOpen && filteredOptions.length > 0 && (
        <ul ref={listRef} className="search-results">
          {filteredOptions.map((option, index) => (
            <li
              key={option.id}
              className={`search-result-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleSelect(option)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              {option.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchBar;

