export const liquid = {
  async invoke(action: string, data: any = {}): Promise<any> {
    const targetUrl = `/api/brain/${action}`;
    const tokenHeader = typeof window !== 'undefined' ? localStorage.getItem('google_refresh_token_encrypted') : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (tokenHeader) headers['x-murrabi-token'] = tokenHeader;
    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Brain Error ${response.status}: ${errText}`);
      }
      return await response.json();
    } catch (err: any) {
      console.warn(`[LIQUID] Bridge failed for ${action}:`, err);
      return { error: err.message };
    }
  }
};
