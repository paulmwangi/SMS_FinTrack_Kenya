import { AxiosError } from 'axios';

export function getErrorMessage(err: unknown, fallback = 'An error occurred'): string {
  if (err instanceof AxiosError) {
    return err.response?.data?.error || err.message || fallback;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return fallback;
}
