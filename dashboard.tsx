"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import {
  Bell,
  Calendar as CalendarIcon,
  Calculator,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cloud,
  CloudRain,
  CloudSun,
  Edit2,
  Folder,
  Hexagon,
  ListTodo,
  Megaphone,
  Mic,
  Moon,
  Newspaper,
  Pause,
  Phone,
  Play,
  Plus,
  Radio,
  Save,
  Search,
  SkipBack,
  SkipForward,
  Sun,
  Thermometer,
  Trash2,
  Volume2,
  VolumeX,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Types
interface TodoItem {
  id: string
  text: string
  completed: boolean
  createdAt: string // Changed to string for JSON serialization
}

interface CallLog {
  id: string
  callerName: string
  phone: string
  notes: string
  timestamp: string // Changed to string for JSON serialization
}

interface Project {
  id: string
  name: string
  color: string
}

interface Announcement {
  id: string
  title: string
  content: string
  date: string // Changed to string for JSON serialization
}

// --- CUSTOM HOOK FOR LOCAL STORAGE ---
// This hook handles SSR safety and Hydration correctly for Next.js
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // 1. Initialize state with the initial value.
  // This ensures the server and client match on the first render (No Hydration Error).
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // 2. Hydrate: Read from localStorage ONLY on the client after mount.
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error reading localStorage key “${key}”:`, error);
    }
  }, [key]);

  // 3. Persist: Update localStorage whenever state changes.
  // We wrap the setter to handle the side effect.
  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key “${key}”:`, error);
    }
  };

  return [storedValue, setValue];
}

// US Timezone data
const US_TIMEZONES = [
  { name: "Eastern", zone: "America/New_York", abbr: "EST/EDT" },
  { name: "Central", zone: "America/Chicago", abbr: "CST/CDT" },
  { name: "Mountain", zone: "America/Denver", abbr: "MST/MDT" },
  { name: "Pacific", zone: "America/Los_Angeles", abbr: "PST/PDT" },
  { name: "Alaska", zone: "America/Anchorage", abbr: "AKST/AKDT" },
]

// Weather data for top US cities
const US_CITIES_WEATHER = [
  { city: "New York", temp: 72, condition: "sunny", high: 78, low: 65 },
  { city: "Los Angeles", temp: 85, condition: "sunny", high: 88, low: 70 },
  { city: "Chicago", temp: 68, condition: "cloudy", high: 72, low: 58 },
  { city: "Houston", temp: 92, condition: "partlyCloudy", high: 95, low: 78 },
  { city: "Phoenix", temp: 105, condition: "sunny", high: 110, low: 85 },
]

// Radio stations
const RADIO_STATIONS = [
  { name: "Jazz FM", genre: "Jazz", url: "https://stream.jazzfm.ro/jazz.mp3" },
  { name: "Classical 24", genre: "Classical", url: "https://classicalstream.publicradio.org/classical24.aac" },
  { name: "Smooth Jazz", genre: "Smooth Jazz", url: "https://stream.jazzfm.ro/smoothjazz.mp3" },
  { name: "Lo-Fi Beats", genre: "Lo-Fi", url: "https://streams.ilovemusic.de/iloveradio17.mp3" },
  { name: "Chill Hop", genre: "Chill", url: "https://streams.ilovemusic.de/iloveradio17.mp3" },
  { name: "Dubstep", genre: "Electronic", url: "https://www.1.fm/tunestream/dubstep/listen.pls" },
  { name: "Dubstep2", genre: "Electronic", url: "https://technobeatz.stream.laut.fm/technobeatz" },
  { name: "Sports", genre: "Sports", url: "http://api.spreaker.com/listen/show/948987/episode/latest/shoutcast" },
  { name: "Sports2", genre: "Sports", url: "https://play.radioking.io/radio-sports-fr/243262" },
   { name: "Electronic2", genre: "electronic2", url: "https://listen.radioexpresolatino.com/radiomixes" },
  { name: "News", genre: "News", url: "https://stream.live.vc.bbcmedia.co.uk/bbc_world_service" },
   { name: "Focus", genre: "Focus", url: "https://codingfm.stream.laut.fm/codingfm" },
 

]

