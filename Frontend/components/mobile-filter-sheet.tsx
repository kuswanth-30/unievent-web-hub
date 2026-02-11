"use client";

import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FilterSidebar } from "@/components/filter-sidebar";
import type { EventCategory } from "@/lib/events-data";

interface MobileFilterSheetProps {
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

export function MobileFilterSheet(props: MobileFilterSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative shrink-0 lg:hidden border-border bg-secondary/50 text-foreground hover:bg-secondary"
          aria-label="Open filters"
        >
          <Menu className="h-5 w-5" />
          {props.activeFilterCount > 0 && (
            <Badge className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary p-0 text-xs text-primary-foreground">
              {props.activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-80 border-border bg-card p-0"
      >
        <SheetTitle className="sr-only">Filters</SheetTitle>
        <FilterSidebar {...props} />
      </SheetContent>
    </Sheet>
  );
}
