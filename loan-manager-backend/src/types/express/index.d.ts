// types/express/index.d.ts (create this file if not exists)
import { UserRole } from '../../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: UserRole;
      };
    }
  }
}
