import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchAdminReservations, updateReservationStatus } from '../api/auth';
import './AdminReservations.css';

const AdminReservations = () => {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const token = localStorage.getItem('adminToken');
  const { data: reservations, isLoading, refetch } = useQuery({
    queryKey: ['admin-reservations'],
    queryFn: () => fetchAdminReservations(token),
    enabled: !!token,
    retry: 1,
    retryOnMount: false
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-CR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const changeStatus = async (code, status) => {
    try {
      await updateReservationStatus(token, code, status);
      refetch();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error al actualizar el estado de la reserva');
    }
  };

  const filteredReservations = reservations?.filter(reservation => {
    const matchesStatus = statusFilter === 'ALL' || reservation.status === statusFilter;
    const matchesSearch = 
      reservation.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  }) || [];

  const statusCounts = {
    ALL: reservations?.length || 0,
    PENDING: reservations?.filter(r => r.status === 'PENDING').length || 0,
    CONFIRMED: reservations?.filter(r => r.status === 'CONFIRMED').length || 0,
    IN_DELIVERY: reservations?.filter(r => r.status === 'IN_DELIVERY').length || 0,
    COMPLETED: reservations?.filter(r => r.status === 'COMPLETED').length || 0,
    EXPIRED: reservations?.filter(r => r.status === 'EXPIRED').length || 0,
    CANCELLED: reservations?.filter(r => r.status === 'CANCELLED').length || 0
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      PENDING: 'badge-pending',
      CONFIRMED: 'badge-confirmed',
      IN_DELIVERY: 'badge-delivery',
      COMPLETED: 'badge-completed',
      EXPIRED: 'badge-expired',
      CANCELLED: 'badge-cancelled'
    };
    return statusMap[status] || 'badge-default';
  };

  const getStatusLabel = (status) => {
    const labelMap = {
      PENDING: 'Pendiente',
      CONFIRMED: 'Confirmada',
      IN_DELIVERY: 'En Proceso de Entrega',
      COMPLETED: 'Entregada',
      EXPIRED: 'Expirada',
      CANCELLED: 'Cancelada'
    };
    return labelMap[status] || status;
  };

  const getAvailableStatuses = (currentStatus) => {
    // Estados disponibles según el estado actual
    const statusOptions = {
      'PENDING': ['CONFIRMED', 'CANCELLED'],
      'CONFIRMED': ['IN_DELIVERY', 'CANCELLED'],
      'IN_DELIVERY': ['COMPLETED', 'CANCELLED'],
      'COMPLETED': [], // No se puede cambiar desde completada
      'CANCELLED': [], // No se puede cambiar desde cancelada
      'EXPIRED': [] // No se puede cambiar desde expirada
    };
    return statusOptions[currentStatus] || [];
  };

  if (isLoading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <p>Cargando reservas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Reservas</h1>
          <p className="admin-subtitle">Gestionar y monitorear reservas ({reservations?.length || 0} total)</p>
        </div>
        <Link to="/admin" className="btn-secondary">
          ← Volver al dashboard
        </Link>
      </div>

      {/* Status filters */}
      <div className="admin-content-card">
        <div className="status-filters">
          {Object.entries(statusCounts).map(([status, count]) => (
            <button
              key={status}
              className={`status-filter-btn ${statusFilter === status ? 'active' : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              <span className="status-label">{status === 'ALL' ? 'Todas' : getStatusLabel(status)}</span>
              <span className="status-count">{count}</span>
            </button>
          ))}
        </div>

        <div className="admin-filters">
          <div className="search-input-wrapper">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar por código, email o nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="reservations-list">
          {filteredReservations.length > 0 ? (
            filteredReservations.map((reservation) => (
              <div key={reservation.code} className="reservation-card">
                <div className="reservation-header">
                  <div className="reservation-code-section">
                    <span className="reservation-code">#{reservation.code}</span>
                    <span className={`badge ${getStatusBadgeClass(reservation.status)}`}>
                      {getStatusLabel(reservation.status)}
                    </span>
                  </div>
                  <div className="reservation-date">
                    {formatDate(reservation.createdAt)}
                  </div>
                </div>

                <div className="reservation-body">
                  <div className="reservation-info-row">
                    <div className="info-item">
                      <span className="info-label">Cliente:</span>
                      <span className="info-value">
                        {reservation.customerName || reservation.customerEmail || 'N/A'}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Email:</span>
                      <span className="info-value">{reservation.customerEmail || 'N/A'}</span>
                    </div>
                    {reservation.customerPhone && (
                      <div className="info-item">
                        <span className="info-label">Teléfono:</span>
                        <span className="info-value">{reservation.customerPhone}</span>
                      </div>
                    )}
                  </div>

                  <div className="reservation-items-section">
                    <div className="section-title">Productos ({reservation.items?.length || 0})</div>
                    <div className="items-list">
                      {reservation.items?.map((item, idx) => (
                        <div key={idx} className="item-row">
                          <span className="item-name">{item.nameSnapshot}</span>
                          <span className="item-details">
                            {item.size} | {item.color} | x{item.qty}
                          </span>
                          <span className="item-price">{formatCurrency(item.priceSnapshot * item.qty)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="reservation-totals">
                    <div className="total-row">
                      <span>Subtotal:</span>
                      <span className="total-amount">{formatCurrency(reservation.totals?.subtotal || 0)}</span>
                    </div>
                    <div className="total-row">
                      <span>Items:</span>
                      <span>{reservation.totals?.itemsCount || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="reservation-footer">
                  <div className="reservation-status-control">
                    <label className="status-label">Cambiar Estado:</label>
                    <select
                      value={reservation.status}
                      onChange={(e) => {
                        if (window.confirm(`¿Cambiar el estado de esta reserva a "${getStatusLabel(e.target.value)}"? Se enviará un correo al cliente.`)) {
                          changeStatus(reservation.code, e.target.value);
                        }
                      }}
                      className="status-select"
                      disabled={['COMPLETED', 'CANCELLED', 'EXPIRED'].includes(reservation.status)}
                    >
                      <option value="PENDING">Pendiente</option>
                      <option value="CONFIRMED">Confirmada</option>
                      <option value="IN_DELIVERY">En Proceso de Entrega</option>
                      <option value="COMPLETED">Entregada</option>
                      <option value="CANCELLED">Cancelada</option>
                    </select>
                    {getAvailableStatuses(reservation.status).length > 0 && (
                      <div className="status-actions">
                        {getAvailableStatuses(reservation.status).map(status => (
                          <button
                            key={status}
                            className={`btn-action btn-${status.toLowerCase().replace('_', '-')}`}
                            onClick={() => {
                              if (window.confirm(`¿Cambiar el estado a "${getStatusLabel(status)}"? Se enviará un correo al cliente.`)) {
                                changeStatus(reservation.code, status);
                              }
                            }}
                          >
                            {getStatusLabel(status)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {reservation.expiresAt && reservation.status === 'PENDING' && (
                    <div className="reservation-expiry">
                      Expira: {formatDate(reservation.expiresAt)}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              {searchTerm || statusFilter !== 'ALL' 
                ? 'No se encontraron reservas que coincidan con los filtros' 
                : 'No hay reservas disponibles'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReservations;
