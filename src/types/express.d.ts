import type { JwtPayload } from "../core/middleware/auth.middleware";

type RequestSchoolContext = {
  id: string;
  slug: string;
  name: string;
  domain: string | null;
};

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      schoolId?: string;
      school?: RequestSchoolContext;
    }
  }
}

export {};
