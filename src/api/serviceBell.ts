import api from './index';

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

export const getServiceBellStatus = (tableCode: string) => {
  return api.get<ServiceBellStatus>(`/service-bell/status?table=${encodeURIComponent(tableCode)}`);
};

export const callServiceBell = (data: ServiceCallRequest) => {
  return api.post('/service-bell/call', data);
};

