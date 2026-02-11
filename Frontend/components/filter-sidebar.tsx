"use client";

import { Calendar, GraduationCap, LayoutGrid, X, MapPin } from "lucide-react";
import { categories, colleges, regions, capitalCities, type EventCategory } from "@/lib/events-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface FilterSidebarProps {
  selectedCategories: EventCategory[];
  onCategoryToggle: (category: EventCategory) => void;
  selectedCollege: string;
  onCollegeChange: (college: string) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  selectedRegion: string;
  onRegionChange: (region: string) => void;
  onClearAll: () => void;
  activeFilterCount: number;
}

export function FilterSidebar({
  selectedCategories,
  onCategoryToggle,
  selectedCollege,
  onCollegeChange,
  selectedDate,
  onDateChange,
  selectedRegion,
  onRegionChange,
  onClearAll,
  activeFilterCount,
}: FilterSidebarProps) {
  return (
    <aside className="flex h-full flex-col" role="complementary" aria-label="Filters">
      <div className="flex items-center justify-between px-5 py-4">
        <h2 className="font-heading text-lg font-semibold text-foreground">Filters</h2>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear all
            <Badge
              variant="secondary"
              className="ml-1.5 bg-primary/20 text-primary px-1.5 py-0 text-xs"
            >
              {activeFilterCount}
            </Badge>
          </Button>
        )}
      </div>

      <Separator className="bg-border" />

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {/* Category Filter */}
        <div className="mb-7">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <LayoutGrid className="h-4 w-4" />
            <span>Category</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {categories.map((category) => {
              const isSelected = selectedCategories.includes(category);
              return (
                <button
                  key={category}
                  onClick={() => onCategoryToggle(category)}
                  className={`flex items-center rounded-md px-3 py-2 text-sm transition-colors text-left ${
                    isSelected
                      ? "bg-primary/15 text-primary font-medium"
                      : "text-foreground hover:bg-secondary"
                  }`}
                  aria-pressed={isSelected}
                >
                  <span
                    className={`mr-3 flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/40"
                    }`}
                  >
                    {isSelected && (
                      <svg
                        className="h-3 w-3 text-primary-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </span>
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* College Filter */}
        <div className="mb-7">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <GraduationCap className="h-4 w-4" />
            <span>College Type</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onCollegeChange("IIT")}
              className={`px-3 py-2 rounded-md border transition-colors text-sm font-medium ${
                selectedCollege === "IIT"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary/50 border-border text-muted-foreground hover:bg-secondary/70"
              }`}
            >
              IIT
            </button>
            <button
              onClick={() => onCollegeChange("NIT")}
              className={`px-3 py-2 rounded-md border transition-colors text-sm font-medium ${
                selectedCollege === "NIT"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary/50 border-border text-muted-foreground hover:bg-secondary/70"
              }`}
            >
              NIT
            </button>
            <button
              onClick={() => onCollegeChange("Others")}
              className={`px-3 py-2 rounded-md border transition-colors text-sm font-medium ${
                selectedCollege === "Others"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary/50 border-border text-muted-foreground hover:bg-secondary/70"
              }`}
            >
              Others
            </button>
          </div>
        </div>

        {/* Region Filter */}
        <div className="mb-7">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>State/Region</span>
          </div>
          <select
            value={selectedRegion}
            onChange={(e) => onRegionChange(e.target.value)}
            className="w-full rounded-md border border-border bg-secondary/50 px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            aria-label="Select region"
          >
            <option value="">All States</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region} - {capitalCities[region as keyof typeof capitalCities]}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Date</span>
          </div>
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full rounded-md border border-border bg-secondary/50 px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors [color-scheme:dark]"
              aria-label="Filter by date"
            />
            {selectedDate && (
              <button
                onClick={() => onDateChange("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear date filter"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
