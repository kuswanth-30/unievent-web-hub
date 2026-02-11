"use client";

import { useState } from "react";
import { Search, X, Filter } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  showClearButton?: boolean;
  showFilterButton?: boolean;
  onFilterClick?: () => void;
}

export function SearchBar({ 
  value, 
  onChange, 
  placeholder = "Search events, colleges, or categories...", 
  className = "",
  showClearButton = true,
  showFilterButton = false,
  onFilterClick
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onChange("");
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* Search Icon */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center pointer-events-none">
        <Search className={`h-4 w-4 transition-colors ${
          isFocused ? "text-primary" : "text-muted-foreground"
        }`} />
      </div>

      {/* Input Field */}
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`h-12 w-full rounded-xl border bg-secondary/50 pl-12 pr-20 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200 ${
          isFocused 
            ? "border-primary shadow-lg shadow-primary/20 bg-background" 
            : "border-border hover:border-border/80"
        } focus:outline-none focus:ring-2 focus:ring-primary/20`}
        aria-label="Search events"
      />

      {/* Action Buttons Container */}
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
        {/* Clear Button */}
        {showClearButton && value && (
          <button
            onClick={handleClear}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10 transition-all duration-200"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Filter Button */}
        {showFilterButton && onFilterClick && (
          <button
            onClick={onFilterClick}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10 transition-all duration-200"
            aria-label="Toggle filters"
          >
            <Filter className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Animated Border Effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 via-transparent to-primary/20 opacity-0 transition-opacity duration-300 pointer-events-none"
        style={{ opacity: isFocused ? 1 : 0 }}
      />
    </div>
  );
}
