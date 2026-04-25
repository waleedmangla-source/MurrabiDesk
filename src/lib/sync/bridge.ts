const BRAIN_URL = 'http://localhost:7780';
export const liquid = {
  async invoke(action: string, data: any = {}): Promise<any> {
    if (typeof window !== 'undefined' && (window as any).electron) {
        const electron = (window as any).electron;
        if (typeof electron[action] === 'function') {
            return electron[action](data);
        }
    }
    const isElectron = typeof window !== 'undefined' && navigator.userAgent.toLowerCase().indexOf('electron') > -1;
    const targetUrl = isElectron ? `${BRAIN_URL}/${action}` : `/api/brain/${action}`;
    const tokenHeader = typeof window !== 'undefined' ? localStorage.getItem('google_refresh_token_encrypted') : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (tokenHeader) headers['x-murrabi-token'] = tokenHeader;
    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(`Brain Error: ${response.status}`);
      return await response.json();
    } catch (err) {
      console.warn(`[LIQUID] Bridge failed for ${action}:`, err);
      return null;
    }
  }
};
