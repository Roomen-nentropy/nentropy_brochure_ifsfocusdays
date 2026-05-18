import { useEffect } from 'react';

interface ChatwootWindow extends Window {
  chatwootSDK?: {
    run: (config: { websiteToken: string; baseUrl: string }) => void;
  };
}

declare const window: ChatwootWindow;

export const LiveChat = () => {
  useEffect(() => {
    const script = document.createElement('script');
    const BASE_URL = 'https://app.chatwoot.com';

    script.src = `${BASE_URL}/packs/js/sdk.js`;
    script.async = true;

    script.onload = () => {
      if (window.chatwootSDK) {
        window.chatwootSDK.run({
          websiteToken: 'kHwKAgqbz1GRmZxJi6qbv1Ga',
          baseUrl: BASE_URL,
        });
      }
    };

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return null;
};
