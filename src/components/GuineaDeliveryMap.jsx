// src/components/stats/AboutStats/GuineaDeliveryMap.jsx
"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Line,
  Marker,
} from "react-simple-maps";

const GEO_URL = "https://unpkg.com/world-atlas@2/countries-110m.json";

const REGIONS = [
  { id: "boke", label: "Boké", coords: [-14.2967, 10.941] },
  { id: "conakry", label: "Conakry", coords: [-13.5784, 9.6412] },
  { id: "kindia", label: "Kindia", coords: [-12.865, 10.057] },
  { id: "labe", label: "Labé", coords: [-12.2833, 11.3182] },
  { id: "mamou", label: "Mamou", coords: [-12.091, 10.3763] },
  { id: "faranah", label: "Faranah", coords: [-10.7434, 10.0404] },
  { id: "nzerekore", label: "N'Zérékoré", coords: [-8.818, 7.7562] },
];

const HUB = {
  id: "kankan",
  label: "Kankan (Hub Central)",
  coords: [-9.3057, 10.3853],
};

export function GuineaDeliveryMap() {
  const uid = useId();
  const containerRef = useRef(null);
  const lineRefs = useRef({});
  const [linePaths, setLinePaths] = useState({});

  useEffect(() => {
    const paths = {};
    REGIONS.forEach((region) => {
      const el = lineRefs.current[region.id];
      if (el) paths[region.id] = el.getAttribute("d");
    });
    setLinePaths(paths);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-[85vh] min-h-[600px] w-full overflow-hidden bg-navy-950/80 rounded-3xl border border-white/10 shadow-2xl flex items-center justify-center"
    >
      {/* Texture de fond mécanique & effet de grille */}
      <div className="absolute inset-0 bg-[radial-gradient(#EA580C_1px,transparent_1px)] opacity-10 [background-size:20px_20px]" />

      <ComposableMap
        projection="geoMercator"
        // Scale plus grand (~5800) et centrage précis pour occuper toute la surface sans rogner
        projectionConfig={{ center: [-11.1, 10.1], scale: 5800 }}
        className="h-full w-full object-cover"
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies
              .filter((geo) => geo.properties.name === "Guinea")
              .map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#1E293B"
                  fillOpacity={0.6}
                  stroke="#EA580C"
                  strokeOpacity={0.35}
                  strokeWidth={1.5}
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none", fill: "#334155" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
          }
        </Geographies>

        {/* Chaînes de livraison Kankan -> Régions */}
        {REGIONS.map((region, i) => (
          <Line
            key={region.id}
            ref={(el) => {
              if (el) lineRefs.current[region.id] = el;
            }}
            from={HUB.coords}
            to={region.coords}
            stroke="#EA580C"
            strokeWidth={2}
            strokeOpacity={0.8}
            strokeLinecap="round"
            strokeDasharray="8 10"
            style={{
              animation: `${uid}-flow ${3.5 + i * 0.3}s linear infinite`,
            }}
          />
        ))}

        {/* Particules en mouvement */}
        {Object.entries(linePaths).map(([id, d], i) => (
          <circle
            key={id}
            r={4.5}
            fill="#FB923C"
            className="drop-shadow-[0_0_8px_#EA580C]"
          >
            <animateMotion
              dur={`${3.2 + i * 0.3}s`}
              repeatCount="indefinite"
              path={d}
            />
          </circle>
        ))}

        {/* Marqueurs des villes destination */}
        {REGIONS.map((region, i) => (
          <Marker key={region.id} coordinates={region.coords}>
            <circle
              r={7}
              fill="none"
              stroke="#EA580C"
              strokeWidth={2}
              style={{
                animation: `${uid}-pulse 2.4s ease-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
            <circle r={4.5} fill="#0F172A" stroke="#EA580C" strokeWidth={1.5} />
            <text
              textAnchor="middle"
              y={-14}
              fontSize={11}
              fontWeight={700}
              fill="#F8FAFC"
              className="drop-shadow-md select-none"
            >
              {region.label}
            </text>
          </Marker>
        ))}

        {/* Marqueur du Hub Kankan */}
        <Marker coordinates={HUB.coords}>
          <circle
            r={14}
            fill="none"
            stroke="#EA580C"
            strokeWidth={2}
            style={{ animation: `${uid}-pulse-hub 2s ease-out infinite` }}
          />
          <circle
            r={8}
            fill="#EA580C"
            className="drop-shadow-[0_0_12px_#EA580C]"
          />
          <text
            textAnchor="middle"
            y={-20}
            fontSize={13}
            fontWeight={900}
            fill="#EA580C"
            className="uppercase tracking-wider drop-shadow-lg select-none"
          >
            {HUB.label}
          </text>
        </Marker>
      </ComposableMap>

      {/* Styles d'animation CSS */}
      <style jsx>{`
        @keyframes ${uid}-flow {
          from {
            stroke-dashoffset: 36;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes ${uid}-pulse {
          0% {
            r: 6;
            opacity: 1;
          }
          100% {
            r: 22;
            opacity: 0;
          }
        }
        @keyframes ${uid}-pulse-hub {
          0% {
            r: 12;
            opacity: 0.9;
          }
          100% {
            r: 35;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
