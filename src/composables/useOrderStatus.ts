import { useI18n } from 'vue-i18n';

export const useOrderStatus = () => {
  const { t } = useI18n();
  const getStatusEmoji = (status: string): string => {
    switch (status) {
      case 'PENDING_PAYMENT': return '⏳';
      case 'COOKING': return '🍳';
      case 'COMPLETED': return '🎉';
      case 'CANCELLED': return '❌';
      default: return '📋';
    }
  };

  const getStatusTitle = (status: string, paymentStatus: string): string => {
    if (status === 'COMPLETED') return t('status.completedTitle');
    if (status === 'COOKING') return t('status.cookingTitle');
    if (status === 'CANCELLED') return t('status.cancelledTitle');
    if (paymentStatus === 'PAID') return t('status.paidTitle');
    return t('status.pendingPaymentTitle');
  };

  const getStatusDesc = (status: string, paymentStatus: string, paymentMethod: string): string => {
    if (status === 'COMPLETED') return t('status.completedDesc');
    if (status === 'COOKING') return t('status.cookingDesc');
    if (paymentStatus === 'UNPAID') {
      return paymentMethod === 'ONLINE'
        ? t('status.unpaidOnlineDesc')
        : t('status.unpaidCashDesc');
    }
    return t('status.defaultDesc');
  };

  const getStepIndex = (status: string, paymentStatus: string): number => {
    if (status === 'COMPLETED') return 3;
    if (status === 'COOKING') return 2;
    if (paymentStatus === 'PAID') return 1;
    return 1;
  };

  return { getStatusEmoji, getStatusTitle, getStatusDesc, getStepIndex };
};
