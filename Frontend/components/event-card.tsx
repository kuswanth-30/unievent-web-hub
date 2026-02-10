"use client";

import { useState } from "react";
import Image from "next/image";
import { CalendarDays, MapPin, School, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// 1. Define the interface to match your Supabase columns exactly
interface Event {
  id: number;
  title: string;
  college_name: string;
  category: string;
  description: string;
  date: string;
}

interface EventCardProps {
  event: Event; // Use the new interface here
}

const categoryColors: Record<string, string> = {
  Hackathon: "bg-primary/20 text-primary border-primary/30",
  Workshop: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Fest: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Seminar: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  Competition: "bg-rose-500/20 text-rose-400 border-rose-500/30",
};

export function EventCard({ event }: EventCardProps) {
  const [registered, setRegistered] = useState(false);

  // Safe date formatting
  const formattedDate = event.date ? new Date(event.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }) : "Date TBD";

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card/40 backdrop-blur-xl transition-all duration-300 hover:scale-[1.03] hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-primary/30 bg-primary/10">
              <School className="h-5 w-5 text-primary" />
            </div>
            <div>
              {/* 2. Changed event.college to event.college_name */}
              <p className="text-xs font-medium text-muted-foreground">
                {event.college_name}
              </p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground/70">
                <MapPin className="h-3 w-3" />
                Hyderabad, TS
              </p>
            </div>
          </div>
          <Badge variant="outline" className={`text-xs ${categoryColors[event.category] || ""}`}>
            {event.category}
          </Badge>
        </div>

        <h3 className="mb-2 font-heading text-lg font-semibold leading-tight text-foreground">
          {event.title}
        </h3>

        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {event.description}
        </p>

        <div className="mt-auto mb-4 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {formattedDate}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            Live data
          </span>
        </div>

        <Button
          className={`w-full rounded-full transition-all duration-200 ${
            registered
              ? "border border-[#8b5cf6]/30 bg-[#8b5cf6]/15 text-[#8b5cf6] hover:bg-[#8b5cf6]/20"
              : "bg-[#8b5cf6] text-white hover:bg-[#7c3aed]"
          }`}
          onClick={() => setRegistered(!registered)}
          variant={registered ? "outline" : "default"}
        >
          {registered ? "Registered" : "Register"}
        </Button>
      </div>
    </article>
  );
}
