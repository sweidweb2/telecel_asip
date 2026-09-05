"use client";

import { memo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";

import {
  HOME_MAP_GEOGRAPHY_URL,
  type MapFlipperSlide,
} from "@/constants/home-map-flipper-dummy";

type HomeMapCanvasProps = {
  slide: MapFlipperSlide;
};

/**
 * SVG map for one flipper slide. Client-only (loaded via next/dynamic).
 */
export const HomeMapCanvas = memo(function HomeMapCanvas({
  slide,
}: HomeMapCanvasProps) {
  const highlights = new Set(slide.highlightIds ?? []);

  return (
    <div className="overflow-hidden rounded-2xl bg-muted/40 ring-1 ring-border">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: slide.scale,
          center: slide.center,
        }}
        width={800}
        height={520}
        className="aspect-[4/3] h-auto w-full sm:aspect-[5/3]"
        style={{ width: "100%", height: "auto" }}
      >
        <Geographies geography={HOME_MAP_GEOGRAPHY_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const id = String(geo.id ?? "");
              const isHighlight = highlights.has(id);
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: {
                      fill: isHighlight ? "#179191" : "#d6d3d1",
                      fillOpacity: isHighlight ? 0.85 : 0.55,
                      stroke: "#fafaf9",
                      strokeWidth: 0.4,
                      outline: "none",
                    },
                    hover: {
                      fill: isHighlight ? "#0f7373" : "#c4c0bc",
                      fillOpacity: isHighlight ? 0.95 : 0.65,
                      stroke: "#fafaf9",
                      strokeWidth: 0.4,
                      outline: "none",
                    },
                    pressed: {
                      fill: isHighlight ? "#0f7373" : "#c4c0bc",
                      outline: "none",
                    },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
});
