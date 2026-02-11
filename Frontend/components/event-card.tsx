"use client";

import { useState } from "react";
import Image from "next/image";
import { CalendarDays, MapPin, School, Users, ExternalLink, CalendarPlus, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CollegeEvent } from "@/lib/events-data";

interface CollegeEventWithDate extends CollegeEvent {
  event_date?: string;
  registration_url?: string;
}

interface EventCardProps {
  event: CollegeEventWithDate;
}

const categoryColors: Record<string, string> = {
  Technical: "bg-primary/20 text-primary border-primary/30",
  Cultural: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Sports: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Hackathon: "bg-primary/20 text-primary border-primary/30",
  Fest: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Seminar: "bg-sky-500/20 text-sky-400 border-sky-500/30",
};

export function EventCard({ event }: EventCardProps) {
  const [registered, setRegistered] = useState(false);

  // Safe date formatting
  const formattedDate = event.event_date || event.date ? new Date(event.event_date || event.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }) : "Date TBD";

  const handleRegisterClick = () => {
    if (event.registration_url) {
      window.open(event.registration_url, '_blank');
    }
  };

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card/40 backdrop-blur-xl transition-all duration-300 hover:scale-[1.03] hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <School className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col">
              <p className="text-base font-semibold text-white leading-tight font-mono">
                {event.college || "College Name"}
              </p>
            </div>
          </div>
          <Badge variant="outline" className={`text-xs ${categoryColors[event.category] || ""}`}>
            {event.category}
          </Badge>
        </div>

        <h3 className="mb-3 font-mono text-xl font-bold leading-tight text-foreground text-balance tracking-wide">
          {event.title}
        </h3>

        <p className="mb-6 line-clamp-3 text-sm leading-relaxed text-muted-foreground/80 font-mono">
          {event.description}
        </p>

        <div className="mt-auto mb-6 flex items-center gap-6 text-sm text-muted-foreground/70">
          <span className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            {formattedDate}
          </span>
          <span className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {Math.floor(Math.random() * 500) + 200} attending
          </span>
        </div>

        <div className="flex gap-2">
          <Button
            className={`flex-1 rounded-full transition-all duration-200 ${
              registered
                ? "border border-[#8b5cf6]/30 bg-[#8b5cf6]/15 text-[#8b5cf6] hover:bg-[#8b5cf6]/20"
                : "bg-[#8b5cf6] text-white hover:bg-[#7c3aed]"
            }`}
            onClick={handleRegisterClick}
            disabled={!event.registration_url}
            variant={registered ? "outline" : "default"}
            size="sm"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            {event.registration_url ? "Register Now" : "No Link"}
          </Button>
        </div>
      </div>
    </article>
  );
}
