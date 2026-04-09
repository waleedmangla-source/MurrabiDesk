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

    // 2. Fallback to Liquid Glass Brain (Safari Mode)
    try {
      const response = await fetch(`${BRAIN_URL}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(`Brain Error: ${response.status}`);
      return await response.json();
    } catch (err) {
      console.warn(`[LIQUID] Bridge failed for ${action}:`, err);
      // No-op or throw depending on UI needs
      return null;
    }
  }
};
