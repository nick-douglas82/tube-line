import { h, render, type Component } from "vue";
import { Popup, type Map as MapLibreMap } from "maplibre-gl";

type Coordinates = [number, number];

type OpenMapInfoPopupOptions = {
  key: string;
  map: MapLibreMap;
  coordinates: Coordinates;
  component: Component;
  props?: Record<string, unknown>;
};

let popup: Popup | null = null;

let popupContent: HTMLDivElement | null = null;

let activePopupKey: string | null = null;

let activeMap: MapLibreMap | null = null;

const unmountContent = () => {
  if (popupContent) {
    render(null, popupContent);
  }

  popupContent = null;

  activePopupKey = null;
};

const close = () => {
  const currentPopup = popup;

  popup = null;
  activeMap = null;

  currentPopup?.remove();

  unmountContent();
};

const ensurePopup = (map: MapLibreMap, coordinates: Coordinates) => {
  if (popup && popupContent && activeMap === map) {
    return;
  }

  close();

  popupContent = document.createElement("div");

  const nextPopup = new Popup({
    closeButton: true,
    closeOnClick: true,
    maxWidth: "360px",
    offset: 12,
  })
    .setDOMContent(popupContent)
    .setLngLat(coordinates)
    .addTo(map);

  popup = nextPopup;
  activeMap = map;

  nextPopup.on("close", () => {
    if (popup !== nextPopup) {
      return;
    }

    popup = null;
    activeMap = null;

    unmountContent();
  });
};

const openComponent = (options: OpenMapInfoPopupOptions) => {
  ensurePopup(options.map, options.coordinates);

  if (!popup || !popupContent) {
    return;
  }

  activePopupKey = options.key;

  popup.setLngLat(options.coordinates);

  render(h(options.component, options.props ?? {}), popupContent);
};

const updateCoordinates = (key: string, coordinates: Coordinates) => {
  if (activePopupKey !== key) {
    return;
  }

  popup?.setLngLat(coordinates);
};

const isOpen = (key: string) => {
  return activePopupKey === key && popup !== null;
};

const closeKey = (key: string) => {
  if (activePopupKey !== key) {
    return;
  }

  close();
};

export const useMapInfoPopup = () => {
  return {
    openComponent,
    updateCoordinates,
    isOpen,
    closeKey,
    close,
  };
};
