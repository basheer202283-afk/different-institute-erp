"use client";

import { useState } from "react";
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from "@/lib/hooks/use-operations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { CheckSquare, Plus, Loader2, Clock, AlertTriangle, CheckCircle2, Circle, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type TaskRow = { id: string; title: string; description: string | null; status: string; priority: string; due_date: string | null; progress: number; assigned_to: string | null; created_at: string; tags: string[] };

const priorityColors: Record<string, string> = { low: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300", medium: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", high: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400", urgent: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", critical: "bg-red-200 text-red-900 dark:bg-red-900/50 dark:text-red-300" };
const statusIcons: Record<string, React.ElementType> = { todo: Circle, in_progress: Clock, review: AlertTriangle, completed: CheckCircle2, cancelled: Circle, on_hold: Clock };
const statusColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = { todo: "secondary", in_progress: "default", review: "warning", completed: "success", cancelled: "destructive", on_hold: "secondary" };

export default function TasksPage() {
  const [status, setStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", priority: "medium", due_date: "" });
  const { data: tasksRaw, isLoading } = useTasks({ status: status === "all" ? undefined : status });
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const tasks = (tasksRaw ?? []) as TaskRow[];

  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  };

  const handleCreate = () => {
    if (!form.title) return;
    createTask.mutate({ ...form, status: "todo" } as Parameters<typeof createTask.mutate>[0], { onSuccess: () => { setShowForm(false); setForm({ title: "", description: "", priority: "medium", due_date: "" }); } });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Tasks</h1><p className="text-muted-foreground">Manage tasks and assignments</p></div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="mr-2 h-4 w-4" /> New Task</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {[
          { label: "Total", value: stats.total, icon: CheckSquare, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400" },
          { label: "To Do", value: stats.todo, icon: Circle, color: "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400" },
          { label: "In Progress", value: stats.inProgress, icon: Clock, color: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400" },
          { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400" },
        ].map((s) => (
          <Card key={s.label} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatus(s.label === "Total" ? "all" : s.label === "To Do" ? "todo" : s.label === "In Progress" ? "in_progress" : "completed")}>
            <CardContent className="p-4 flex items-center gap-3"><div className={`rounded-lg p-2 ${s.color}`}><s.icon className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div></CardContent>
          </Card>
        ))}
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Create Task</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="lg:col-span-2"><label className="text-sm font-medium">Title *</label><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Task title..." className="mt-1" /></div>
              <div><label className="text-sm font-medium">Priority</label><select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option><option value="critical">Critical</option></select></div>
              <div><label className="text-sm font-medium">Due Date</label><Input type="date" value={form.due_date} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))} className="mt-1" /></div>
            </div>
            <div><label className="text-sm font-medium">Description</label><textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] mt-1" placeholder="Task description..." /></div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button><Button onClick={handleCreate} disabled={createTask.isPending}>{createTask.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckSquare className="mr-2 h-4 w-4" />} Create Task</Button></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg">All Tasks</CardTitle>
          <div className="flex gap-2">
            {["all", "todo", "in_progress", "review", "completed"].map((s) => (
              <Button key={s} variant={status === s ? "default" : "outline"} size="sm" onClick={() => setStatus(s)}>
                {s === "all" ? "All" : s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : tasks.length > 0 ? (
            <div className="space-y-2">
              {tasks.map((task) => {
                const StatusIcon = statusIcons[task.status] ?? Circle;
                return (
                  <div key={task.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <StatusIcon className={`h-5 w-5 shrink-0 ${task.status === "completed" ? "text-green-500" : task.status === "in_progress" ? "text-blue-500" : "text-muted-foreground"}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>{task.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority] ?? ""}`}>{task.priority}</span>
                          <Badge variant={statusColors[task.status] ?? "secondary"} className="text-[10px]">{task.status.replace("_", " ")}</Badge>
                          {task.due_date && <span className="text-[10px] text-muted-foreground">Due: {formatDate(task.due_date)}</span>}
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {task.status !== "completed" && <DropdownMenuItem onClick={() => updateTask.mutate({ id: task.id, data: { status: "completed" } })}><CheckCircle2 className="mr-2 h-4 w-4" /> Complete</DropdownMenuItem>}
                        {task.status === "todo" && <DropdownMenuItem onClick={() => updateTask.mutate({ id: task.id, data: { status: "in_progress" } })}><Clock className="mr-2 h-4 w-4" /> Start</DropdownMenuItem>}
                        <DropdownMenuItem className="text-destructive" onClick={() => { if (confirm("Delete this task?")) deleteTask.mutate(task.id); }}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12"><CheckSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" /><h3 className="text-lg font-semibold">No tasks found</h3><p className="text-muted-foreground mt-1">Create your first task to get started</p></div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
