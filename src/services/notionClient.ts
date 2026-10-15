import { BudgetAllocation, Transaction } from '../types/budget';

const NOTION_SETTINGS_KEY = 'aurabudget_notion_config_v1';

export interface NotionConfig {
  apiKey: string;
  budgetsDbId: string;
  transactionsDbId: string;
  autoSync: boolean;
  lastSyncedAt?: string;
}

export const NotionService = {
  getConfig(): NotionConfig {
    try {
      const data = localStorage.getItem(NOTION_SETTINGS_KEY);
      return data
        ? JSON.parse(data)
        : {
            apiKey: '',
            budgetsDbId: '',
            transactionsDbId: '',
            autoSync: false,
          };
    } catch {
      return {
        apiKey: '',
        budgetsDbId: '',
        transactionsDbId: '',
        autoSync: false,
      };
    }
  },

  saveConfig(config: NotionConfig): void {
    localStorage.setItem(NOTION_SETTINGS_KEY, JSON.stringify(config));
  },

  getHeaders(config: NotionConfig) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (config.apiKey) headers['x-notion-key'] = config.apiKey;
    if (config.budgetsDbId) headers['x-notion-budgets-db'] = config.budgetsDbId;
    if (config.transactionsDbId) headers['x-notion-transactions-db'] = config.transactionsDbId;
    return headers;
  },

  async testConnection(config: NotionConfig): Promise<{ success: boolean; message: string; botName?: string }> {
    try {
      const res = await fetch('/api/notion?type=status', {
        headers: this.getHeaders(config),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.message || 'Gagal terhubung ke Notion.' };
      }
      return {
        success: true,
        message: `Terhubung dengan bot: ${data.botName || 'Notion Integration'}`,
        botName: data.botName,
      };
    } catch (err: any) {
      return {
        success: false,
        message: 'Endpoint /api/notion belum aktif di environment lokal, namun siap berjalan di Vercel.',
      };
    }
  },

  async pushAll(budgets: BudgetAllocation[], transactions: Transaction[], config: NotionConfig) {
    const res = await fetch('/api/notion?type=push_all', {
      method: 'POST',
      headers: this.getHeaders(config),
      body: JSON.stringify({ budgets, transactions }),
    });
    return res.json();
  },

  async pullAll(config: NotionConfig) {
    const res = await fetch('/api/notion?type=pull', {
      method: 'GET',
      headers: this.getHeaders(config),
    });
    return res.json();
  },
};
