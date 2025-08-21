import { Request, Response } from 'express';
import { User } from '../models/User';
import { Assessment } from '../models/Assessment';
import { Batch } from '../models/Batch';

// Add a method to fetch admin dashboard data
export const getAdminDashboard = async (req: Request, res: Response) => {
  try {
    const data = {
      total_users: await User.count(),
      total_assessments: await Assessment.count(),
      total_batches: await Batch.count(),
      recent_activities: [
        { timestamp: '2025-08-20T10:00:00Z', activity: 'User John Doe created an assessment.' },
        { timestamp: '2025-08-20T11:00:00Z', activity: 'Batch A was allocated to Assessment 1.' }
      ]
    };
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch admin dashboard data' });
  }
};