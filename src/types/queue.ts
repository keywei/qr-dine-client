export type QueueStatus = 'WAITING' | 'CALLING' | 'SEATED' | 'CANCELLED' | 'EXPIRED';

export interface QueueTicket {
  id: number;
  ticketNo: number;
  customerPhone: string;
  partySize: number;
  status: QueueStatus;
  callCount: number;
  calledAt?: string | null;
  seatedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QueueTicketDetail extends QueueTicket {
  currentCallingNo?: number | null;
  waitingCount?: number;
}

export interface QueueStatusResponse {
  ticket?: QueueTicket | null;
  currentCallingNo?: number | null;
  waitingCount: number;
}

export interface CreateQueueDTO {
  customerPhone: string;
  partySize: number;
}

export type QueueValidateResult<T, E = string> = { success: true; data: T } | { success: false; error: E };
