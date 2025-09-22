// API endpoint for storing and retrieving confirmations
// This replaces localStorage functionality for Vercel deployment

let confirmations = [];
let linkDatabase = [];
let webhookLogs = [];
let webhookSettings = { enabled: false, url: '', secret: '' };

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  try {
    switch (action) {
      case 'get-confirmations':
        return res.status(200).json({ confirmations });

      case 'add-confirmation':
        const confirmation = req.body;
        confirmations.push(confirmation);
        return res.status(200).json({ success: true, confirmation });

      case 'get-links':
        return res.status(200).json({ linkDatabase });

      case 'add-link':
        const linkData = req.body;
        linkDatabase.push(linkData);
        return res.status(200).json({ success: true, linkData });

      case 'update-link-click':
        const { uniqueId: clickId } = req.body;
        const linkIndex = linkDatabase.findIndex(link => link.uniqueId === clickId);
        if (linkIndex !== -1) {
          linkDatabase[linkIndex].clicked = true;
          linkDatabase[linkIndex].clickedAt = new Date().toISOString();
        }
        return res.status(200).json({ success: true });

      case 'update-link-confirmation':
        const { uniqueId: confirmId } = req.body;
        const confirmIndex = linkDatabase.findIndex(link => link.uniqueId === confirmId);
        if (confirmIndex !== -1) {
          linkDatabase[confirmIndex].confirmed = true;
          linkDatabase[confirmIndex].confirmedAt = new Date().toISOString();
        }
        return res.status(200).json({ success: true });

      case 'get-webhook-settings':
        return res.status(200).json({ webhookSettings });

      case 'save-webhook-settings':
        webhookSettings = req.body;
        return res.status(200).json({ success: true });

      case 'get-webhook-logs':
        return res.status(200).json({ webhookLogs });

      case 'add-webhook-log':
        const logEntry = req.body;
        webhookLogs.push({
          ...logEntry,
          timestamp: new Date().toISOString()
        });
        // Keep only last 100 logs
        if (webhookLogs.length > 100) {
          webhookLogs.splice(0, webhookLogs.length - 100);
        }
        return res.status(200).json({ success: true });

      case 'clear-all':
        confirmations = [];
        linkDatabase = [];
        webhookLogs = [];
        return res.status(200).json({ success: true });

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}