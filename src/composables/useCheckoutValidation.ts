import { ref, computed } from 'vue';
import { validateField, type CheckoutFormField, type CheckoutFormInput } from '@/utils/validation';

export function useCheckoutValidation(getInput: () => CheckoutFormInput) {
  const errors = ref<Record<CheckoutFormField, string>>({
    customerPhone: '',
    customerNote: '',
    taxId: '',
    invoiceCarrier: '',
  });

  const timers: Partial<Record<CheckoutFormField, ReturnType<typeof setTimeout>>> = {};

  const validate = (field: CheckoutFormField) => {
    errors.value[field] = validateField(field, getInput());
  };

  const onKeyin = (field: CheckoutFormField) => {
    if (timers[field]) clearTimeout(timers[field]);
    timers[field] = setTimeout(() => validate(field), 300);
  };

  const onBlur = (field: CheckoutFormField) => {
    if (timers[field]) clearTimeout(timers[field]);
    validate(field);
  };

  const hasErrors = computed(() => Object.values(errors.value).some((msg) => !!msg));
  const isSubmitDisabled = computed(() => {
    if (hasErrors.value) return true;
    const input = getInput();
    if (input.diningType === 'TAKEOUT' && !input.customerPhone?.trim()) return true;
    return false;
  });

  return { errors, onKeyin, onBlur, hasErrors, isSubmitDisabled };
}
