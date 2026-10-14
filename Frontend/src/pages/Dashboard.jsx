import React from 'react';
import axios from 'axios';
import { Building2, DoorOpen, Server, Package, Thermometer, AlertTriangle, Wifi, Settings2, GripVertical, Eye, EyeOff, Maximize2, Minimize2, Square, X, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

const overviewData = [
  { name: 'Hospitals', value: 12, icon: Building2, color: 'hsl(142, 71%, 45%)', bg: 'bg-stat-green-light', text: 'text-stat-green' },
  { name: 'Rooms', value: 48, icon: DoorOpen, color: 'hsl(45, 93%, 47%)', bg: 'bg-stat-yellow-light', text: 'text-stat-yellow' },
  { name: 'Racks', value: 156, icon: Server, color: 'hsl(0, 84%, 60%)', bg: 'bg-stat-coral-light', text: 'text-stat-coral' },
  { name: 'Bins', value: 624, icon: Package, color: 'hsl(210, 80%, 45%)', bg: 'bg-stat-blue-light', text: 'text-stat-blue' },
];

const chartData = [
  { name: 'Hospitals', value: 12, color: 'hsl(142, 71%, 45%)' },
  { name: 'Rooms', value: 48, color: 'hsl(45, 93%, 47%)' },
  { name: 'Racks', value: 156, color: 'hsl(0, 84%, 60%)' },
  { name: 'Bins', value: 624, color: 'hsl(210, 80%, 45%)' },
];

const partneredHospitals = [
  { name: 'City General Hospital', status: 'Connected', beds: 320 },
  { name: "St. Mary's Medical Center", status: 'Connected', beds: 180 },
  { name: 'Regional Health Campus', status: 'Syncing', beds: 450 },
  { name: 'Metro Emergency Hospital', status: 'Connected', beds: 200 },
];

const playAlarm = () => {
  alarmSound.play().catch(() => {});
};

const stopAlarm = () => {
  alarmSound.pause();
  alarmSound.currentTime = 0;
};

// ─── Default Widget Config ────────────────────
const DEFAULT_WIDGETS = [
  { id: 'stats', label: 'Overview Stats', visible: true, size: 'full' },
  { id: 'chart', label: 'System Overview Chart', visible: true, size: 'small' },
  { id: 'temperature', label: 'Temperature Monitoring', visible: true, size: 'medium' },
  { id: 'hospitals', label: 'Partnered Hospitals', visible: true, size: 'small' },
];

const SIZE_OPTIONS = [
  { value: 'small', label: 'Small', cols: 1 },
  { value: 'medium', label: 'Medium', cols: 2 },
  { value: 'large', label: 'Large', cols: 3 },
  { value: 'full', label: 'Full Width', cols: 4 },
];

function loadWidgets() {
  try {
    const saved = localStorage.getItem('invora-dashboard-widgets');
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_WIDGETS;
}

function saveWidgets(widgets) {
  localStorage.setItem('invora-dashboard-widgets', JSON.stringify(widgets));
}

// ─── Widget Components ────────────────────────
function StatsWidget() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {overviewData.map(item => (
        <Card key={item.name} className="border-none shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{item.name}</p>
                <p className="text-3xl font-bold mt-1">{item.value}</p>
              </div>
              <div className={`h-12 w-12 rounded-xl ${item.bg} flex items-center justify-center`}>
                <item.icon className={`h-6 w-6 ${item.text}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ChartWidget() {
  return (
    <Card className="border-none shadow-sm h-full">
      <CardHeader><CardTitle className="text-base">System Overview</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
              {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Pie>
            <Tooltip />
            <Legend iconType="circle" iconSize={8} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function TemperatureWidget() {
  const [tempData, setTempData] = useState({ temp: 5.2, lastUpdate: Date.now(), safe: true });
  const [bbData, setBbData] = useState({ temp: 3.8, lastUpdate: Date.now(), safe: true });
  const [timeSinceUpdate, setTimeSinceUpdate] = useState(0);
  const [timeSinceBB, setTimeSinceBB] = useState(0);

  const alarmRef = useRef(null);
  const isPlayingRef = useRef(false);

  // Initialize alarm once
  useEffect(() => {
    alarmRef.current = new Audio("/alarm.mp3");
    alarmRef.current.loop = true;
  }, []);

  const playAlarm = async () => {
    if (!alarmRef.current || isPlayingRef.current) return;

    try {
      await alarmRef.current.play();
      isPlayingRef.current = true;
    } catch (err) {
      // autoplay blocked
    }
  };

  const stopAlarm = () => {
    if (!alarmRef.current) return;

    alarmRef.current.pause();
    alarmRef.current.currentTime = 0;
    isPlayingRef.current = false;
  };

  // Unlock audio on first user click (Chrome autoplay policy fix)
  useEffect(() => {
    const unlockAudio = async () => {
      if (!alarmRef.current) return;

      try {
        await alarmRef.current.play();
        alarmRef.current.pause();
        alarmRef.current.currentTime = 0;
      } catch {}

      window.removeEventListener("click", unlockAudio);
    };

    window.addEventListener("click", unlockAudio);
  }, []);

  // useEffect(() => {
  //   const fetchSensors = async () => {
  //     try {
  //       const icuRes = await axios.get(
  //         // "http://localhost:3000/api/sensors/latest/ICU_SENSOR"
  //         "https://invora-qkwq.onrender.com/api/sensors/latest/ICU_SENSOR"
  //       );

  //       const bbRes = await axios.get(
  //         // "http://localhost:3000/api/sensors/latest/BLOOD_SENSOR"
  //         "https://invora-qkwq.onrender.com/api/sensors/latest/BLOOD_SENSOR"
  //       );

  //       if (icuRes.data) {
  //         setTempData({
  //           temp: icuRes.data.tempC,
  //           lastUpdate: new Date(icuRes.data.timestamp).getTime(),
  //           safe: icuRes.data.status === "SAFE"
  //         });
  //       }

  //       if (bbRes.data) {
  //         setBbData({
  //           temp: bbRes.data.tempC,
  //           lastUpdate: new Date(bbRes.data.timestamp).getTime(),
  //           safe: bbRes.data.status === "SAFE"
  //         });
  //       }

  //     } catch (err) {
  //       console.log("Sensor fetch error");
  //     }
  //   };

  //   fetchSensors();
  //   // const interval = setInterval(fetchSensors, 5000);
  //   const interval = setInterval(() => {
  //     fetchSensors();
  //   }, 5000);

  //   return () => clearInterval(interval);
  // }, []);

  useEffect(() => {
    let interval;

    const fetchSensors = async () => {
      try {
        const icuRes = await axios.get(
          "https://invora-qkwq.onrender.com/api/sensors/latest/ICU_SENSOR"
        );

        const bbRes = await axios.get(
          "https://invora-qkwq.onrender.com/api/sensors/latest/BLOOD_SENSOR"
        );

        if (icuRes.data) {
          setTempData({
            temp: icuRes.data.tempC,
            lastUpdate: new Date(icuRes.data.timestamp).getTime(),
            safe: icuRes.data.status === "SAFE"
          });
        }

        if (bbRes.data) {
          setBbData({
            temp: bbRes.data.tempC,
            lastUpdate: new Date(bbRes.data.timestamp).getTime(),
            safe: bbRes.data.status === "SAFE"
          });
        }

      } catch (err) {
        console.log("Sensor fetch error");
      }
    };

    fetchSensors();

    interval = setInterval(fetchSensors, 10000);

    return () => clearInterval(interval);

  }, []);

  // useEffect(() => {
  //   const tick = setInterval(() => {
  //     setTimeSinceUpdate(Math.floor((Date.now() - tempData.lastUpdate) / 1000));
  //     setTimeSinceBB(Math.floor((Date.now() - bbData.lastUpdate) / 1000));
  //   }, 1000);
  //   return () => clearInterval(tick);
  // }, [tempData.lastUpdate, bbData.lastUpdate]);

  // const noData = timeSinceUpdate > 10;
  // const noDataBB = timeSinceBB > 10;

  // const isICUOffline = Date.now() - tempData.lastUpdate > 10000;
  // const isBBOffline = Date.now() - bbData.lastUpdate > 10000;

  
  // const shouldAlarm = isICUOffline || isBBOffline;
  const [shouldAlarm, setShouldAlarm] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const icuOffline = Date.now() - tempData.lastUpdate > 10000;
      const bbOffline = Date.now() - bbData.lastUpdate > 10000;

      setShouldAlarm(icuOffline || bbOffline);
    }, 1000);

    return () => clearInterval(interval);

  }, [tempData.lastUpdate, bbData.lastUpdate]);

  useEffect(() => {
    if (shouldAlarm) {
      playAlarm();
    } else {
      stopAlarm();
    }
  }, [shouldAlarm]);

  useEffect(() => {
    return () => stopAlarm();
  }, []);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     const temp = parseFloat((Math.random() * 10).toFixed(1));
  //     setTempData({ temp, lastUpdate: Date.now(), safe: temp >= 2 && temp <= 8 });
  //   }, 8000);
  //   return () => clearInterval(interval);
  // }, []);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     const temp = parseFloat((Math.random() * 8).toFixed(1));
  //     setBbData({ temp, lastUpdate: Date.now(), safe: temp >= 2 && temp <= 6 });
  //   }, 10000);
  //   return () => clearInterval(interval);
  // }, []);

  useEffect(() => {
    const tick = setInterval(() => {
      setTimeSinceUpdate(Math.floor((Date.now() - tempData.lastUpdate) / 1000));
      setTimeSinceBB(Math.floor((Date.now() - bbData.lastUpdate) / 1000));
    }, 1000);
    return () => clearInterval(tick);
  }, [tempData.lastUpdate, bbData.lastUpdate]);

  const noData = timeSinceUpdate > 10;
  const noDataBB = timeSinceBB > 10;

  return (
    <Card className="border-none shadow-sm h-full">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Thermometer className="h-5 w-5" /> Temperature Monitoring
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className={`flex flex-col items-center p-4 rounded-xl bg-secondary ${noData ? 'ring-2 ring-unsafe' : ''}`}>
            <p className="text-sm font-semibold mb-3">ICU</p>
            {noData ? (
              <div className="text-center space-y-1">
                <AlertTriangle className="h-10 w-10 text-unsafe mx-auto" />
                <p className="text-unsafe font-bold">NO DATA</p>
                <p className="text-muted-foreground text-xs">No data for {timeSinceUpdate}s</p>
              </div>
            ) : (
              <>
                <div className={`h-20 w-20 rounded-full flex items-center justify-center text-xl font-bold ${tempData.safe ? 'bg-stat-green-light text-stat-green' : 'bg-stat-coral-light text-stat-coral'}`}>
                  {tempData.temp}°C
                </div>
                <div className={`mt-3 px-3 py-1 rounded-full text-xs font-semibold ${tempData.safe ? 'bg-stat-green-light text-stat-green' : 'bg-stat-coral-light text-stat-coral'}`}>
                  {tempData.safe ? '✓ SAFE (2–8°C)' : '✗ UNSAFE'}
                </div>
                <p className="text-muted-foreground text-[10px] mt-1">Updated {timeSinceUpdate}s ago</p>
              </>
            )}
          </div>
          <div className={`flex flex-col items-center p-4 rounded-xl bg-secondary ${noDataBB ? 'ring-2 ring-unsafe' : ''}`}>
            <p className="text-sm font-semibold mb-3">Blood Bank</p>
            {noDataBB ? (
              <div className="text-center space-y-1">
                <AlertTriangle className="h-10 w-10 text-unsafe mx-auto" />
                <p className="text-unsafe font-bold">NO DATA</p>
                <p className="text-muted-foreground text-xs">No data for {timeSinceBB}s</p>
              </div>
            ) : (
              <>
                <div className={`h-20 w-20 rounded-full flex items-center justify-center text-xl font-bold ${bbData.safe ? 'bg-stat-green-light text-stat-green' : 'bg-stat-coral-light text-stat-coral'}`}>
                  {bbData.temp}°C
                </div>
                <div className={`mt-3 px-3 py-1 rounded-full text-xs font-semibold ${bbData.safe ? 'bg-stat-green-light text-stat-green' : 'bg-stat-coral-light text-stat-coral'}`}>
                  {bbData.safe ? '✓ SAFE (2–6°C)' : '✗ UNSAFE'}
                </div>
                <p className="text-muted-foreground text-[10px] mt-1">Updated {timeSinceBB}s ago</p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function HospitalsWidget() {
  return (
    <Card className="border-none shadow-sm h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Partnered Hospitals</CardTitle>
        <Wifi className="h-4 w-4 text-stat-green" />
      </CardHeader>
      <CardContent className="space-y-3">
        {partneredHospitals.map(h => (
          <div key={h.name} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
            <div>
              <p className="text-sm font-medium">{h.name}</p>
              <p className="text-xs text-muted-foreground">{h.beds} beds</p>
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${h.status === 'Connected' ? 'bg-stat-green-light text-stat-green' : 'bg-stat-yellow-light text-stat-yellow'}`}>
              {h.status}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

const WIDGET_COMPONENTS = {
  stats: StatsWidget,
  chart: ChartWidget,
  temperature: TemperatureWidget,
  hospitals: HospitalsWidget,
};

// ─── Main Dashboard ───────────────────────────
export default function Dashboard() {
  const [widgets, setWidgets] = useState(loadWidgets);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  useEffect(() => {
    console.log("Dashboard mounted");
  }, []);

  useEffect(() => { saveWidgets(widgets); }, [widgets]);

  const toggleVisibility = (id) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, visible: !w.visible } : w));
  };

  const changeSize = (id, size) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, size } : w));
  };

  const resetWidgets = () => {
    setWidgets(DEFAULT_WIDGETS);
  };

  // Drag handlers
  const handleDragStart = (e, idx) => {
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, idx) => {
    e.preventDefault();
    if (idx !== draggedIdx) setDragOverIdx(idx);
  };

  const handleDrop = (e, dropIdx) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === dropIdx) return;
    setWidgets(prev => {
      const next = [...prev];
      const [moved] = next.splice(draggedIdx, 1);
      next.splice(dropIdx, 0, moved);
      return next;
    });
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const colsClass = (size) => {
    switch (size) {
      case 'small': return 'lg:col-span-1';
      case 'medium': return 'lg:col-span-2';
      case 'large': return 'lg:col-span-3';
      case 'full': return 'lg:col-span-4';
      default: return 'lg:col-span-1';
    }
  };

  const visibleWidgets = widgets.filter(w => w.visible);
  const visibleCount = visibleWidgets.length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">System overview and real-time monitoring</p>
        </div>
        <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Settings2 className="h-4 w-4" /> Customize
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[380px] sm:w-[420px]">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" /> Customize Dashboard
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">{visibleCount} of {widgets.length} widgets visible</p>
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={resetWidgets}>
                  <RotateCcw className="h-3 w-3" /> Reset
                </Button>
              </div>
              <Separator />
              <div className="space-y-1 pt-2">
                {widgets.map((widget, idx) => (
                  <div
                    key={widget.id}
                    draggable
                    onDragStart={e => handleDragStart(e, idx)}
                    onDragOver={e => handleDragOver(e, idx)}
                    onDrop={e => handleDrop(e, idx)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      dragOverIdx === idx ? 'bg-primary/10 border-2 border-dashed border-primary' :
                      draggedIdx === idx ? 'opacity-40' : 'hover:bg-muted'
                    }`}
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{widget.label}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Select value={widget.size} onValueChange={v => changeSize(widget.id, v)}>
                          <SelectTrigger className="h-7 text-[11px] w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(widget.id === 'stats' ? SIZE_OPTIONS.filter(s => s.value === 'full') : SIZE_OPTIONS).map(s => (
                              <SelectItem key={s.value} value={s.value} className="text-xs">{s.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Switch
                      checked={widget.visible}
                      onCheckedChange={() => toggleVisibility(widget.id)}
                    />
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <p className="text-xs text-muted-foreground">
                Drag widgets to reorder. Use the toggle to show/hide and the dropdown to resize.
              </p>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {visibleWidgets.map(widget => {
          const Component = WIDGET_COMPONENTS[widget.id];
          if (!Component) return null;
          return (
            <div key={widget.id} className={`${colsClass(widget.size)} transition-all duration-300`}>
              <Component />
            </div>
          );
        })}
      </div>

      {visibleCount === 0 && (
        <div className="text-center py-20">
          <EyeOff className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="font-medium text-muted-foreground">All widgets are hidden</p>
          <p className="text-sm text-muted-foreground mt-1">Click "Customize" to enable widgets</p>
        </div>
      )}
    </div>
  );
}

// import React from 'react';
// import axios from 'axios';
// import { Building2, DoorOpen, Server, Package, Thermometer, AlertTriangle, Wifi } from 'lucide-react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
// import { useState, useEffect, useRef } from 'react';


// const overviewData = [
//   { name: 'Hospitals', value: 12, icon: Building2, color: 'hsl(142, 71%, 45%)', bg: 'bg-stat-green-light', text: 'text-stat-green' },
//   { name: 'Rooms', value: 48, icon: DoorOpen, color: 'hsl(45, 93%, 47%)', bg: 'bg-stat-yellow-light', text: 'text-stat-yellow' },
//   { name: 'Racks', value: 156, icon: Server, color: 'hsl(0, 84%, 60%)', bg: 'bg-stat-coral-light', text: 'text-stat-coral' },
//   { name: 'Bins', value: 624, icon: Package, color: 'hsl(210, 80%, 45%)', bg: 'bg-stat-blue-light', text: 'text-stat-blue' },
// ];

// const chartData = [
//   { name: 'Hospitals', value: 12, color: 'hsl(142, 71%, 45%)' },
//   { name: 'Rooms', value: 48, color: 'hsl(45, 93%, 47%)' },
//   { name: 'Racks', value: 156, color: 'hsl(0, 84%, 60%)' },
//   { name: 'Bins', value: 624, color: 'hsl(210, 80%, 45%)' },
// ];

// const partneredHospitals = [
//   { name: 'City General Hospital', status: 'Connected', beds: 320 },
//   { name: 'St. Mary\'s Medical Center', status: 'Connected', beds: 180 },
//   { name: 'Regional Health Campus', status: 'Syncing', beds: 450 },
//   { name: 'Metro Emergency Hospital', status: 'Connected', beds: 200 },
// ];

// const playAlarm = () => {
//   alarmSound.play().catch(() => {});
// };

// const stopAlarm = () => {
//   alarmSound.pause();
//   alarmSound.currentTime = 0;
// };

// export default function Dashboard() {
  // const [tempData, setTempData] = useState({ temp: 5.2, lastUpdate: Date.now(), safe: true });
  // const [bbData, setBbData] = useState({ temp: 3.8, lastUpdate: Date.now(), safe: true });
  // const [timeSinceUpdate, setTimeSinceUpdate] = useState(0);
  // const [timeSinceBB, setTimeSinceBB] = useState(0);

  // const alarmRef = useRef(null);
  // const isPlayingRef = useRef(false);

  // // Initialize alarm once
  // useEffect(() => {
  //   alarmRef.current = new Audio("/alarm.mp3");
  //   alarmRef.current.loop = true;
  // }, []);

  // const playAlarm = async () => {
  //   if (!alarmRef.current || isPlayingRef.current) return;

  //   try {
  //     await alarmRef.current.play();
  //     isPlayingRef.current = true;
  //   } catch (err) {
  //     // autoplay blocked
  //   }
  // };

  // const stopAlarm = () => {
  //   if (!alarmRef.current) return;

  //   alarmRef.current.pause();
  //   alarmRef.current.currentTime = 0;
  //   isPlayingRef.current = false;
  // };

  // // Unlock audio on first user click (Chrome autoplay policy fix)
  // useEffect(() => {
  //   const unlockAudio = async () => {
  //     if (!alarmRef.current) return;

  //     try {
  //       await alarmRef.current.play();
  //       alarmRef.current.pause();
  //       alarmRef.current.currentTime = 0;
  //     } catch {}

  //     window.removeEventListener("click", unlockAudio);
  //   };

  //   window.addEventListener("click", unlockAudio);
  // }, []);

  // useEffect(() => {
  //   const fetchSensors = async () => {
  //     try {
  //       const icuRes = await axios.get(
  //         "http://localhost:3000/api/sensors/latest/ICU_SENSOR"
  //       );

  //       const bbRes = await axios.get(
  //         "http://localhost:3000/api/sensors/latest/BLOOD_SENSOR"
  //       );

  //       if (icuRes.data) {
  //         setTempData({
  //           temp: icuRes.data.tempC,
  //           lastUpdate: new Date(icuRes.data.timestamp).getTime(),
  //           safe: icuRes.data.status === "SAFE"
  //         });
  //       }

  //       if (bbRes.data) {
  //         setBbData({
  //           temp: bbRes.data.tempC,
  //           lastUpdate: new Date(bbRes.data.timestamp).getTime(),
  //           safe: bbRes.data.status === "SAFE"
  //         });
  //       }

  //     } catch (err) {
  //       console.log("Sensor fetch error");
  //     }
  //   };

  //   fetchSensors();
  //   const interval = setInterval(fetchSensors, 5000);

  //   return () => clearInterval(interval);
  // }, []);

  // useEffect(() => {
  //   const tick = setInterval(() => {
  //     setTimeSinceUpdate(Math.floor((Date.now() - tempData.lastUpdate) / 1000));
  //     setTimeSinceBB(Math.floor((Date.now() - bbData.lastUpdate) / 1000));
  //   }, 1000);
  //   return () => clearInterval(tick);
  // }, [tempData.lastUpdate, bbData.lastUpdate]);

  // const noData = timeSinceUpdate > 10;
  // const noDataBB = timeSinceBB > 10;

  // const isICUOffline = Date.now() - tempData.lastUpdate > 10000;
  // const isBBOffline = Date.now() - bbData.lastUpdate > 10000;

  // const shouldAlarm = isICUOffline || isBBOffline;

  // useEffect(() => {
  //   if (shouldAlarm) {
  //     playAlarm();
  //   } else {
  //     stopAlarm();
  //   }
  // }, [shouldAlarm]);

  // useEffect(() => {
  //   return () => stopAlarm();
  // }, []);

//   return (
//     <div className="space-y-6 animate-fade-in">
//       <div>
//         <h1 className="text-2xl font-bold">Dashboard</h1>
//         <p className="text-muted-foreground text-sm">System overview and real-time monitoring</p>
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         {overviewData.map(item => (
//           <Card key={item.name} className="border-none shadow-sm">
//             <CardContent className="p-5">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-muted-foreground">{item.name}</p>
//                   <p className="text-3xl font-bold mt-1">{item.value}</p>
//                 </div>
//                 <div className={`h-12 w-12 rounded-xl ${item.bg} flex items-center justify-center`}>
//                   <item.icon className={`h-6 w-6 ${item.text}`} />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//         {/* Doughnut chart */}
//         <Card className="border-none shadow-sm lg:col-span-1">
//           <CardHeader>
//             <CardTitle className="text-base">System Overview</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={250}>
//               <PieChart>
//                 <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
//                   {chartData.map((entry, i) => (
//                     <Cell key={i} fill={entry.color} />
//                   ))}
//                 </Pie>
//                 <Tooltip />
//                 <Legend iconType="circle" iconSize={8} />
//               </PieChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>

//         {/* Temperature monitor - ICU & Blood Bank */}
//         <Card className="border-none shadow-sm lg:col-span-2">
//           <CardHeader>
//             <CardTitle className="text-base flex items-center gap-2">
//               <Thermometer className="h-5 w-5" /> Temperature Monitoring
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//               {/* ICU */}
//               <div className={`flex flex-col items-center p-4 rounded-xl bg-secondary ${noData ? 'ring-2 ring-unsafe animate-pulse' : ''}`}>
//                 <p className="text-sm font-semibold mb-3">ICU</p>
//                 {noData ? (
//                   <div className="text-center space-y-1">
//                     <AlertTriangle className="h-10 w-10 text-unsafe mx-auto" />
//                     {/* <p className="text-unsafe font-bold">NO DATA</p> */}
//                     <p className="text-unsafe font-bold">
//                       SENSOR FAILURE
//                     </p>
//                     <p className="text-muted-foreground text-xs">
//                       No signal for {timeSinceUpdate}s
//                     </p>
//                     <p className="text-muted-foreground text-xs">No data for {timeSinceUpdate}s</p>
//                     {/* <p className="text-unsafe font-bold">
//                       SENSOR FAILURE
//                     </p>
//                     <p className="text-muted-foreground text-xs">
//                       No signal for {timeSinceBB}s
//                     </p> */}
//                   </div>
//                 ) : (
//                   <>
//                     <div className={`h-20 w-20 rounded-full flex items-center justify-center text-xl font-bold ${tempData.safe ? 'bg-stat-green-light text-stat-green animate-pulse-safe' : 'bg-stat-coral-light text-stat-coral'}`}>
//                       {tempData.temp}°C
//                     </div>
//                     <div className={`mt-3 px-3 py-1 rounded-full text-xs font-semibold ${tempData.safe ? 'bg-stat-green-light text-stat-green' : 'bg-stat-coral-light text-stat-coral'}`}>
//                       {tempData.safe ? '✓ SAFE (2–8°C)' : '✗ UNSAFE'}
//                     </div>
//                     <p className="text-muted-foreground text-[10px] mt-1">Updated {timeSinceUpdate}s ago</p>
//                   </>
//                 )}
//               </div>
//               {/* Blood Bank */}
//               <div className={`flex flex-col items-center p-4 rounded-xl bg-secondary ${noDataBB ? 'ring-2 ring-unsafe animate-pulse' : ''}`}>
//                 <p className="text-sm font-semibold mb-3">Blood Bank</p>
//                 {noDataBB ? (
//                   <div className="text-center space-y-1">
//                     <AlertTriangle className="h-10 w-10 text-unsafe mx-auto" />
//                     {/* <p className="text-unsafe font-bold">NO DATA</p> */}
//                     <p className="text-unsafe font-bold">
//                       SENSOR FAILURE
//                     </p>
//                     <p className="text-muted-foreground text-xs">
//                       No signal for {timeSinceBB}s
//                     </p>
//                     <p className="text-muted-foreground text-xs">No data for {timeSinceBB}s</p>
//                   </div>
//                 ) : (
//                   <>
//                     <div className={`h-20 w-20 rounded-full flex items-center justify-center text-xl font-bold ${bbData.safe ? 'bg-stat-green-light text-stat-green animate-pulse-safe' : 'bg-stat-coral-light text-stat-coral'}`}>
//                       {bbData.temp}°C
//                     </div>
//                     <div className={`mt-3 px-3 py-1 rounded-full text-xs font-semibold ${bbData.safe ? 'bg-stat-green-light text-stat-green' : 'bg-stat-coral-light text-stat-coral'}`}>
//                       {bbData.safe ? '✓ SAFE (2–8°C)' : '✗ UNSAFE'}
//                     </div>
//                     <p className="text-muted-foreground text-[10px] mt-1">Updated {timeSinceBB}s ago</p>
//                   </>
//                 )}
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Partnered Hospitals */}
//         <Card className="border-none shadow-sm lg:col-span-1">
//           <CardHeader className="flex flex-row items-center justify-between">
//             <CardTitle className="text-base">Partnered Hospitals</CardTitle>
//             <Wifi className="h-4 w-4 text-stat-green" />
//           </CardHeader>
//           <CardContent className="space-y-3">
//             {partneredHospitals.map(h => (
//               <div key={h.name} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
//                 <div>
//                   <p className="text-sm font-medium">{h.name}</p>
//                   <p className="text-xs text-muted-foreground">{h.beds} beds</p>
//                 </div>
//                 <span className={`text-xs font-medium px-2 py-1 rounded-full ${h.status === 'Connected' ? 'bg-stat-green-light text-stat-green' : 'bg-stat-yellow-light text-stat-yellow'}`}>
//                   {h.status}
//                 </span>
//               </div>
//             ))}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }
