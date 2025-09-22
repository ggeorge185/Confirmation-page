// API endpoint for storing and retrieving confirmations
// This replaces localStorage functionality for Vercel deployment
// Now uses file-based storage for persistence

import { storage } from './storage.js';

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
        const confirmations = storage.getConfirmations();
        return res.status(200).json({ confirmations });

      case 'add-confirmation':
        const confirmation = req.body;
        const success = storage.addConfirmation(confirmation);
        if (success) {
          return res.status(200).json({ success: true, confirmation });
        } else {
          return res.status(500).json({ error: 'Failed to save confirmation' });
        }

      case 'get-links':
        const linkDatabase = storage.getLinks();
        return res.status(200).json({ linkDatabase });

      case 'add-link':
        const linkData = req.body;
        const linkSuccess = storage.addLink(linkData);
        if (linkSuccess) {
          return res.status(200).json({ success: true, linkData });
        } else {
          return res.status(500).json({ error: 'Failed to save link data' });
        }

      case 'update-link-click':
        const { uniqueId: clickId } = req.body;
        const clickSuccess = storage.updateLinkClick(clickId);
        return res.status(200).json({ success: clickSuccess });

      case 'update-link-confirmation':
        const { uniqueId: confirmId } = req.body;
        const confirmSuccess = storage.updateLinkConfirmation(confirmId);
        return res.status(200).json({ success: confirmSuccess });

      case 'get-webhook-settings':
        const webhookSettings = storage.getWebhookSettings();
        return res.status(200).json({ webhookSettings });

      case 'save-webhook-settings':
        const settings = req.body;
        const settingsSuccess = storage.saveWebhookSettings(settings);
        if (settingsSuccess) {
          return res.status(200).json({ success: true });
        } else {
          return res.status(500).json({ error: 'Failed to save webhook settings' });
        }

      case 'get-webhook-logs':
        const webhookLogs = storage.getWebhookLogs();
        return res.status(200).json({ webhookLogs });

      case 'add-webhook-log':
        const logEntry = req.body;
        const logSuccess = storage.addWebhookLog(logEntry);
        return res.status(200).json({ success: logSuccess });

      case 'clear-all':
        const clearSuccess = storage.clearAll();
        return res.status(200).json({ success: clearSuccess });

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}