// News headlines
const NEWS_HEADLINES = [
  "Tech stocks surge as AI investments continue to drive market growth",
  "Climate summit reaches historic agreement on carbon reduction targets",
  "Federal Reserve signals potential rate adjustments in coming months",
  "New breakthrough in renewable energy storage announced by researchers",
  "Major infrastructure bill passes with bipartisan support",
  "Global health initiative launches new vaccination program",
  "Space exploration milestone: New Mars mission scheduled for next year",
]

// Project colors
const PROJECT_COLORS = [
  "bg-cyan-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-indigo-500",
  "bg-teal-500",
]

export default function Dashboard() {
  // --- STATE WITH PERSISTENCE ---
  // Replaced useState with useLocalStorage for all persistent data
  <iframe width="1188" height="668" src="https://www.youtube.com/embed/xRglZIqWYVY" title="Coding Station | Dark Subway Cyberpunk Programming Music" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
  const [theme, setTheme] = useLocalStorage<"dark" | "light">("oswe-theme", "dark")
  
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  
  // Todo state (Persisted)
  const [todos, setTodos] = useLocalStorage<TodoItem[]>("oswe-todos", [
    { id: "1", text: "Review project documentation", completed: false, createdAt: new Date().toISOString() },
    { id: "2", text: "Schedule team meeting", completed: true, createdAt: new Date().toISOString() },
    { id: "3", text: "Update client presentation", completed: false, createdAt: new Date().toISOString() },
  ])
  const [newTodo, setNewTodo] = useState("")
  
  // Call log state (Persisted)
  const [callLogs, setCallLogs] = useLocalStorage<CallLog[]>("oswe-calls", [
    { id: "1", callerName: "John Smith", phone: "555-0123", notes: "Discussed project timeline", timestamp: new Date().toISOString() },
    { id: "2", callerName: "Sarah Johnson", phone: "555-0456", notes: "Follow up on proposal", timestamp: new Date(Date.now() - 3600000).toISOString() },
  ])
  const [newCall, setNewCall] = useState({ callerName: "", phone: "", notes: "" })
  
  // Projects state (Persisted)
  const [projects, setProjects] = useLocalStorage<Project[]>("oswe-projects", [
    { id: "1", name: "Website Redesign", color: "bg-cyan-500" },
    { id: "2", name: "Mobile App", color: "bg-emerald-500" },
    { id: "3", name: "Marketing Campaign", color: "bg-amber-500" },
    { id: "4", name: "Database Migration", color: "bg-rose-500" },
  ])
  const [editingProject, setEditingProject] = useState<string | null>(null)
  const [newProjectName, setNewProjectName] = useState("")
  
  // Announcements state (Persisted)
  const [announcements, setAnnouncements] = useLocalStorage<Announcement[]>("oswe-announcements", [
    { id: "1", title: "System Maintenance", content: "Scheduled maintenance this weekend", date: new Date().toISOString() },
    { id: "2", title: "Team Meeting", content: "Weekly sync at 10 AM Monday", date: new Date().toISOString() },
  ])
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "" })
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false)
  
  // Radio state (Not persisted - usually transient)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState([75])
  const [currentStation, setCurrentStation] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  // Calculator state (Not persisted - usually transient)
  const [calcDisplay, setCalcDisplay] = useState("0")
  const [calcPrevValue, setCalcPrevValue] = useState<number | null>(null)
  const [calcOperation, setCalcOperation] = useState<string | null>(null)
  const [calcNewNumber, setCalcNewNumber] = useState(true)
  
  // News ticker state
  const [newsIndex, setNewsIndex] = useState(0)

  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  // Update time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])
  
  // News ticker rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setNewsIndex((prev) => (prev + 1) % NEWS_HEADLINES.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Particle effect
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const particles: Particle[] = []
    const particleCount = 80

    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      color: string

      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 2 + 0.5
        this.speedX = (Math.random() - 0.5) * 0.3
        this.speedY = (Math.random() - 0.5) * 0.3
        this.color = `rgba(${Math.floor(Math.random() * 50) + 100}, ${Math.floor(Math.random() * 100) + 150}, ${Math.floor(Math.random() * 55) + 200}, ${Math.random() * 0.4 + 0.1})`
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY
        if (this.x > canvas.width) this.x = 0
        if (this.x < 0) this.x = canvas.width
        if (this.y > canvas.height) this.y = 0
        if (this.y < 0) this.y = canvas.height
      }

      draw() {
        if (!ctx) return
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    function animate() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const particle of particles) {
        particle.update()
        particle.draw()
      }
      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      if (!canvas) return
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  // Get time for timezone
  const getTimeForZone = (zone: string) => {
    return currentTime.toLocaleTimeString("en-US", {
      timeZone: zone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
  }

  // Weather icon
  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case "sunny": return <Sun className="h-6 w-6 text-amber-400" />
      case "cloudy": return <Cloud className="h-6 w-6 text-slate-400" />
      case "partlyCloudy": return <CloudSun className="h-6 w-6 text-amber-300" />
      case "rainy": return <CloudRain className="h-6 w-6 text-blue-400" />
      default: return <Sun className="h-6 w-6 text-amber-400" />
    }
  }

  // Calendar functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDayOfMonth = new Date(year, month, 1).getDay()
    return { daysInMonth, firstDayOfMonth }
  }

  const { daysInMonth, firstDayOfMonth } = getDaysInMonth(currentMonth)

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  // Todo functions
  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, { id: Date.now().toString(), text: newTodo, completed: false, createdAt: new Date().toISOString() }])
      setNewTodo("")
    }
  }

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id))
  }

  // Call log functions
  const addCallLog = () => {
    if (newCall.callerName.trim()) {
      setCallLogs([{ id: Date.now().toString(), ...newCall, timestamp: new Date().toISOString() }, ...callLogs])
      setNewCall({ callerName: "", phone: "", notes: "" })
    }
  }

  const clearAllCalls = () => {
    setCallLogs([])
  }

  // Announcement functions
  const deleteAnnouncement = (id: string) => {
    setAnnouncements(announcements.filter(a => a.id !== id))
  }

  const addAnnouncement = () => {
    if (newAnnouncement.title.trim() && newAnnouncement.content.trim()) {
      setAnnouncements([
        { id: Date.now().toString(), title: newAnnouncement.title, content: newAnnouncement.content, date: new Date().toISOString() },
        ...announcements
      ])
      setNewAnnouncement({ title: "", content: "" })
      setShowAnnouncementModal(false)
    }
  }

  // Project functions
  const addProject = () => {
    const color = PROJECT_COLORS[projects.length % PROJECT_COLORS.length]
    setProjects([...projects, { id: Date.now().toString(), name: "New Project", color }])
  }

  const updateProjectName = (id: string, name: string) => {
    setProjects(projects.map(p => p.id === id ? { ...p, name } : p))
    setEditingProject(null)
  }

  const deleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id))
  }

  // Radio functions
  const togglePlay = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(RADIO_STATIONS[currentStation].url)
      audioRef.current.volume = volume[0] / 100
    }
    
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch(() => {
        // Handle autoplay restrictions
      })
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying, currentStation, volume])

  const changeStation = (direction: "next" | "prev") => {
    const newIndex = direction === "next" 
      ? (currentStation + 1) % RADIO_STATIONS.length
      : (currentStation - 1 + RADIO_STATIONS.length) % RADIO_STATIONS.length
    setCurrentStation(newIndex)
    if (audioRef.current) {
      audioRef.current.src = RADIO_STATIONS[newIndex].url
      if (isPlaying) audioRef.current.play().catch(() => {})
    }
  }

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume[0] / 100
    }
    if (newVolume[0] > 0) setIsMuted(false)
  }

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
    }
    setIsMuted(!isMuted)
  }

  // Calculator functions
  const handleCalcNumber = (num: string) => {
    if (calcNewNumber) {
      setCalcDisplay(num)
      setCalcNewNumber(false)
    } else {
      setCalcDisplay(calcDisplay === "0" ? num : calcDisplay + num)
    }
  }

  const handleCalcOperation = (op: string) => {
    setCalcPrevValue(parseFloat(calcDisplay))
    setCalcOperation(op)
    setCalcNewNumber(true)
  }

  const handleCalcEquals = () => {
    if (calcPrevValue !== null && calcOperation) {
      const current = parseFloat(calcDisplay)
      let result = 0
      switch (calcOperation) {
        case "+": result = calcPrevValue + current; break
        case "-": result = calcPrevValue - current; break
        case "*": result = calcPrevValue * current; break
        case "/": result = current !== 0 ? calcPrevValue / current : 0; break
        case "%": result = calcPrevValue * (current / 100); break
      }
      setCalcDisplay(result.toString())
      setCalcPrevValue(null)
      setCalcOperation(null)
      setCalcNewNumber(true)
    }
  }

  const handleCalcClear = () => {
    setCalcDisplay("0")
    setCalcPrevValue(null)
    setCalcOperation(null)
    setCalcNewNumber(true)
  }

  const handleCalcDecimal = () => {
    if (!calcDisplay.includes(".")) {
      setCalcDisplay(calcDisplay + ".")
      setCalcNewNumber(false)
    }
  }

  return (
    <div className={`${theme} min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 relative overflow-hidden`}>
      {/* Background particle effect */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-40" />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-slate-950/90 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full animate-ping"></div>
              <div className="absolute inset-2 border-4 border-t-cyan-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-4 border-4 border-r-blue-500 border-t-transparent border-b-transparent border-l-transparent rounded-full animate-spin-slow"></div>
            </div>
            <div className="mt-4 text-cyan-400 font-mono text-sm tracking-wider">LOADING DASHBOARD</div>
          </div>
        </div>
      )}

      <div className="container mx-auto p-4 relative z-10 max-w-[1800px]">
        {/* Header */}
        <header className="flex items-center justify-between py-3 border-b border-slate-700/50 mb-4">
          <div className="flex items-center gap-2">
            <Hexagon className="h-7 w-7 text-cyan-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              OSWE DASHBOARD
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-1 bg-slate-800/50 rounded-full px-3 py-1.5 border border-slate-700/50 backdrop-blur-sm">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none focus:outline-none text-sm w-32 placeholder:text-slate-500"
              />
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-slate-100">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-2 w-2 bg-cyan-500 rounded-full animate-pulse"></span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Notifications</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-slate-400 hover:text-slate-100">
                    {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Toggle theme</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Avatar>
              <AvatarFallback className="bg-slate-700 text-cyan-500">OS</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* News Ticker */}
        <div className="mb-4 bg-slate-800/40 border border-slate-700/50 rounded-lg overflow-hidden backdrop-blur-sm">
          <div className="flex items-center">
            <div className="bg-cyan-500/20 px-3 py-2 border-r border-slate-700/50 flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-semibold text-cyan-400 uppercase">Breaking</span>
            </div>
            <div className="flex-1 overflow-hidden px-4 py-2">
              <p className="text-sm text-slate-300 whitespace-nowrap animate-marquee">
                {NEWS_HEADLINES[newsIndex]}
              </p>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-4">
          
          {/* Left Column - Clocks & Weather */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            
            {/* US Timezone Clocks */}
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-slate-100 flex items-center text-sm">
                  <Clock className="mr-2 h-4 w-4 text-cyan-500" />
                  US Time Zones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {US_TIMEZONES.map((tz) => (
                  <div key={tz.zone} className="flex items-center justify-between bg-slate-800/40 rounded-md px-3 py-2 border border-slate-700/30">
                    <div>
                      <div className="text-xs text-slate-400">{tz.name}</div>
                      <div className="text-xs text-slate-500">{tz.abbr}</div>
                    </div>
                    <div className="text-lg font-mono text-cyan-400">{getTimeForZone(tz.zone)}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Weather Widget */}
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-slate-100 flex items-center text-sm">
                  <Thermometer className="mr-2 h-4 w-4 text-cyan-500" />
                  US Weather
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {US_CITIES_WEATHER.map((city) => (
                      <div key={city.city} className="flex items-center justify-between bg-slate-800/40 rounded-md px-3 py-2 border border-slate-700/30">
                        <div className="flex items-center gap-2">
                          {getWeatherIcon(city.condition)}
                          <div>
                            <div className="text-sm text-slate-200">{city.city}</div>
                            <div className="text-xs text-slate-500">H:{city.high}° L:{city.low}°</div>
                          </div>
                        </div>
                        <div className="text-xl font-semibold text-slate-100">{city.temp}°F</div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Center Column - Calendar, Projects, Announcements */}
          <div className="col-span-12 lg:col-span-6 space-y-4">
            
            {/* Calendar & Announcements Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Calendar */}
              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-slate-100 flex items-center text-sm">
                      <CalendarIcon className="mr-2 h-4 w-4 text-cyan-500" />
                      {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </CardTitle>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={prevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={nextMonth}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                      <div key={day} className="text-xs text-slate-500 font-medium py-1">{day}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                      <div key={`empty-${i}`} className="h-7"></div>
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1
                      const isToday = new Date().getDate() === day && 
                                      new Date().getMonth() === currentMonth.getMonth() &&
                                      new Date().getFullYear() === currentMonth.getFullYear()
                      const isSelected = selectedDate?.getDate() === day &&
                                        selectedDate?.getMonth() === currentMonth.getMonth()
                      return (
                        <button
                          key={day}
                          onClick={() => setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
                          className={`h-7 text-xs rounded-md transition-colors ${
                            isToday ? "bg-cyan-500 text-white" :
                            isSelected ? "bg-slate-700 text-cyan-400" :
                            "hover:bg-slate-800 text-slate-300"
                          }`}
                        >
                          {day}
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Announcements */}
              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-slate-100 flex items-center text-sm">
                    <Megaphone className="mr-2 h-4 w-4 text-cyan-500" />
                    Announcements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[180px]">
                    <div className="space-y-2">
                      {announcements.map((a) => (
                        <div key={a.id} className="group bg-slate-800/40 rounded-md p-3 border border-slate-700/30 relative">
                          <div className="flex items-start justify-between">
                            <div className="font-medium text-sm text-slate-200">{a.title}</div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs bg-cyan-500/10 text-cyan-400 border-cyan-500/30">New</Badge>
                              <button
                                onClick={() => deleteAnnouncement(a.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-600/20"
                                title="Remove announcement"
                              >
                                <X className="h-3 w-3 text-slate-400 hover:text-red-400" />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">{a.content}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <Dialog open={showAnnouncementModal} onOpenChange={setShowAnnouncementModal}>
                    <DialogTrigger asChild>
                      <Button className="w-full mt-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs h-8">
                        <Plus className="h-3 w-3 mr-1" /> Add Announcement
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-slate-700">
                      <DialogHeader>
                        <DialogTitle className="text-white">New Announcement</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3">
                        <Input 
                          placeholder="Title" 
                          className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400" 
                          value={newAnnouncement.title}
                          onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                        />
                        <Textarea 
                          placeholder="Content" 
                          className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400" 
                          value={newAnnouncement.content}
                          onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                        />
                        <Button 
                          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                          onClick={addAnnouncement}
                        >
                          Post Announcement
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>

            {/* Projects Section */}
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-slate-100 flex items-center text-sm">
                    <Folder className="mr-2 h-4 w-4 text-cyan-500" />
                    Projects
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={addProject} className="h-7 text-xs text-cyan-400 hover:text-cyan-300">
                    <Plus className="h-3 w-3 mr-1" /> Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="group relative bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 hover:border-slate-600 transition-all cursor-pointer"
                    >
                      <div className={`w-10 h-10 ${project.color} rounded-lg mb-2 flex items-center justify-center`}>
                        <Folder className="h-5 w-5 text-white" />
                      </div>
                      {editingProject === project.id ? (
                        <Input
                          value={newProjectName}
                          onChange={(e) => setNewProjectName(e.target.value)}
                          onBlur={() => updateProjectName(project.id, newProjectName)}
                          onKeyDown={(e) => e.key === "Enter" && updateProjectName(project.id, newProjectName)}
                          className="h-6 text-xs bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                          autoFocus
                        />
                      ) : (
                        <div className="text-sm font-medium text-slate-200 truncate">{project.name}</div>
                      )}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingProject(project.id); setNewProjectName(project.name); }}
                          className="p-1 rounded bg-slate-700 hover:bg-slate-600"
                        >
                          <Edit2 className="h-3 w-3 text-slate-300" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}
                          className="p-1 rounded bg-slate-700 hover:bg-red-600"
                        >
                          <Trash2 className="h-3 w-3 text-slate-300" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Call Logger */}
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-slate-100 flex items-center text-sm">
                    <Phone className="mr-2 h-4 w-4 text-cyan-500" />
                    Call Logger
                  </CardTitle>
                  {callLogs.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearAllCalls} 
                      className="h-7 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3 w-3 mr-1" /> Clear All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                  <Input
                    placeholder="Caller Name"
                    value={newCall.callerName}
                    onChange={(e) => setNewCall({ ...newCall, callerName: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-sm h-8 text-white placeholder:text-slate-400"
                  />
                  <Input
                    placeholder="Phone Number"
                    value={newCall.phone}
                    onChange={(e) => setNewCall({ ...newCall, phone: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-sm h-8 text-white placeholder:text-slate-400"
                  />
                  <Input
                    placeholder="Notes"
                    value={newCall.notes}
                    onChange={(e) => setNewCall({ ...newCall, notes: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-sm h-8 text-white placeholder:text-slate-400"
                  />
                </div>
                <Button onClick={addCallLog} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white text-xs h-8 mb-3">
                  <Save className="h-3 w-3 mr-1" /> Save Call
                </Button>
                <ScrollArea className="h-[120px]">
                  <div className="space-y-2">
                    {callLogs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between bg-slate-800/40 rounded-md px-3 py-2 border border-slate-700/30">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-cyan-500/20 rounded-full">
                            <Phone className="h-3 w-3 text-cyan-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-200">{log.callerName}</div>
                            <div className="text-xs text-slate-500">{log.phone}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-400">{log.notes}</div>
                          {/* Fix: Handle date strings safely */}
                          <div className="text-xs text-slate-500">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Radio, Calculator, Todo */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            
            {/* Internet Radio */}
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-slate-100 flex items-center text-sm">
                  <Radio className="mr-2 h-4 w-4 text-cyan-500" />
                  Internet Radio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30 mb-3">
                  <div className="text-center mb-3">
                    <div className="text-lg font-semibold text-slate-100">{RADIO_STATIONS[currentStation].name}</div>
                    <div className="text-xs text-slate-500">{RADIO_STATIONS[currentStation].genre}</div>
                  </div>
                  
                  {/* Visualizer bars */}
                  <div className="flex items-end justify-center gap-1 h-8 mb-3">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-full transition-all duration-150 ${isPlaying ? "animate-pulse" : ""}`}
                        style={{ height: isPlaying ? `${Math.random() * 100}%` : "20%" }}
                      ></div>
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => changeStation("prev")}>
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      className="h-10 w-10 bg-cyan-600 hover:bg-cyan-700 rounded-full"
                      onClick={togglePlay}
                    >
                      {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => changeStation("next")}>
                      <SkipForward className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleMute}>
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  <Slider
                    value={volume}
                    onValueChange={handleVolumeChange}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-xs text-slate-500 w-8">{volume[0]}%</span>
                </div>
              </CardContent>
            </Card>

            {/* Calculator */}
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-slate-100 flex items-center text-sm">
                  <Calculator className="mr-2 h-4 w-4 text-cyan-500" />
                  Calculator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-800/50 rounded-lg p-3 mb-3 border border-slate-700/30">
                  <div className="text-right text-2xl font-mono text-cyan-400 truncate">{calcDisplay}</div>
                  {calcOperation && (
                    <div className="text-right text-xs text-slate-500">{calcPrevValue} {calcOperation}</div>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {["C", "%", "÷", "×", "7", "8", "9", "-", "4", "5", "6", "+", "1", "2", "3", "=", "0", ".", "←"].map((btn) => (
                    <button
                      key={btn}
                      onClick={() => {
                        if (btn === "C") handleCalcClear()
                        else if (btn === "=") handleCalcEquals()
                        else if (btn === ".") handleCalcDecimal()
                        else if (btn === "←") setCalcDisplay(calcDisplay.slice(0, -1) || "0")
                        else if (["+", "-", "×", "÷", "%"].includes(btn)) {
                          const op = btn === "×" ? "*" : btn === "÷" ? "/" : btn
                          handleCalcOperation(op)
                        }
                        else handleCalcNumber(btn)
                      }}
                      className={`h-9 rounded-md text-sm font-medium transition-colors ${
                        btn === "=" ? "bg-cyan-600 hover:bg-cyan-700 text-white col-span-1 row-span-2" :
                        btn === "0" ? "col-span-2 bg-slate-800 hover:bg-slate-700 text-slate-200" :
                        ["C", "%", "÷", "×", "-", "+"].includes(btn) ? "bg-slate-700 hover:bg-slate-600 text-cyan-400" :
                        "bg-slate-800 hover:bg-slate-700 text-slate-200"
                      }`}
                    >
                      {btn}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Todo List */}
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-slate-100 flex items-center text-sm">
                  <ListTodo className="mr-2 h-4 w-4 text-cyan-500" />
                  To-Do List
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="Add a task..."
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTodo()}
                    className="bg-slate-800 border-slate-700 text-sm h-8 flex-1 text-white placeholder:text-slate-400"
                  />
                  <Button onClick={addTodo} size="sm" className="bg-cyan-600 hover:bg-cyan-700 h-8">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <ScrollArea className="h-[180px]">
                  <div className="space-y-2">
                    {todos.map((todo) => (
                      <div
                        key={todo.id}
                        className="flex items-center gap-2 bg-slate-800/40 rounded-md px-3 py-2 border border-slate-700/30 group"
                      >
                        <Checkbox
                          checked={todo.completed}
                          onCheckedChange={() => toggleTodo(todo.id)}
                          className="border-slate-600 data-[state=checked]:bg-cyan-600 data-[state=checked]:border-cyan-600"
                        />
                        <span className={`flex-1 text-sm ${todo.completed ? "line-through text-slate-500" : "text-slate-200"}`}>
                          {todo.text}
                        </span>
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-700 rounded"
                        >
                          <X className="h-3 w-3 text-slate-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="mt-2 text-xs text-slate-500 text-center">
                  {todos.filter(t => !t.completed).length} tasks remaining
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
