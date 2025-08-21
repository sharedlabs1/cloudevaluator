import { Request, Response } from 'express';
import { StudentService } from '../services/studentService';
const studentService = new StudentService();

// Helper to extract userId from request (supports req.user, req.userId, req.auth, etc.)
function getUserId(req: Request): string | undefined {
  // If using JWT middleware, userId may be set as req.userId or req.user.id
  if ((req as any).userId) return (req as any).userId;
  if ((req as any).user && (req as any).user.id) return (req as any).user.id;
  if ((req as any).auth && (req as any).auth.userId) return (req as any).auth.userId;
  return undefined;
}

export const getStudentDashboard = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: userId missing' });
    }
    const dashboard = await studentService.getStudentDashboard(userId);
    return res.status(200).json({ success: true, data: dashboard });
  } catch (error) {
    return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const launchCloudConsole = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: userId missing' });
    }
    const url = await studentService.getCloudConsoleUrl(userId, req.params.assessmentId);
    return res.status(200).json({ success: true, url });
  } catch (error) {
    return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
  }
};