export type RevenueOsActionError = {
  code:
    | 'invalid_input'
    | 'not_found'
    | 'database_error'
    | 'provider_error'
    | 'suppressed'
    | 'unauthorized'
    | 'unknown';
  message: string;
  detail?: unknown;
};

export type RevenueOsActionResult<T = null> =
  | {
      ok: true;
      data: T;
      message?: string;
    }
  | {
      ok: false;
      error: RevenueOsActionError;
    };

export function actionSuccess<T>(data: T, message?: string): RevenueOsActionResult<T> {
  return {
    ok: true,
    data,
    message,
  };
}

export function actionFailure(
  code: RevenueOsActionError['code'],
  message: string,
  detail?: unknown,
): RevenueOsActionResult<never> {
  return {
    ok: false,
    error: {
      code,
      message,
      ...(detail === undefined ? {} : { detail }),
    },
  };
}

export function unwrapActionResult<T>(result: RevenueOsActionResult<T>): T {
  if (result.ok) return result.data;
  throw new Error(`${result.error.code}: ${result.error.message}`);
}
