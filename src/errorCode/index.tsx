import type { AxiosError } from 'axios';
import type { ApiResponse } from '@/types/api';

import error400 from './400';
import error500 from './500';
import error1000 from './1000';
import error2000 from './2000';

const DEAFAULT_CODE = -1;

export const ERROR_MESSAGES: Record<number, string> = {
	'-1': '未提供錯誤代碼',
	...error400,
	...error500,
	...error1000,
	...error2000
};

export const codeToMessage = <T extends ApiResponse>(error: AxiosError<T>, code = DEAFAULT_CODE) => Object.assign(error, { message: ERROR_MESSAGES[code] || `code: ${code}` });
