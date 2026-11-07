import type { ServiceBellStatus, ServiceCallRequest } from '@/types/service';
import api from './index';




export const getServiceBellStatus = (tableCode: string) => {
  return api.get<ServiceBellStatus>(`/service-bell/status?table=${encodeURIComponent(tableCode)}`);
};

export const callServiceBell = (data: ServiceCallRequest) => {
  return api.post('/service-bell/call', data);
};

