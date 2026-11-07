export interface ServiceBellStatus {
  globalEnabled: boolean;
  tableEnabled: boolean;
  cooldownSeconds?: number;
}

export interface ServiceCallRequest {
  tableCode: string;
  type: 'WATER' | 'UTENSILS' | 'CLEAN' | 'ASSIST' | 'OTHER';
  note?: string;
}