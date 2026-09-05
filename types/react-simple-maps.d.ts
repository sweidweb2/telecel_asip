declare module "react-simple-maps" {
  import type { ComponentType, CSSProperties, ReactNode, SVGProps } from "react";

  export type ProjectionConfig = {
    scale?: number;
    center?: [number, number];
    rotate?: [number, number, number];
  };

  export type ComposableMapProps = SVGProps<SVGSVGElement> & {
    projection?: string;
    projectionConfig?: ProjectionConfig;
    width?: number;
    height?: number;
  };

  export type ZoomableGroupProps = {
    center?: [number, number];
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    translateExtent?: [[number, number], [number, number]];
    filterZoomEvent?: (event: Event) => boolean;
    onMoveStart?: (...args: unknown[]) => void;
    onMove?: (...args: unknown[]) => void;
    onMoveEnd?: (...args: unknown[]) => void;
    className?: string;
    style?: CSSProperties;
    children?: ReactNode;
  };

  export type GeographyType = {
    rsmKey: string;
    id?: string | number;
    svgPath: string;
    properties: Record<string, unknown>;
  };

  export type GeographiesProps = {
    geography: string | object;
    children: (data: {
      geographies: GeographyType[];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      outline?: any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      borders?: any;
    }) => ReactNode;
    parseGeographies?: (features: unknown[]) => unknown[];
  };

  export type GeographyProps = {
    geography: GeographyType;
    style?: {
      default?: CSSProperties;
      hover?: CSSProperties;
      pressed?: CSSProperties;
    };
    className?: string;
    onMouseEnter?: (...args: unknown[]) => void;
    onMouseLeave?: (...args: unknown[]) => void;
    onClick?: (...args: unknown[]) => void;
  };

  export const ComposableMap: ComponentType<ComposableMapProps>;
  export const ZoomableGroup: ComponentType<ZoomableGroupProps>;
  export const Geographies: ComponentType<GeographiesProps>;
  export const Geography: ComponentType<GeographyProps>;
}
