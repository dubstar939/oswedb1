"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type Project = {
  id: string;
  title: string;
  color?: string;
};

type CallLog = {
  id: string;
  text: string;
  createdAt: string;
};

type Note = {
  id: string;
  text: string;
  createdAt: string;
};

type Announcement = {
  id: string;
  text: string;
  createdAt: string;
};

type Task = {
  id: string;
  text: string;
  done: boolean;
};

type Contact = {
  id: string;
  name: string;
  phone?: string;
  notes?: string;
};

type QuickLink = {
  id: string;
  label: string;
  url: string;
};

type RadioStation = {
  id: string;
  name: string;
  streamUrl: string;
};

type WeatherConfig = {
  location: string;
};

type TimezoneConfig = {
  label: string;
  tz: string;
};

interface DashboardState {
  // Projects
  projects: Project[];
  addProject: (project: Project) => void;
  removeProject: (id: string) => void;
  clearProjects: () => void;

  // Call Logger
  callLogs: CallLog[];
  addCallLog: (log: CallLog) => void;
  clearCallLogs: () => void;

  // Notes
  notes: Note[];
  addNote: (note: Note) => void;
  removeNote: (id: string) => void;
  clearNotes: () => void;

  // Announcements
  announcements: Announcement[];
  addAnnouncement: (a: Announcement) => void;
  removeAnnouncement: (id: string) => void;
  clearAnnouncements: () => void;

  // Tasks
  tasks: Task[];
  addTask: (task: Task) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  clearTasks: () => void;

  // Contacts
  contacts: Contact[];
  addContact: (c: Contact) => void;
  removeContact: (id: string) => void;
  clearContacts: () => void;

  // Quick Links
  quickLinks: QuickLink[];
  addQuickLink: (l: QuickLink) => void;
  removeQuickLink: (id: string) => void;
  clearQuickLinks: () => void;

  // Radio Player
  radioStations: RadioStation[];
  currentStationId: string | null;
  setCurrentStation: (id: string | null) => void;
  setRadioStations: (stations: RadioStation[]) => void;

  // Weather
  weather: WeatherConfig;
  setWeatherLocation: (location: string) => void;

  // Timezone
  timezone: TimezoneConfig;
  setTimezone: (tz: TimezoneConfig) => void;

  // Global reset
  resetAll: () => void;
}

const defaultState: Omit<DashboardState,
  | "addProject" | "removeProject" | "clearProjects"
  | "addCallLog" | "clearCallLogs"
  | "addNote" | "removeNote" | "clearNotes"
  | "addAnnouncement" | "removeAnnouncement" | "clearAnnouncements"
  | "addTask" | "toggleTask" | "removeTask" | "clearTasks"
  | "addContact" | "removeContact" | "clearContacts"
  | "addQuickLink" | "removeQuickLink" | "clearQuickLinks"
  | "setCurrentStation" | "setRadioStations"
  | "setWeatherLocation"
  | "setTimezone"
  | "resetAll"
> = {
  projects: [
    { id: "1", title: "Website Redesign", color: "blue" },
    { id: "2", title: "Mobile App", color: "green" },
    { id: "3", title: "Marketing Campaign", color: "yellow" },
    { id: "4", title: "Database Migration", color: "red" },
  ],
  callLogs: [],
  notes: [],
  announcements: [],
  tasks: [],
  contacts: [],
  quickLinks: [],
  radioStations: [],
  currentStationId: null,
  weather: { location: "Navarre Beach, FL" },
  timezone: { label: "Central (CDT)", tz: "America/Chicago" },
};

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      ...defaultState,

      // Projects
      addProject: (project) =>
        set((state) => ({ projects: [...state.projects, project] })),
      removeProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        })),
      clearProjects: () => set({ projects: [] }),

      // Call Logger
      addCallLog: (log) =>
        set((state) => ({ callLogs: [log, ...state.callLogs] })),
      clearCallLogs: () => set({ callLogs: [] }),

      // Notes
      addNote: (note) =>
        set((state) => ({ notes: [note, ...state.notes] })),
      removeNote: (id) =>
        set((state) => ({
          notes: state.notes.filter((n) => n.id !== id),
        })),
      clearNotes: () => set({ notes: [] }),

      // Announcements
      addAnnouncement: (a) =>
        set((state) => ({ announcements: [a, ...state.announcements] })),
      removeAnnouncement: (id) =>
        set((state) => ({
          announcements: state.announcements.filter((x) => x.id !== id),
        })),
      clearAnnouncements: () => set({ announcements: [] }),

      // Tasks
      addTask: (task) =>
        set((state) => ({ tasks: [task, ...state.tasks] })),
      toggleTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, done: !t.done } : t
          ),
        })),
      removeTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),
      clearTasks: () => set({ tasks: [] }),

      // Contacts
      addContact: (c) =>
        set((state) => ({ contacts: [c, ...state.contacts] })),
      removeContact: (id) =>
        set((state) => ({
          contacts: state.contacts.filter((c) => c.id !== id),
        })),
      clearContacts: () => set({ contacts: [] }),

      // Quick Links
      addQuickLink: (l) =>
        set((state) => ({ quickLinks: [l, ...state.quickLinks] })),
      removeQuickLink: (id) =>
        set((state) => ({
          quickLinks: state.quickLinks.filter((l) => l.id !== id),
        })),
      clearQuickLinks: () => set({ quickLinks: [] }),

      // Radio
      setCurrentStation: (id) => set({ currentStationId: id }),
      setRadioStations: (stations) => set({ radioStations: stations }),

      // Weather
      setWeatherLocation: (location) =>
        set((state) => ({ weather: { ...state.weather, location } })),

      // Timezone
      setTimezone: (tz) => set({ timezone: tz }),

      // Global reset
      resetAll: () => set({ ...defaultState }),
    }),
    {
      name: "oswe-dashboard",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : undefined
      ),
      // optional: versioning/migrations later
    }
  )
);
