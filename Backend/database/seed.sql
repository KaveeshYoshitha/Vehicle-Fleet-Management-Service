

USE fleet_management;

-- ============================================================
-- USERS (password hashes generated with bcryptjs, 10 rounds)
-- ============================================================
-- admin123
INSERT INTO users (first_name, last_name, email, password_hash, role, phone, license_number) VALUES
('System', 'Admin', 'admin@fleet.com', '$2b$10$GSY9EopgW8CvROJITGZRoOhgevhTHT8xbwHSMxmO2T16M4BBLt8fS', 'admin', '+94771234567', NULL);

-- password123
INSERT INTO users (first_name, last_name, email, password_hash, role, phone, license_number) VALUES
('Sarah', 'Johnson', 'sarah.j@fleet.com', '$2b$10$NLX9pt8reaAyWiNln2sVguNXixRoXPy6lBSsR.F/ZqmPxMP9399Yq', 'fleet_manager', '+94772345678', NULL),
('Mike', 'Williams', 'mike.w@fleet.com', '$2b$10$NLX9pt8reaAyWiNln2sVguNXixRoXPy6lBSsR.F/ZqmPxMP9399Yq', 'fleet_manager', '+94773456789', NULL);

-- password123
INSERT INTO users (first_name, last_name, email, password_hash, role, phone, license_number) VALUES
('James', 'Brown', 'james.b@fleet.com', '$2b$10$NLX9pt8reaAyWiNln2sVguNXixRoXPy6lBSsR.F/ZqmPxMP9399Yq', 'fleet_staff', '+94774567890', 'DL-2024-001'),
('Emily', 'Davis', 'emily.d@fleet.com', '$2b$10$NLX9pt8reaAyWiNln2sVguNXixRoXPy6lBSsR.F/ZqmPxMP9399Yq', 'fleet_staff', '+94775678901', 'DL-2024-002'),
('Robert', 'Wilson', 'robert.w@fleet.com', '$2b$10$NLX9pt8reaAyWiNln2sVguNXixRoXPy6lBSsR.F/ZqmPxMP9399Yq', 'fleet_staff', '+94776789012', 'DL-2024-003');

-- ============================================================
-- VEHICLES
-- ============================================================
INSERT INTO vehicles (plate_number, make, model, year, type, fuel_type, purchase_cost, status, notes) VALUES
('WP-CAB-1234', 'Toyota', 'HiAce', 2022, 'van', 'diesel', 4500000.00, 'available', 'Main delivery van - excellent condition'),
('WP-KA-5678', 'Isuzu', 'ELF', 2021, 'truck', 'diesel', 6200000.00, 'available', 'Medium duty truck for heavy loads'),
('WP-JK-9012', 'Toyota', 'Corolla', 2023, 'car', 'petrol', 8500000.00, 'available', 'Company car for management'),
('WP-AB-3456', 'Mitsubishi', 'Rosa', 2020, 'bus', 'diesel', 9800000.00, 'maintenance', 'Staff transport bus - scheduled for service'),
('WP-CD-7890', 'Honda', 'CB150R', 2023, 'motorcycle', 'petrol', 450000.00, 'available', 'Quick delivery motorcycle'),
('WP-EF-2345', 'Toyota', 'RAV4', 2022, 'suv', 'hybrid', 12000000.00, 'available', 'Executive SUV'),
('WP-GH-6789', 'Nissan', 'Caravan', 2021, 'van', 'diesel', 5200000.00, 'assigned', 'Secondary delivery van'),
('WP-IJ-0123', 'Tata', 'LPT 1613', 2019, 'truck', 'diesel', 7500000.00, 'retired', 'Old heavy truck - decommissioned');

-- ============================================================
-- SAMPLE ASSIGNMENTS
-- ============================================================
-- Vehicle WP-GH-6789 currently assigned to James Brown (id=4), assigned by Sarah Johnson (id=2)
INSERT INTO assignments (vehicle_id, driver_id, assigned_by, assigned_at, notes) VALUES
(7, 4, 2, '2026-05-10 08:00:00', 'Daily delivery route - Colombo area');

-- Historical assignments (already returned)
INSERT INTO assignments (vehicle_id, driver_id, assigned_by, assigned_at, returned_at, returned_by, notes) VALUES
(1, 4, 2, '2026-05-08 07:30:00', '2026-05-08 17:00:00', 2, 'Morning delivery run'),
(1, 5, 3, '2026-05-09 08:00:00', '2026-05-09 16:30:00', 3, 'Afternoon pickup route'),
(3, 6, 2, '2026-05-07 09:00:00', '2026-05-07 18:00:00', 2, 'Client meeting transport'),
(5, 5, 3, '2026-05-09 06:00:00', '2026-05-09 14:00:00', 3, 'Express document delivery'),
(6, 6, 2, '2026-05-06 08:00:00', '2026-05-06 20:00:00', 2, 'Executive airport transfer');

-- ============================================================
-- SAMPLE AUDIT LOGS
-- ============================================================
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES
(1, 'USER_CREATED', 'user', 2, '{"name": "Sarah Johnson", "role": "fleet_manager"}'),
(1, 'USER_CREATED', 'user', 3, '{"name": "Mike Williams", "role": "fleet_manager"}'),
(1, 'VEHICLE_CREATED', 'vehicle', 1, '{"plate_number": "WP-CAB-1234", "make": "Toyota", "model": "HiAce"}'),
(2, 'ASSIGNMENT_CREATED', 'assignment', 1, '{"vehicle": "WP-GH-6789", "driver": "James Brown"}');
