"use client";

import { useMemo, useState, useEffect } from "react";
import { Sparkles, Search, Download, MessageSquare } from "lucide-react";
import { type EventCategory, events } from "@/lib/events-data";
import { supabase } from "@/lib/supabase";
import { SearchBar } from "@/components/search-bar";
import { FilterSidebar } from "@/components/filter-sidebar";
import { EventCard } from "@/components/event-card";
import { MobileFilterSheet } from "@/components/mobile-filter-sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReportEvent } from "@/components/report-event";

interface CollegeEventWithDate {
  id: string;
  title: string;
  college: string;
  logo: string;
  date: string;
  category: EventCategory;
  description: string;
  attendees: number;
  location: string;
  event_date?: string;
  registration_url?: string;
}

export function EventDashboard() {
  const [eventsList, setEventsList] = useState<CollegeEventWithDate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<EventCategory[]>([]);
  const [selectedCollege, setSelectedCollege] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    fetchEventsFromSupabase();
  }, []);

  const fetchEventsFromSupabase = async () => {
    setIsLoading(true);
    try {
      // Fetch from your backend API which is already connected to Supabase
      console.log('Fetching from your backend API...');
      
      const response = await fetch('http://localhost:8000/events');
      
      if (!response.ok) {
        throw new Error(`Backend responded with ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data || data.length === 0) {
        console.log('No data from backend, using local data');
        throw new Error('No data from backend');
      }

      // Transform your backend data to match our interface
      const eventsWithDates: CollegeEventWithDate[] = data.map((event: any) => ({
        id: event.id?.toString() || Math.random().toString(),
        title: event.title || 'Untitled Event',
        college: event.college || event.college_name || 'Unknown College',
        logo: event.logo || '/logos/default.jpg',
        date: event.date || event.event_date || new Date().toISOString().split('T')[0],
        category: event.category || 'Technical',
        description: event.description || 'No description available.',
        attendees: event.attendees || 0,
        location: event.location || 'TBD',
        event_date: event.event_date || event.date,
        registration_url: event.registration_url
      }));

      setEventsList(eventsWithDates);
      console.log('✅ Successfully loaded your backend data:', eventsWithDates.length, 'events');
      
    } catch (error) {
      console.error('❌ Cannot load backend data:', (error as Error).message);
      console.log('🔄 Falling back to local demo data...');
      
      // Only use local data as fallback
      const eventsWithDates: CollegeEventWithDate[] = events.map(event => ({
        ...event,
        event_date: event.date,
        registration_url: `https://example.com/register/${event.id}`
      }));
      setEventsList(eventsWithDates);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryToggle = (category: EventCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleCollegeFilter = (filterType: string) => {
    setSelectedCollege(filterType);
  };

  const handleClearAll = () => {
    setSelectedCategories([]);
    setSelectedCollege("");
    setSelectedDate("");
    setSelectedRegion("");
    setSearch("");
  };

  const activeFilterCount =
    selectedCategories.length +
    (selectedCollege ? 1 : 0) +
    (selectedDate ? 1 : 0) +
    (selectedRegion ? 1 : 0);

  const filteredEvents = useMemo(() => {
    return eventsList.filter((event) => {
      const matchesSearch =
        !search ||
        event.title?.toLowerCase().includes(search.toLowerCase()) ||
        event.college?.toLowerCase().includes(search.toLowerCase()) ||
        event.category?.toLowerCase().includes(search.toLowerCase()) ||
        event.description?.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(event.category);

      const matchesCollege =
        !selectedCollege || 
        (selectedCollege === "Others" && !event.college?.toLowerCase().includes("iit") && !event.college?.toLowerCase().includes("iiit") && !event.college?.toLowerCase().includes("nit")) ||
        event.college?.toLowerCase().includes(selectedCollege.toLowerCase());

      const matchesDate = !selectedDate || event.date === selectedDate;

      const matchesRegion = !selectedRegion || event.location.includes(selectedRegion);

      return matchesSearch && matchesCategory && matchesCollege && matchesDate && matchesRegion;
    });
  }, [search, selectedCategories, selectedCollege, selectedDate, selectedRegion, eventsList]);

  const filterProps = {
    selectedCategories,
    onCategoryToggle: handleCategoryToggle,
    selectedCollege,
    onCollegeChange: setSelectedCollege,
    selectedDate,
    onDateChange: setSelectedDate,
    selectedRegion,
    onRegionChange: setSelectedRegion,
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
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 border-b border-border bg-card/60 backdrop-blur-md">
          <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <h1 className="font-heading text-xl font-bold text-foreground">
                UniEvent Hub
              </h1>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {activeFilterCount} active
                </Badge>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* Search Bar */}
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search events..."
                className="w-full sm:w-64"
              />

              {/* Mobile Filter Toggle */}
              <div className="lg:hidden">
                <MobileFilterSheet {...filterProps} />
              </div>

              {/* Report Event Button */}
              <Button
                onClick={() => setIsReportModalOpen(true)}
                variant="outline"
                size="sm"
                className="h-9 px-3 text-xs border-primary/30 text-primary hover:bg-primary/10"
              >
                <MessageSquare className="h-3 w-3 mr-1" />
                Report Event
              </Button>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 rounded-full bg-secondary/50 p-3">
                <Search className="h-6 w-6 text-muted-foreground" />
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

      {/* Report Event Modal */}
      <ReportEvent 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
      />
    </div>
  );
}
