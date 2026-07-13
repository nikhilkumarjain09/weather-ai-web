"use client";

import React, { useRef, useEffect, useState } from "react";
import { usePreferencesStore } from "@/store/preferencesStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useSettingsStore } from "@/store/settingsStore";
import { Map, MapPin, RefreshCw } from "lucide-react";

interface WeatherMapProps {
  lat: number;
  lon: number;
}

export default function WeatherMap({ lat, lon }: WeatherMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { mapPreference, setMapPreference } = usePreferencesStore();
  const { addSavedLocation } = useFavoritesStore();
  const { showToast } = useSettingsStore();

  const [radarSpeed, setRadarSpeed] = useState(1);
  const [clickCoords, setClickCoords] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;
    let pulseRadius = 10;
    let growing = true;

    // Heatmap particles for visual flair
    const particles = Array.from({ length: 15 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 20 + Math.random() * 40,
      opacity: 0.1 + Math.random() * 0.3,
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw Grid Lines
      ctx.strokeStyle = "var(--border)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      
      const spacing = 40;
      for (let x = 0; x < canvas.width; x += spacing) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
      }
      for (let y = 0; y < canvas.height; y += spacing) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
      }
      ctx.stroke();

      // 2. Draw Layer Overlays
      if (mapPreference === "radar") {
        // Render precipitation radar sweeps (greenish sweeps)
        ctx.strokeStyle = "rgba(45, 212, 191, 0.4)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, canvas.height / 2);
        
        const scanX = canvas.width / 2 + Math.cos(angle) * 150;
        const scanY = canvas.height / 2 + Math.sin(angle) * 150;
        ctx.lineTo(scanX, scanY);
        ctx.stroke();

        // Radar circular sweeps
        ctx.strokeStyle = "rgba(45, 212, 191, 0.15)";
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 40, 0, Math.PI * 2);
        ctx.arc(canvas.width / 2, canvas.height / 2, 80, 0, Math.PI * 2);
        ctx.arc(canvas.width / 2, canvas.height / 2, 120, 0, Math.PI * 2);
        ctx.stroke();

        angle += 0.02 * radarSpeed;
      } else {
        // Temperature Thermal Overlay (red/orange/blue heatmap spots)
        particles.forEach((p) => {
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
          grad.addColorStop(0, `rgba(239, 68, 68, ${p.opacity})`);
          grad.addColorStop(0.5, `rgba(245, 158, 11, ${p.opacity * 0.4})`);
          grad.addColorStop(1, "rgba(239, 68, 68, 0)");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 3. Draw Target Pinned Marker
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Pulsing marker ring
      ctx.strokeStyle = "var(--accent)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
      ctx.stroke();

      if (growing) {
        pulseRadius += 0.3;
        if (pulseRadius >= 20) growing = false;
      } else {
        pulseRadius -= 0.3;
        if (pulseRadius <= 8) growing = true;
      }

      // Center Pin DOT
      ctx.fillStyle = "var(--accent)";
      ctx.beginPath();
      ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
      ctx.fill();

      // 4. Draw click coordinate target marker if selected
      if (clickCoords) {
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(canvas.width - 50, canvas.height - 50, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [mapPreference, radarSpeed, clickCoords]);

  // Click on map to fetch custom coordinates
  const handleMapClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Translate click relative to grid offsets
    const latOffset = ((canvas.height / 2 - y) / 10).toFixed(4);
    const lonOffset = ((x - canvas.width / 2) / 10).toFixed(4);

    const targetLat = parseFloat((lat + parseFloat(latOffset)).toFixed(4));
    const targetLon = parseFloat((lon + parseFloat(lonOffset)).toFixed(4));

    setClickCoords({ lat: targetLat, lon: targetLon });
    showToast(`Registered target station: ${targetLat}, ${targetLon}`, "info");
  };

  const handleRegisterNode = () => {
    if (!clickCoords) return;
    addSavedLocation({
      name: `Custom Map Node (${clickCoords.lat.toFixed(2)}, ${clickCoords.lon.toFixed(2)})`,
      lat: clickCoords.lat,
      lon: clickCoords.lon,
      isDefault: false,
    });
    showToast("Map coordinates saved to location list", "success");
    setClickCoords(null);
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-5 md:p-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h3 className="font-display text-base font-bold text-text-primary flex items-center gap-2">
            <Map size={18} className="text-accent" />
            Interactive Weather Layers
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Click grid coordinates to register localized meteorological telemetry points.
          </p>
        </div>

        {/* Map Preferences Toggle */}
        <div className="flex bg-surface-raised p-0.5 rounded border border-border">
          <button
            onClick={() => setMapPreference("radar")}
            className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-colors ${
              mapPreference === "radar" ? "bg-accent-tint text-accent" : "text-text-muted"
            }`}
          >
            Precip Radar
          </button>
          <button
            onClick={() => setMapPreference("temperature")}
            className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-colors ${
              mapPreference === "temperature" ? "bg-accent-tint text-accent" : "text-text-muted"
            }`}
          >
            Thermal Heat
          </button>
        </div>
      </div>

      <div className="relative border border-border rounded-lg overflow-hidden bg-bg">
        <canvas
          ref={canvasRef}
          width={450}
          height={200}
          onClick={handleMapClick}
          className="w-full h-auto cursor-crosshair block"
        />

        {/* Floating details overlay */}
        <div className="absolute bottom-3 left-3 bg-surface/90 border border-border p-2 rounded text-[10px] font-mono text-text-muted backdrop-blur-sm">
          <span className="block font-semibold text-text-primary uppercase tracking-wider mb-0.5">
            Target Focus
          </span>
          <span>
            {lat.toFixed(3)}°N, {lon.toFixed(3)}°W
          </span>
        </div>

        {mapPreference === "radar" && (
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <button
              onClick={() => setRadarSpeed((prev) => (prev === 1 ? 2.5 : prev === 2.5 ? 0.4 : 1))}
              className="bg-surface/90 border border-border px-2 py-1 rounded text-[9px] font-bold font-mono text-accent hover:bg-surface-raised transition-colors uppercase flex items-center gap-1"
            >
              <RefreshCw size={8} className="animate-spin" />
              Scan: {radarSpeed === 1 ? "Normal" : radarSpeed > 1 ? "Fast" : "Slow"}
            </button>
          </div>
        )}
      </div>

      {clickCoords && (
        <div className="mt-3 flex items-center justify-between bg-accent-tint/30 border border-accent/20 p-2.5 rounded-lg text-xs animate-slide-in">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-accent" />
            <span className="font-medium text-text-primary">
              Target node: {clickCoords.lat.toFixed(3)}°, {clickCoords.lon.toFixed(3)}°
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRegisterNode}
              className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-accent text-bg hover:bg-accent/90 rounded transition-colors"
            >
              Save Location
            </button>
            <button
              onClick={() => setClickCoords(null)}
              className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-surface-raised border border-border text-text-muted hover:text-text-primary rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
