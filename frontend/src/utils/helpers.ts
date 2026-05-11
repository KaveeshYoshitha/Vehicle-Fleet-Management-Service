import type { VehicleStatus, VehicleType, UserRole } from '../types';

export const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

export const formatDateTime = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(amount);
};

export const getStatusColor = (status: VehicleStatus): string => {
  const colors: Record<VehicleStatus, string> = {
    available: '#10b981',
    assigned: '#f59e0b',
    maintenance: '#ef4444',
    retired: '#6b7280',
  };
  return colors[status] || '#6b7280';
};

export const getStatusBgColor = (status: VehicleStatus): string => {
  const colors: Record<VehicleStatus, string> = {
    available: 'rgba(16, 185, 129, 0.15)',
    assigned: 'rgba(245, 158, 11, 0.15)',
    maintenance: 'rgba(239, 68, 68, 0.15)',
    retired: 'rgba(107, 114, 128, 0.15)',
  };
  return colors[status] || 'rgba(107, 114, 128, 0.15)';
};

export const getVehicleTypeLabel = (type: VehicleType, customType?: string | null): string => {
  if (type === 'other' && customType) return customType;
  const labels: Record<VehicleType, string> = {
    van: 'Van', truck: 'Truck', car: 'Car', bus: 'Bus',
    motorcycle: 'Motorcycle', suv: 'SUV', other: 'Other',
  };
  return labels[type] || type;
};

export const getRoleLabel = (role: UserRole): string => {
  const labels: Record<UserRole, string> = {
    admin: 'Admin',
    fleet_manager: 'Fleet Manager',
    fleet_staff: 'Fleet Staff',
  };
  return labels[role] || role;
};

export const getRoleColor = (role: UserRole): string => {
  const colors: Record<UserRole, string> = {
    admin: '#8b5cf6',
    fleet_manager: '#3b82f6',
    fleet_staff: '#10b981',
  };
  return colors[role] || '#6b7280';
};

export const getVehicleIcon = (type: VehicleType): string => {
  const icons: Record<VehicleType, string> = {
    van: 'fa-van-shuttle', truck: 'fa-truck', car: 'fa-car',
    bus: 'fa-bus', motorcycle: 'fa-motorcycle', suv: 'fa-car-side',
    other: 'fa-car',
  };
  return icons[type] || 'fa-car';
};
