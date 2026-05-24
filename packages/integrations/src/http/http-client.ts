export type HttpClientOptions = {
  baseUrl: string;
  headers?: Record<string, string>;
};

export async function httpJson<T>(
  url: string,
  init?: RequestInit & { headers?: Record<string, string> },
): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message ?? `HTTP ${res.status} for ${url}`,
    );
  }
  return res.json() as Promise<T>;
}
