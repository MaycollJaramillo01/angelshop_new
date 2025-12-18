const { readCollection, writeCollection, generateId } = require('../db');

class OtpCode {
  constructor(data) {
    this._id = data._id || generateId();
    this.email = data.email;
    this.codeHash = data.codeHash;
    this.expiresAt = data.expiresAt;
    this.attempts = data.attempts || 0;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  static async findOne(filter) {
    const codes = await readCollection('otpCodes');
    if (filter.email) {
      return codes.find(c => c.email === filter.email) || null;
    }
    return null;
  }

  async save() {
    const codes = await readCollection('otpCodes');
    const index = codes.findIndex(c => c._id === this._id);
    this.updatedAt = new Date().toISOString();
    
    if (index >= 0) {
      codes[index] = this;
    } else {
      codes.push(this);
    }
    
    await writeCollection('otpCodes', codes);
    return this;
  }

  static async create(data) {
    const code = new OtpCode(data);
    await code.save();
    return code;
  }

  static async deleteMany(filter = {}) {
    const codes = await readCollection('otpCodes');
    if (Object.keys(filter).length === 0) {
      await writeCollection('otpCodes', []);
      return { deletedCount: 0 };
    }
    const initialLength = codes.length;
    const filtered = codes.filter(c => {
      for (const key in filter) {
        if (c[key] !== filter[key]) return true;
      }
      return false;
    });
    await writeCollection('otpCodes', filtered);
    return { deletedCount: initialLength - filtered.length };
  }
}

module.exports = OtpCode;
