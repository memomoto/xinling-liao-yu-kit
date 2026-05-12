/// <reference types="vite/client" />

declare module '*.md?raw' {
  const content: string;
  export default content;
}

export {};

declare global {
  interface Window {
    /** Loaded from jsDelivr by `loadMediapipeHandScripts`; shape is CDN-specific */
    Hands?: unknown;
    Camera?: unknown;
  }
}
