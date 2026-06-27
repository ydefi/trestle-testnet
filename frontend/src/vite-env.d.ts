/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WALLETCONNECT_PROJECT_ID: string;
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace JSX {
  interface IntrinsicElements {
    "w3m-button": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    > & {
      size?: "sm" | "md";
      label?: string;
      loadingLabel?: string;
    };
  }
}
