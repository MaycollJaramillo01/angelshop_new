const { readCollection, writeCollection, generateId, findById } = require('../db');

class AdminUser {
  constructor(data) {
    this._id = data._id || generateId();
    this.email = data.email;
    this.passwordHash = data.passwordHash;
    this.role = data.role || 'ADMIN';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  static async findOne(filter) {
    const users = await readCollection('adminUsers');
    if (filter._id || filter.id) {
      return findById(users, filter._id || filter.id) || null;
    }
    if (filter.email) {
      return users.find(u => u.email === filter.email) || null;
    }
    return null;
  }

  static async findById(id) {
    const users = await readCollection('adminUsers');
    return findById(users, id) || null;
  }

  async save() {
    const users = await readCollection('adminUsers');
    const index = users.findIndex(u => u._id === this._id);
    this.updatedAt = new Date().toISOString();
    
    if (index >= 0) {
      users[index] = this;
    } else {
      users.push(this);
    }
    
    await writeCollection('adminUsers', users);
    return this;
  }

  static async create(data) {
    const user = new AdminUser(data);
    await user.save();
    return user;
  }

  static async deleteMany(filter = {}) {
    if (Object.keys(filter).length === 0) {
      await writeCollection('adminUsers', []);
      return { deletedCount: 0 };
    }
    const users = await readCollection('adminUsers');
    const initialLength = users.length;
    const filtered = users.filter(u => {
      for (const key in filter) {
        if (u[key] !== filter[key]) return true;
      }
      return false;
    });
    await writeCollection('adminUsers', filtered);
    return { deletedCount: initialLength - filtered.length };
  }
}

module.exports = AdminUser;
