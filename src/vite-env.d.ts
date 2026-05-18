/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_PLACES_API_KEY: string;
  /** Set to "true" to load Google Places autocomplete (requires API key). */
  readonly VITE_ENABLE_GOOGLE_PLACES?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
