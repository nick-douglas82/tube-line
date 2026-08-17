import type { InjectionKey, ShallowRef } from "vue";
import type { Map } from "maplibre-gl";

export const tubeMapKey: InjectionKey<ShallowRef<Map | null>> = Symbol("tubeMap");
