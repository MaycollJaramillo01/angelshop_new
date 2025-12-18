const { readCollection, writeCollection, generateId, findById, findIndexById } = require('../db');

class Reservation {
  constructor(data) {
    this._id = data._id || generateId();
    this.code = data.code;
    this.customerEmail = data.customerEmail;
    this.customerPhone = data.customerPhone || '';
    this.customerName = data.customerName || '';
    this.customerAddress = data.customerAddress || '';
    this.status = data.status || 'PENDING';
    this.expiresAt = data.expiresAt;
    this.items = data.items || [];
    this.totals = data.totals || { itemsCount: 0, subtotal: 0 };
    this.events = data.events || [];
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  static async find(filter = {}) {
    const reservations = await readCollection('reservations');
    return reservations.filter(r => {
      if (filter.status && r.status !== filter.status) return false;
      if (filter.customerEmail && r.customerEmail !== filter.customerEmail) return false;
      if (filter.code && r.code !== filter.code) return false;
      if (filter.expiresAt) {
        if (filter.expiresAt.$lte) {
          const expiresAt = new Date(r.expiresAt);
          const filterDate = new Date(filter.expiresAt.$lte);
          if (expiresAt > filterDate) return false;
        }
      }
      if (filter.createdAt) {
        const createdAt = new Date(r.createdAt);
        if (filter.createdAt.$gte) {
          const from = new Date(filter.createdAt.$gte);
          if (createdAt < from) return false;
        }
        if (filter.createdAt.$lte) {
          const to = new Date(filter.createdAt.$lte);
          if (createdAt > to) return false;
        }
      }
      if (filter.status && Array.isArray(filter.status.$in)) {
        if (!filter.status.$in.includes(r.status)) return false;
      }
      return true;
    });
  }

  static async findOne(filter) {
    const reservations = await readCollection('reservations');
    if (filter._id || filter.id) {
      return findById(reservations, filter._id || filter.id) || null;
    }
    if (filter.code) {
      return reservations.find(r => r.code === filter.code) || null;
    }
    return null;
  }

  static async findById(id) {
    const reservations = await readCollection('reservations');
    return findById(reservations, id) || null;
  }

  async save() {
    try {
      const reservations = await readCollection('reservations');
      const index = findIndexById(reservations, this._id);
      this.updatedAt = new Date().toISOString();
      
      // Convertir la instancia a objeto plano para evitar problemas de serialización
      const reservationData = {
        _id: this._id,
        code: this.code,
        customerEmail: this.customerEmail,
        customerPhone: this.customerPhone,
        customerName: this.customerName,
        customerAddress: this.customerAddress,
        status: this.status,
        expiresAt: this.expiresAt,
        items: this.items,
        totals: this.totals,
        events: this.events,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      };
      
      if (index >= 0) {
        reservations[index] = reservationData;
      } else {
        reservations.push(reservationData);
      }
      
      await writeCollection('reservations', reservations);
      return this;
    } catch (err) {
      const { logger } = require('../utils/logger');
      logger.error('Error saving reservation:', {
        error: err.message,
        stack: err.stack,
        reservationId: this._id,
        code: this.code
      });
      throw err;
    }
  }

  static async create(data) {
    const reservation = new Reservation(data);
    await reservation.save();
    return reservation;
  }

  static async deleteMany(filter = {}) {
    if (Object.keys(filter).length === 0) {
      await writeCollection('reservations', []);
      return { deletedCount: 0 };
    }
    const reservations = await readCollection('reservations');
    const initialLength = reservations.length;
    const filtered = reservations.filter(r => {
      for (const key in filter) {
        if (r[key] !== filter[key]) return true;
      }
      return false;
    });
    await writeCollection('reservations', filtered);
    return { deletedCount: initialLength - filtered.length };
  }
}

module.exports = Reservation;
