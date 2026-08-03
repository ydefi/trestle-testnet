/// <reference types="vite/client" />

<<<<<<< HEAD
interface Window {
  Telegram?: {
    WebApp?: {
      ready: () => void;
      expand: () => void;
      close: () => void;
      MainButton: {
        text: string;
        show: () => void;
        hide: () => void;
        onClick: (cb: () => void) => void;
        setParams: (params: Record<string, string>) => void;
      };
      initData?: string;
      initDataUnsafe?: {
        user?: {
          id: number;
          first_name: string;
          last_name?: string;
          username?: string;
        };
      };
      colorScheme?: string;
      themeParams?: Record<string, string>;
    };
  };
=======
interface ImportMetaEnv {
  readonly VITE_WALLETCONNECT_PROJECT_ID: string;
  readonly VITE_API_URL: string;
  readonly VITE_BLOCKSCOUT_API_KEY: string;
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
>>>>>>> 7c29aad (initial commit)
}
