import { Client } from '@notionhq/client';

export default async function handler(req: any, res: any) {
  // Set CORS headers for API calls
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Retrieve environment variables (configured in Vercel or .env)
  const apiKey = process.env.NOTION_API_KEY || req.headers['x-notion-key'];
  const budgetsDbId = process.env.NOTION_BUDGETS_DB_ID || req.headers['x-notion-budgets-db'];
  const transactionsDbId = process.env.NOTION_TRANSACTIONS_DB_ID || req.headers['x-notion-transactions-db'];

  if (!apiKey) {
    return res.status(400).json({
      success: false,
      message: 'NOTION_API_KEY belum dikonfigurasi di Vercel Environment Variables atau request header.',
    });
  }

  const notion = new Client({ auth: apiKey });
  const actionType = req.query.type || 'status';

  try {
    // 1. Connection check
    if (actionType === 'status') {
      const me = await notion.users.me({});
      return res.status(200).json({
        success: true,
        botName: me.name || 'Notion Bot Integration',
        budgetsConfigured: Boolean(budgetsDbId),
        transactionsConfigured: Boolean(transactionsDbId),
      });
    }

    // 2. Add single transaction to Notion
    if (actionType === 'add_transaction' && req.method === 'POST') {
      if (!transactionsDbId) {
        return res.status(400).json({ success: false, message: 'NOTION_TRANSACTIONS_DB_ID belum diisi.' });
      }

      const { amount, categoryName, dateTime, paymentMethod, paymentProvider, notes } = req.body;

      const page = await notion.pages.create({
        parent: { database_id: transactionsDbId },
        properties: {
          Category: {
            title: [
              {
                text: { content: categoryName || 'Uncategorized' },
              },
            ],
          },
          Amount: {
            number: amount || 0,
          },
          Date: {
            date: {
              start: dateTime ? dateTime.slice(0, 10) : new Date().toISOString().slice(0, 10),
            },
          },
          PaymentMethod: {
            select: {
              name: paymentMethod || 'Cash',
            },
          },
          Provider: {
            rich_text: [
              {
                text: { content: paymentProvider || '-' },
              },
            ],
          },
          Notes: {
            rich_text: [
              {
                text: { content: notes || '-' },
              },
            ],
          },
        },
      });

      return res.status(200).json({ success: true, pageId: page.id });
    }

    // 3. Save or update budget to Notion
    if (actionType === 'save_budget' && req.method === 'POST') {
      if (!budgetsDbId) {
        return res.status(400).json({ success: false, message: 'NOTION_BUDGETS_DB_ID belum diisi.' });
      }

      const { categoryName, period, allocatedAmount, spentAmount, rolloverEnabled } = req.body;

      const page = await notion.pages.create({
        parent: { database_id: budgetsDbId },
        properties: {
          Category: {
            title: [
              {
                text: { content: categoryName },
              },
            ],
          },
          Period: {
            select: {
              name: period || 'October 2026',
            },
          },
          Allocated: {
            number: allocatedAmount || 0,
          },
          Spent: {
            number: spentAmount || 0,
          },
          Rollover: {
            checkbox: Boolean(rolloverEnabled),
          },
        },
      });

      return res.status(200).json({ success: true, pageId: page.id });
    }

    // 4. Pull all records from Notion databases
    if (actionType === 'pull' && req.method === 'GET') {
      let budgets: any[] = [];
      let transactions: any[] = [];

      if (budgetsDbId) {
        const query: any = await (notion.databases as any).query({ database_id: budgetsDbId });
        budgets = query.results.map((page: any) => {
          const props = page.properties;
          return {
            id: page.id,
            categoryName: props.Category?.title?.[0]?.plain_text || 'Unnamed',
            period: props.Period?.select?.name || 'October 2026',
            allocatedAmount: props.Allocated?.number || 0,
            spentAmount: props.Spent?.number || 0,
            rolloverEnabled: props.Rollover?.checkbox || false,
          };
        });
      }

      if (transactionsDbId) {
        const query: any = await (notion.databases as any).query({
          database_id: transactionsDbId,
          sorts: [{ property: 'Date', direction: 'descending' }],
        });
        transactions = query.results.map((page: any) => {
          const props = page.properties;
          return {
            id: page.id,
            categoryName: props.Category?.title?.[0]?.plain_text || 'Transaksi',
            amount: props.Amount?.number || 0,
            dateTime: props.Date?.date?.start || new Date().toISOString(),
            paymentMethod: props.PaymentMethod?.select?.name || 'Cash',
            paymentProvider: props.Provider?.rich_text?.[0]?.plain_text || '',
            notes: props.Notes?.rich_text?.[0]?.plain_text || '',
            syncStatus: 'synced',
          };
        });
      }

      return res.status(200).json({
        success: true,
        budgets,
        transactions,
      });
    }

    // 5. Bulk sync / Push from local storage to Notion (push_all or push_latest)
    if ((actionType === 'push_all' || actionType === 'push_latest') && req.method === 'POST') {
      const { budgets, transactions } = req.body;
      let budgetCount = 0;
      let transactionCount = 0;

      if (budgetsDbId && Array.isArray(budgets) && budgets.length > 0) {
        for (const b of budgets) {
          await notion.pages.create({
            parent: { database_id: budgetsDbId },
            properties: {
              Category: { title: [{ text: { content: b.categoryName } }] },
              Period: { select: { name: b.period } },
              Allocated: { number: b.allocatedAmount },
              Spent: { number: b.spentAmount },
              Rollover: { checkbox: Boolean(b.rolloverEnabled) },
            },
          });
          budgetCount++;
        }
      }

      if (transactionsDbId && Array.isArray(transactions) && transactions.length > 0) {
        for (const tx of transactions) {
          await notion.pages.create({
            parent: { database_id: transactionsDbId },
            properties: {
              Category: { title: [{ text: { content: tx.categoryName } }] },
              Amount: { number: tx.amount },
              Date: { date: { start: tx.dateTime ? tx.dateTime.slice(0, 10) : new Date().toISOString().slice(0, 10) } },
              PaymentMethod: { select: { name: tx.paymentMethod || 'Cash' } },
              Provider: { rich_text: [{ text: { content: tx.paymentProvider || '-' } }] },
              Notes: { rich_text: [{ text: { content: tx.notes || '-' } }] },
            },
          });
          transactionCount++;
        }
      }

      const msg = actionType === 'push_latest'
        ? `Berhasil mengekspor ${transactionCount} transaksi terbaru ke database Notion tanpa menduplikasi data lama.`
        : `Berhasil mengekspor ${budgetCount} anggaran dan ${transactionCount} transaksi ke database Notion.`;

      return res.status(200).json({
        success: true,
        message: msg,
        budgetCount,
        transactionCount,
      });
    }

    return res.status(400).json({ success: false, message: 'Action type tidak dikenali.' });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Gagal berkomunikasi dengan Notion API.',
    });
  }
}
