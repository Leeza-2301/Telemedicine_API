// src/types/express.d.ts
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string }; // Define the user property with an optional type
    }
  }
}
