// types/global.d.ts
import { TronLinkProvider } from '@tronweb3/tronwallet-adapter-tronlink';

declare global {
  interface Window {
    tronLink?: TronLinkProvider & {
      tronWeb: {
        trx: {
          sendTransaction: (options: {
            to: string;
            amount: number;
            from?: string;
          }) => Promise<{ result: boolean; txid: string }>;
          getBalance: (address: string) => Promise<string>;
        };
      };
    };
  }
}