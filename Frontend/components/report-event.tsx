"use client";

import { useState } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { regions, capitalCities } from "@/lib/events-data";

interface ReportEventProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReportEvent({ isOpen, onClose }: ReportEventProps) {
  const [formData, setFormData] = useState({
    title: "",
    college_name: "",
    category: "",
    date: "",
    description: "",
    link: "",
    region: "",
    submitter_name: "",
    submitter_email: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      // Here you would send the data to your backend API
      const response = await fetch("http://localhost:8000/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          source: "crowdsourcing",
          status: "pending_review"
        }),
      });

      if (response.ok) {
        setSubmitMessage("Event submitted successfully! It will be reviewed shortly.");
        setFormData({
          title: "",
          college_name: "",
          category: "",
          date: "",
          description: "",
          link: "",
          region: "",
          submitter_name: "",
          submitter_email: ""
        });
        setTimeout(() => {
          onClose();
          setSubmitMessage("");
        }, 2000);
      } else {
        throw new Error("Failed to submit event");
      }
    } catch (error) {
      setSubmitMessage("Failed to submit event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 bg-card border border-border rounded-xl shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Report an Event</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Event Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Event name"
                required
                className="h-9"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                College Name *
              </label>
              <Input
                value={formData.college_name}
                onChange={(e) => handleInputChange("college_name", e.target.value)}
                placeholder="College name"
                required
                className="h-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                required
                className="w-full h-9 rounded-md border border-border bg-secondary/50 px-3 py-1 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select category</option>
                <option value="Technical">Technical</option>
                <option value="Cultural">Cultural</option>
                <option value="Sports">Sports</option>
                <option value="Workshops">Workshops</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Event Date *
              </label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                required
                className="h-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                State/Region
              </label>
              <select
                value={formData.region}
                onChange={(e) => handleInputChange("region", e.target.value)}
                className="w-full h-9 rounded-md border border-border bg-secondary/50 px-3 py-1 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select state/region</option>
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region} - {capitalCities[region as keyof typeof capitalCities]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Registration Link
              </label>
              <Input
                value={formData.link}
                onChange={(e) => handleInputChange("link", e.target.value)}
                placeholder="https://..."
                className="h-9"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Description *
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Event details, schedule, requirements, etc."
              required
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Your Name
              </label>
              <Input
                value={formData.submitter_name}
                onChange={(e) => handleInputChange("submitter_name", e.target.value)}
                placeholder="Optional"
                className="h-9"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Your Email
              </label>
              <Input
                type="email"
                value={formData.submitter_email}
                onChange={(e) => handleInputChange("submitter_email", e.target.value)}
                placeholder="Optional"
                className="h-9"
              />
            </div>
          </div>

          {submitMessage && (
            <div className={`text-sm ${submitMessage.includes("success") ? "text-green-500" : "text-red-500"}`}>
              {submitMessage}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  Submitting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Submit Event
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
