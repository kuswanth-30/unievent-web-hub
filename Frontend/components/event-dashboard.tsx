"use client";

import { useMemo, useState, useEffect } from "react";
import { Sparkles, Search, Download } from "lucide-react";
import { type EventCategory } from "@/lib/events-data";
import { SearchBar } from "@/components/search-bar";
import { FilterSidebar } from "@/components/filter-sidebar";
import { EventCard } from "@/components/event-card";
import { MobileFilterSheet } from "@/components/mobile-filter-sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Event {
  id: number;
  title: string;
  college_name: string;
  category: string;
  description: string;
  date: string;
}

export function EventDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<EventCategory[]>([]);
  const [selectedCollege, setSelectedCollege] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeMessage, setScrapeMessage] = useState("");

  useEffect(() => {
    refreshEvents();
  }, []);

  const refreshEvents = () => {
    setIsLoading(true);
    fetch("http://localhost:8000/events")
      .then((res) => res.json())
      .then((data: Event[]) => {
        setEvents(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Database fetch failed:", err);
        setIsLoading(false);
      });
  };

  const handleScrapeEvents = async () => {
    if (!collegeName || !collegeName.trim()) {
      setScrapeMessage("Please enter a college name");
      return;
    }

    setIsScraping(true);
    setScrapeMessage("");

    try {
      const response = await fetch(`http://localhost:8000/scrape-events?college=${encodeURIComponent(collegeName.trim())}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      const result = await response.json();
      setScrapeMessage(result.message || `Successfully scraped ${result.count} events`);
      
      // Refresh the events list to show newly scraped events
      refreshEvents();
      
      // Clear the input after successful scraping
      setCollegeName("");
    } catch (error) {
      console.error("Scraping failed:", error);
      setScrapeMessage(`Scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsScraping(false);
    }
  };

  

  const handleCategoryToggle = (category: EventCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleClearAll = () => {
    setSelectedCategories([]);
    setSelectedCollege("");
    setSelectedDate("");
    setSearch("");
  };

  const activeFilterCount =
    selectedCategories.length +
    (selectedCollege ? 1 : 0) +
    (selectedDate ? 1 : 0);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        !search ||
        event.title?.toLowerCase().includes(search.toLowerCase()) ||
        event.college_name?.toLowerCase().includes(search.toLowerCase()) ||
        event.category?.toLowerCase().includes(search.toLowerCase()) ||
        event.description?.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(event.category as EventCategory);

      const matchesCollege =
        !selectedCollege || event.college_name === selectedCollege;

      const matchesDate = !selectedDate || event.date === selectedDate;

      return matchesSearch && matchesCategory && matchesCollege && matchesDate;
    });
  }, [search, selectedCategories, selectedCollege, selectedDate]);

  const filterProps = {
    selectedCategories,
    onCategoryToggle: handleCategoryToggle,
    selectedCollege,
    onCollegeChange: setSelectedCollege,
    selectedDate,
    onDateChange: setSelectedDate,
    onClearAll: handleClearAll,
    activeFilterCount,
  };

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <div className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-border bg-card/60 backdrop-blur-md lg:block overflow-y-auto">
        <FilterSidebar {...filterProps} />
      </div>

      {/* Main Content */}
      <main className="flex-1">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-lg">
          <div className="flex items-center gap-3 px-4 py-3 md:px-6 lg:px-8">
            {/* Mobile filter trigger */}
            <MobileFilterSheet {...filterProps} />

            {/* Logo / Brand */}
            <div className="mr-2 hidden items-center gap-2 sm:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-4 w-4 text-primary-foreground" aria-hidden="true" />
              </div>
              <span className="font-heading text-lg font-bold text-foreground whitespace-nowrap">
                UniEvent
              </span>
            </div>

            {/* Search Bar */}
            <SearchBar value={search} onChange={setSearch} />

            {/* College Name Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="College Name"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleScrapeEvents()}
                className="h-9 w-40 rounded-md border border-border bg-secondary/50 px-3 py-1 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                aria-label="College name for scraping"
              />
              <Button
                onClick={handleScrapeEvents}
                disabled={isScraping || !collegeName.trim()}
                size="sm"
                className="h-9 px-3 text-xs"
              >
                <Download className="h-3 w-3 mr-1" />
                {isScraping ? "Scraping..." : "Scrape"}
              </Button>
            </div>
          </div>

          {/* Scrape Message */}
          {scrapeMessage && (
            <div className={`px-4 pb-2 text-xs ${scrapeMessage.includes('failed') || scrapeMessage.includes('error') ? 'text-red-500' : 'text-green-500'}`}>
              {scrapeMessage}
            </div>
          )}
        </header>

        {/* Content Area */}
        <div className="px-4 py-6 md:px-6 lg:px-8">
          {/* Results Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground">
                Discover Events
              </h1>
              <div className="mt-1 text-sm text-muted-foreground flex items-center gap-1">
  <span>
    {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""} found
  </span>
  {activeFilterCount > 0 && (
    <span className="flex items-center gap-1">
      {" "}with{" "}
      <Badge
        variant="secondary"
        className="bg-primary/15 text-primary text-xs px-1.5 py-0"
      >
        {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""}
      </Badge>
    </span>
  )}
</div> 
            </div>
          </div>

          {/* Event Grid */}
          {isLoading ? (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    {/* A simple loading spinner */}
    <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    <h3 className="font-heading text-lg font-semibold text-foreground">
      Loading live events...
    </h3>
    <p className="mt-1 text-sm text-muted-foreground italic">
      Fetching data from the cloud for your {filteredEvents.length} events
    </p>
  </div>
) : filteredEvents.length > 0 ? (
  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
    {filteredEvents.map((event) => (
      <EventCard key={event.id} event={event as any} />
    ))}
  </div>
) : (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
      <Sparkles className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
    </div>
    <h3 className="font-heading text-lg font-semibold text-foreground">
      No events found
    </h3>
    <p className="mt-1 max-w-sm text-sm text-muted-foreground">
      Try adjusting your filters or search query to discover more events.
    </p>
  </div>
)}
        </div>
      </main>
    </div>
  );
}
