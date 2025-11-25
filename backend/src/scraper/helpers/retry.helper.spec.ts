import { retryWithBackoff, isRetryableError } from './retry.helper';

describe('RetryHelper', () => {
  describe('retryWithBackoff', () => {
    it('should return result on first success', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');

      const result = await retryWithBackoff(mockFn);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(new Error('timeout error'))
        .mockResolvedValue('success');

      const result = await retryWithBackoff(mockFn, {
        initialDelay: 10,
        maxAttempts: 3,
      });

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should throw error after max attempts', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('timeout error'));

      await expect(
        retryWithBackoff(mockFn, {
          initialDelay: 10,
          maxAttempts: 3,
        }),
      ).rejects.toThrow('timeout error');

      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should not retry on non-retryable errors', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Critical Error'));

      await expect(
        retryWithBackoff(mockFn, {
          initialDelay: 10,
          maxAttempts: 3,
          retryableErrors: ['timeout'],
        }),
      ).rejects.toThrow('Critical Error');

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should call onRetry callback', async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(new Error('timeout'))
        .mockResolvedValue('success');
      const onRetry = jest.fn();

      await retryWithBackoff(mockFn, {
        initialDelay: 10,
        onRetry,
      });

      expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
    });
  });

  describe('isRetryableError', () => {
    it('should return true for retryable errors', () => {
      expect(isRetryableError(new Error('Connection timeout'))).toBe(true);
      expect(isRetryableError(new Error('Network Error'))).toBe(true);
    });

    it('should return false for non-retryable errors', () => {
      expect(isRetryableError(new Error('Syntax Error'))).toBe(false);
    });
  });
});
