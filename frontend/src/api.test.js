import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from './api';

describe('API empty responses', () => {
  afterEach(() => vi.restoreAllMocks());

  it('treats a successful empty delete response as success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: vi.fn().mockResolvedValue(''),
    }));

    await expect(api.deletePlace('pin-1')).resolves.toBeNull();
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/places/pin-1'), expect.objectContaining({ method: 'DELETE' }));
  });
});
