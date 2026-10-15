import { BudgetAllocation, Transaction } from '../types/budget';

const NOTION_SETTINGS_KEY = 'aurabudget_notion_config_v1';

export interface NotionConfig {
  apiKey: string;
  budgetsDbId: string;
  transactionsDbId: string;
  autoSync: boolean;
  lastSyncedAt?: string;
  lastExportMode?: 'all' | 'latest';
  exportedTxIds?: string[];
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
            exportedTxIds: [],
          };
    } catch {
      return {
        apiKey: '',
        budgetsDbId: '',
        transactionsDbId: '',
        autoSync: false,
        exportedTxIds: [],
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
    } catch {
      return {
        success: false,
        message: 'Endpoint /api/notion belum aktif di environment lokal, namun siap berjalan di Vercel.',
      };
    }
  },

  /**
   * Fitur 1: Export Langsung Semua Data (Budgets + Seluruh Transaksi)
   */
  async pushAll(budgets: BudgetAllocation[], transactions: Transaction[], config: NotionConfig) {
    const res = await fetch('/api/notion?type=push_all', {
      method: 'POST',
      headers: this.getHeaders(config),
      body: JSON.stringify({ budgets, transactions }),
    });
    const result = await res.json();
    if (result.success) {
      // Mark all current transactions as exported to Notion
      const allIds = transactions.map((t) => t.id);
      const updatedConfig: NotionConfig = {
        ...config,
        lastSyncedAt: new Date().toISOString(),
        lastExportMode: 'all',
        exportedTxIds: Array.from(new Set([...(config.exportedTxIds || []), ...allIds])),
      };
      this.saveConfig(updatedConfig);
    }
    return result;
  },

  /**
   * Fitur 2: Export Data Terbaru Saja (Mencegah Duplikasi Riwayat Lama)
   * mode:
   *  - 'unexported_only': kirim semua transaksi yang belum pernah di-export ke Notion
   *  - 'latest_one': kirim hanya 1 transaksi paling terakhir
   */
  async pushLatest(
    transactions: Transaction[],
    config: NotionConfig,
    mode: 'unexported_only' | 'latest_one' = 'unexported_only'
  ) {
    if (!transactions || transactions.length === 0) {
      return { success: false, message: 'Belum ada data transaksi untuk diekspor.' };
    }

    // Sort descending by date/createdAt
    const sorted = [...transactions].sort((a, b) => {
      const timeA = new Date(a.dateTime || a.createdAt).getTime();
      const timeB = new Date(b.dateTime || b.createdAt).getTime();
      return timeB - timeA;
    });

    let targetTransactions: Transaction[] = [];

    if (mode === 'latest_one') {
      targetTransactions = [sorted[0]];
    } else {
      const alreadyExported = new Set(config.exportedTxIds || []);
      const unexported = sorted.filter((t) => !alreadyExported.has(t.id));
      if (unexported.length > 0) {
        targetTransactions = unexported;
      } else {
        // Jika semua sudah pernah ter-export, ambil 1 transaksi paling terakhir
        targetTransactions = [sorted[0]];
      }
    }

    const res = await fetch('/api/notion?type=push_latest', {
      method: 'POST',
      headers: this.getHeaders(config),
      body: JSON.stringify({
        budgets: [], // Don't re-push budgets in latest mode to prevent budget duplications
        transactions: targetTransactions,
      }),
    });
    const result = await res.json();

    if (result.success) {
      const exportedIds = targetTransactions.map((t) => t.id);
      const updatedConfig: NotionConfig = {
        ...config,
        lastSyncedAt: new Date().toISOString(),
        lastExportMode: 'latest',
        exportedTxIds: Array.from(new Set([...(config.exportedTxIds || []), ...exportedIds])),
      };
      this.saveConfig(updatedConfig);
    }

    return {
      ...result,
      exportedCount: targetTransactions.length,
      sampleTransaction: targetTransactions[0],
    };
  },

  async pullAll(config: NotionConfig) {
    const res = await fetch('/api/notion?type=pull', {
      method: 'GET',
      headers: this.getHeaders(config),
    });
    return res.json();
  },
};
