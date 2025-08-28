import { z } from 'zod';

export const createMaintenanceRequestSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  unitId: z.string().min(1, 'Unit ID is required'),
});

export const createAnnouncementSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  type: z.string().optional(),
  propertyId: z.string().optional(),
});

export const createVisitorPassSchema = z.object({
  visitorName: z.string().min(1, 'Visitor name is required'),
  visitorPhone: z.string().optional(),
  purpose: z.string().optional(),
  validFrom: z.string().datetime(),
  validTo: z.string().datetime(),
  unitId: z.string().min(1, 'Unit ID is required'),
});

export const sendOtpSchema = z.object({
  phone: z.string().min(1, 'Phone number is required'),
  role: z.enum(['TENANT', 'LANDLORD', 'PROPERTY_MANAGER', 'VENDOR']),
});

export const verifyOtpSchema = z.object({
  phone: z.string().min(1, 'Phone number is required'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  userId: z.string().min(1, 'User ID is required'),
});

export const updateMaintenanceRequestSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  assignedToId: z.string().optional(),
  vendorId: z.string().optional(),
  estimatedCost: z.number().optional(),
  actualCost: z.number().optional(),
  notes: z.string().optional(),
  scheduledDate: z.string().datetime().optional(),
});
