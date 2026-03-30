"use client";

import { useDashboardStore } from "@/app/store/dashboard-store";
import { useState } from "react";

export function ProjectsWidget() {
  const projects = useDashboardStore((s) => s.projects);
  const addProject = useDashboardStore((s) => s.addProject);
  const removeProject = useDashboardStore((s) => s.removeProject);

  const [title, setTitle] = useState("");

  const handleAdd = () => {
    if (!title.trim()) return;
    addProject({
      id: crypto.randomUUID(),
      title: title.trim(),
      color: "blue",
    });
    setTitle("");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium">Projects</h2>
        {/* your + Add UI can hook into handleAdd or open a dialog */}
      </div>

      <div className="space-y-2">
        {projects.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-md bg-neutral-900 px-3 py-2"
          >
            <span>{p.title}</span>
            <button
              className="text-xs text-red-400"
              onClick={() => removeProject(p.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          className="flex-1 rounded-md bg-neutral-900 px-2 py-1 text-sm"
          placeholder="New project…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button
          className="rounded-md bg-blue-600 px-3 py-1 text-xs"
          onClick={handleAdd}
        >
          Add
        </button>
      </div>
    </div>
  );
}
