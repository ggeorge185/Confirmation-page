// File-based storage utilities for persistent data storage
import fs from 'fs';
import path from 'path';

const DATA_DIR = '/tmp/confirmation-data';
const CONFIRMATIONS_FILE = path.join(DATA_DIR, 'confirmations.json');
const LINKS_FILE = path.join(DATA_DIR, 'links.json');
const WEBHOOK_LOGS_FILE = path.join(DATA_DIR, 'webhook-logs.json');
const WEBHOOK_SETTINGS_FILE = path.join(DATA_DIR, 'webhook-settings.json');

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Safe file read with fallback
function safeReadFile(filePath, defaultValue = []) {
  try {
    ensureDataDir();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
    return defaultValue;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return defaultValue;
  }
}

// Safe file write
function safeWriteFile(filePath, data) {
  try {
    ensureDataDir();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
    return false;
  }
}

// Storage operations
export const storage = {
  // Confirmations
  getConfirmations() {
    return safeReadFile(CONFIRMATIONS_FILE, []);
  },

  addConfirmation(confirmation) {
    const confirmations = this.getConfirmations();
    confirmations.push(confirmation);
    return safeWriteFile(CONFIRMATIONS_FILE, confirmations);
  },

  // Links
  getLinks() {
    return safeReadFile(LINKS_FILE, []);
  },

  addLink(linkData) {
    const links = this.getLinks();
    links.push(linkData);
    return safeWriteFile(LINKS_FILE, links);
  },

  updateLinkClick(uniqueId) {
    const links = this.getLinks();
    const linkIndex = links.findIndex(link => link.uniqueId === uniqueId);
    if (linkIndex !== -1) {
      links[linkIndex].clicked = true;
      links[linkIndex].clickedAt = new Date().toISOString();
      return safeWriteFile(LINKS_FILE, links);
    }
    return false;
  },

  updateLinkConfirmation(uniqueId) {
    const links = this.getLinks();
    const linkIndex = links.findIndex(link => link.uniqueId === uniqueId);
    if (linkIndex !== -1) {
      links[linkIndex].confirmed = true;
      links[linkIndex].confirmedAt = new Date().toISOString();
      return safeWriteFile(LINKS_FILE, links);
    }
    return false;
  },

  // Webhook logs
  getWebhookLogs() {
    return safeReadFile(WEBHOOK_LOGS_FILE, []);
  },

  addWebhookLog(logEntry) {
    const logs = this.getWebhookLogs();
    logs.push({
      ...logEntry,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 100 logs
    if (logs.length > 100) {
      logs.splice(0, logs.length - 100);
    }
    
    return safeWriteFile(WEBHOOK_LOGS_FILE, logs);
  },

  // Webhook settings
  getWebhookSettings() {
    return safeReadFile(WEBHOOK_SETTINGS_FILE, { enabled: false, url: '', secret: '' });
  },

  saveWebhookSettings(settings) {
    return safeWriteFile(WEBHOOK_SETTINGS_FILE, settings);
  },

  // Clear all data
  clearAll() {
    try {
      const files = [CONFIRMATIONS_FILE, LINKS_FILE, WEBHOOK_LOGS_FILE, WEBHOOK_SETTINGS_FILE];
      files.forEach(file => {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      });
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }
};