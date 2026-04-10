/**
 * Murrabi Desk — Liquid Bridge
 * Bridges Electron IPC and Native HTTP (Safari Mode)
 */

const BRAIN_URL = 'http://localhost:7780';

export const liquid = {
  async invoke(action: string, data: any = {}): Promise<any> {
    // 1. Try Native Electron IPC (if available)
    if (typeof window !== 'undefined' && (window as any).electron) {
        const electron = (window as any).electron;
        if (typeof electron[action] === 'function') {
            return electron[action](data);
        }
    }

    // 2. Try Tauri IPC (if available)
    if (typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__) {
        const { invoke } = await import('@tauri-apps/api/core');
        return invoke(action, data);
    }

    // 2. Identify Environment and Route
    const isElectron = typeof window !== 'undefined' && navigator.userAgent.toLowerCase().indexOf('electron') > -1;
    const targetUrl = isElectron ? `${BRAIN_URL}/${action}` : `/api/brain/${action}`;
    
    // 3. Attach Token for Cloud/Web requests
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
