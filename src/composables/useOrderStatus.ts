export const useOrderStatus = () => {
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
    if (status === 'COMPLETED') return '餐點製作完成！';
    if (status === 'COOKING') return '大廚精心烹調中...';
    if (status === 'CANCELLED') return '訂單已取消';
    if (paymentStatus === 'PAID') return '已確認收款，準備製作';
    return '訂單已送出，等待付款';
  };

  const getStatusDesc = (status: string, paymentStatus: string, paymentMethod: string): string => {
    if (status === 'COMPLETED') return '餐點已準備好，請至取餐櫃檯領取或等候送餐！';
    if (status === 'COOKING') return '廚房已接單並全力準備您的美味餐點，請稍候片刻。';
    if (paymentStatus === 'UNPAID') {
      return paymentMethod === 'ONLINE'
        ? '請點擊下方按鈕完成線上付款，付款成功後將立即製作。'
        : '請至櫃檯現場結帳，店員確認收款後將立即製作。';
    }
    return '感謝您的訂購，我們正為您處理中。';
  };

  const getStepIndex = (status: string, paymentStatus: string): number => {
    if (status === 'COMPLETED') return 3;
    if (status === 'COOKING') return 2;
    if (paymentStatus === 'PAID') return 1;
    return 1;
  };

  return { getStatusEmoji, getStatusTitle, getStatusDesc, getStepIndex };
};
