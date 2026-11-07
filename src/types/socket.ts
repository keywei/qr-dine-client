export type NetworkStatus = 'connected' | 'disconnected';

export interface CustomSocketStatus {
  status: NetworkStatus;
}

declare global {
  interface WindowEventMap {
    'socket:status': CustomEvent<CustomSocketStatus>;
  }
}
