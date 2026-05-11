// TypeScript interfaces for the Vehicle Fleet Management Service

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'fleet_manager' | 'fleet_staff';
  phone?: string;
  licenseNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Vehicle {
  id: number;
  plateNumber: string;
  make: string;
  model: string;
  year: number;
  type: VehicleType;
  customType?: string | null;
  fuelType: FuelType;
  purchaseCost?: number | null;
  status: VehicleStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  currentAssignment?: CurrentAssignment | null;
  assignments?: Assignment[];
}

export interface CurrentAssignment {
  assignmentId: number;
  driverId: number;
  driverName: string;
  assignedAt: string;
}

export interface Assignment {
  id: number;
  vehicleId?: number;
  vehiclePlate?: string;
  vehicleName?: string;
  driverId: number;
  driverName: string;
  assignedBy: string;
  assignedAt: string;
  returnedAt?: string | null;
  returnedBy?: string | null;
  notes?: string | null;
}

export interface AuditLog {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  action: string;
  entityType: string;
  entityId: number;
  details: Record<string, unknown> | null;
  createdAt: string;
}

export interface DashboardStats {
  totalVehicles: number;
  totalDrivers: number;
  totalUsers: number;
  activeAssignments: number;
  byStatus: Record<string, number>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface Driver {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  licenseNumber?: string;
}

export type VehicleType = 'van' | 'truck' | 'car' | 'bus' | 'motorcycle' | 'suv' | 'other';
export type FuelType = 'petrol' | 'diesel' | 'electric' | 'hybrid';
export type VehicleStatus = 'available' | 'assigned' | 'maintenance' | 'retired';
export type UserRole = 'admin' | 'fleet_manager' | 'fleet_staff';
