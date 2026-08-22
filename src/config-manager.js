const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, '..', 'bot_config.json');

const DEFAULT_CONFIG = {
  projectName: 'JusticIA WhatsApp — Litigio Estratégico Antioquia 2040',
  botName: 'JusticIA Asistente Constitucional',
  pairingMethod: 'qr', // 'qr' o 'code' (Pairing code de 8 dígitos)
  phoneNumber: '573117272822',
  autoReplyMode: 'all', // 'all', 'whitelist', 'manual'
  whitelistNumbers: ['573117272822'],
  autoRepairCorruptedSessions: true,
  defaultLanguageMode: 'CLARO', // 'CLARO' o 'TECNICO'
  sessionTimeoutHours: 24
};

class ConfigManager {
  constructor() {
    this.config = { ...DEFAULT_CONFIG };
    this.loadConfig();
  }

  loadConfig() {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        const raw = fs.readFileSync(CONFIG_FILE, 'utf8');
        this.config = { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
      } else {
        this.saveConfig();
      }
    } catch (err) {
      console.error('[ConfigManager] Error cargando configuración:', err.message);
    }
  }

  saveConfig() {
    try {
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(this.config, null, 2), 'utf8');
    } catch (err) {
      console.error('[ConfigManager] Error guardando configuración:', err.message);
    }
  }

  get(key) {
    return this.config[key];
  }

  set(key, value) {
    this.config[key] = value;
    this.saveConfig();
  }

  update(obj) {
    Object.assign(this.config, obj);
    this.saveConfig();
  }

  isNumberAuthorized(phoneNumber) {
    if (this.config.autoReplyMode === 'all') return true;
    if (this.config.autoReplyMode === 'whitelist') {
      const cleanNumber = phoneNumber.replace(/\D/g, '');
      return this.config.whitelistNumbers.some(num => cleanNumber.includes(num.replace(/\D/g, '')));
    }
    return false;
  }
}

module.exports = new ConfigManager();
