import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchReports } from '../api/auth';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './AdminReports.css';

const AdminReports = () => {
  const [dateRange, setDateRange] = useState('30'); // días
  const token = localStorage.getItem('adminToken');
  const { data: reportsData, isLoading } = useQuery({
    queryKey: ['reports', dateRange],
    queryFn: () => fetchReports(token),
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
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-CR', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Procesar datos para los gráficos
  const chartData = reportsData?.map(item => ({
    date: formatDate(item._id.day),
    fullDate: item._id.day,
    reservas: item.count || 0,
    ingresos: item.total || 0,
    expiradas: item.expired || 0
  })) || [];

  // Calcular estadísticas generales
  const totalStats = reportsData?.reduce((acc, item) => ({
    totalReservas: acc.totalReservas + (item.count || 0),
    totalIngresos: acc.totalIngresos + (item.total || 0),
    totalExpiradas: acc.totalExpiradas + (item.expired || 0)
  }), { totalReservas: 0, totalIngresos: 0, totalExpiradas: 0 }) || {
    totalReservas: 0,
    totalIngresos: 0,
    totalExpiradas: 0
  };

  const tasaConversion = totalStats.totalReservas > 0
    ? (((totalStats.totalReservas - totalStats.totalExpiradas) / totalStats.totalReservas) * 100).toFixed(1)
    : 0;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.name === 'Ingresos' ? formatCurrency(entry.value) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <p>Cargando reportes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Reportes y Análisis</h1>
          <p className="admin-subtitle">Estadísticas y métricas del negocio</p>
        </div>
        <Link to="/admin" className="btn-secondary">
          ← Volver al dashboard
        </Link>
      </div>

      {/* Estadísticas generales */}
      <div className="stats-grid">
        <div className="stat-card stat-card-primary">
          <div className="stat-card-header">
            <span className="stat-label">Total Reservas</span>
            <svg className="stat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
            </svg>
          </div>
          <div className="stat-value">{totalStats.totalReservas}</div>
          <div className="stat-subtitle">En el período seleccionado</div>
        </div>

        <div className="stat-card stat-card-success">
          <div className="stat-card-header">
            <span className="stat-label">Ingresos Totales</span>
            <svg className="stat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div className="stat-value">{formatCurrency(totalStats.totalIngresos)}</div>
          <div className="stat-subtitle">Valor total de reservas</div>
        </div>

        <div className="stat-card stat-card-warning">
          <div className="stat-card-header">
            <span className="stat-label">Reservas Expiradas</span>
            <svg className="stat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div className="stat-value">{totalStats.totalExpiradas}</div>
          <div className="stat-subtitle">{tasaConversion}% tasa de conversión</div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="charts-container">
        {/* Gráfico de líneas - Reservas por día */}
        <div className="chart-card">
          <div className="chart-header">
            <h2>Reservas por Día</h2>
            <p className="chart-subtitle">Evolución diaria de reservas</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e1e3e5" />
              <XAxis 
                dataKey="date" 
                stroke="#6d7175"
                style={{ fontSize: '0.875rem' }}
              />
              <YAxis 
                stroke="#6d7175"
                style={{ fontSize: '0.875rem' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="reservas" 
                name="Reservas"
                stroke="#008060" 
                strokeWidth={3}
                dot={{ fill: '#008060', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="expiradas" 
                name="Expiradas"
                stroke="#b91c1c" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#b91c1c', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de barras - Ingresos por día */}
        <div className="chart-card">
          <div className="chart-header">
            <h2>Ingresos por Día</h2>
            <p className="chart-subtitle">Valor de reservas por día</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e1e3e5" />
              <XAxis 
                dataKey="date" 
                stroke="#6d7175"
                style={{ fontSize: '0.875rem' }}
              />
              <YAxis 
                stroke="#6d7175"
                style={{ fontSize: '0.875rem' }}
                tickFormatter={(value) => `₡${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                content={<CustomTooltip />}
                formatter={(value) => formatCurrency(value)}
              />
              <Legend />
              <Bar 
                dataKey="ingresos" 
                name="Ingresos"
                fill="#008060"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tabla de datos */}
        <div className="chart-card">
          <div className="chart-header">
            <h2>Detalle por Día</h2>
            <p className="chart-subtitle">Desglose completo de estadísticas</p>
          </div>
          <div className="reports-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Reservas</th>
                  <th>Expiradas</th>
                  <th>Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {chartData.length > 0 ? (
                  chartData.map((item, index) => (
                    <tr key={index}>
                      <td>{item.fullDate}</td>
                      <td>
                        <span className="badge badge-info">{item.reservas}</span>
                      </td>
                      <td>
                        <span className={`badge ${item.expiradas > 0 ? 'badge-warning' : 'badge-success'}`}>
                          {item.expiradas}
                        </span>
                      </td>
                      <td className="text-right">
                        <strong>{formatCurrency(item.ingresos)}</strong>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="empty-state">
                      No hay datos disponibles para el período seleccionado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
