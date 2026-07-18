"use client";

import { useState } from "react";
import { useCalendarEvents, useCreateCalendarEvent } from "@/lib/hooks/use-operations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { CalendarDays, Plus, Loader2, Clock, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

type CalEvent = { id: string; title: string; type: string; start_time: string; end_time: string; location: string | null; description: string | null; all_day: boolean; color: string | null };

const typeColors: Record<string, string> = { class: "bg-blue-500", exam: "bg-red-500", meeting: "bg-purple-500", holiday: "bg-green-500", workshop: "bg-orange-500", seminar: "bg-teal-500", deadline: "bg-yellow-500", other: "bg-gray-500" };

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", type: "meeting" as string, start_time: "", end_time: "", location: "", description: "" });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  const endDate = new Date(lastDay);
  endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

  const { data: eventsRaw, isLoading } = useCalendarEvents({ start: startDate.toISOString(), end: endDate.toISOString() });
  const createEvent = useCreateCalendarEvent();
  const events = (eventsRaw ?? []) as CalEvent[];

  const daysInMonth = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    daysInMonth.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const getEventsForDate = (date: Date) => {
    return events.filter((e) => {
      const eventDate = new Date(e.start_time);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const navigate = (direction: number) => {
    setCurrentDate(new Date(year, month + direction, 1));
  };

  const handleCreate = () => {
    if (!form.title || !form.start_time || !form.end_time) return;
    createEvent.mutate(form as Parameters<typeof createEvent.mutate>[0], { onSuccess: () => { setShowForm(false); setForm({ title: "", type: "meeting", start_time: "", end_time: "", location: "", description: "" }); } });
  };

  const today = new Date();

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Calendar</h1><p className="text-muted-foreground">Manage events and schedule</p></div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="mr-2 h-4 w-4" /> New Event</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Create Event</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="lg:col-span-2"><label className="text-sm font-medium">Title *</label><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Event title..." className="mt-1" /></div>
              <div><label className="text-sm font-medium">Type</label><select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"><option value="class">Class</option><option value="exam">Exam</option><option value="meeting">Meeting</option><option value="holiday">Holiday</option><option value="workshop">Workshop</option><option value="other">Other</option></select></div>
              <div><label className="text-sm font-medium">Start Time *</label><Input type="datetime-local" value={form.start_time} onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))} className="mt-1" /></div>
              <div><label className="text-sm font-medium">End Time *</label><Input type="datetime-local" value={form.end_time} onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))} className="mt-1" /></div>
              <div><label className="text-sm font-medium">Location</label><Input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="Location..." className="mt-1" /></div>
            </div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button><Button onClick={handleCreate} disabled={createEvent.isPending}>{createEvent.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarDays className="mr-2 h-4 w-4" />} Create Event</Button></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="outline" size="icon" onClick={() => navigate(-1)}><ChevronLeft className="h-4 w-4" /></Button>
            <CardTitle className="text-xl">{currentDate.toLocaleString("default", { month: "long", year: "numeric" })}</CardTitle>
            <Button variant="outline" size="icon" onClick={() => navigate(1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : (
            <div className="grid grid-cols-7 gap-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
              ))}
              {daysInMonth.map((day, i) => {
                const dayEvents = getEventsForDate(day);
                const isToday = day.toDateString() === today.toDateString();
                const isCurrentMonth = day.getMonth() === month;
                return (
                  <div key={i} className={`min-h-[80px] p-1 border rounded-lg ${isToday ? "bg-primary/5 border-primary/20" : isCurrentMonth ? "bg-background" : "bg-muted/30"}`}>
                    <div className={`text-xs font-medium mb-1 ${isToday ? "text-primary font-bold" : isCurrentMonth ? "" : "text-muted-foreground"}`}>{day.getDate()}</div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 2).map((e) => (
                        <div key={e.id} className={`text-[9px] px-1 py-0.5 rounded text-white truncate ${typeColors[e.type] ?? "bg-gray-500"}`}>{e.title}</div>
                      ))}
                      {dayEvents.length > 2 && <div className="text-[9px] text-muted-foreground">+{dayEvents.length - 2} more</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Upcoming Events</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {events.slice(0, 10).map((e) => (
              <div key={e.id} className="flex items-start gap-3 p-3 rounded-lg border">
                <div className={`w-1 h-12 rounded-full ${typeColors[e.type] ?? "bg-gray-500"}`} />
                <div className="flex-1">
                  <p className="font-medium">{e.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(e.start_time).toLocaleString()}</span>
                    {e.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{e.location}</span>}
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] capitalize">{e.type}</Badge>
              </div>
            ))}
            {events.length === 0 && <div className="text-center py-8 text-muted-foreground"><CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-50" /><p>No upcoming events</p></div>}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
