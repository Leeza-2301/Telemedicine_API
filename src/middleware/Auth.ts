// import { Request, Response, NextFunction } from "express";
// import jwt from "jsonwebtoken"; 

// export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
//   const token = req.headers.authorization?.split(" ")[1];
//   if (!token) return res.status(401).json({ message: "Unauthorized" });

//   try {
//     // Verify the token and decode it
//     const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
//       role: string;
//     }; // Cast the decoded object
//     if (decoded.role !== "admin") {
//       return res.status(403).json({ message: "Access forbidden" });
//     }
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: "Invalid token" });
//   }
// };


import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"; 

// Define a custom interface for the decoded JWT payload
interface DecodedToken {
    id: string;
    role: 'admin' | 'superadmin' | 'patient' | 'doctor';
  }
  
  export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
      res.locals.user = decoded; // Now TypeScript recognizes this
      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  };

  
// Middleware to check for specific roles
export const authorizeRole = (roles: Array<'admin' | 'superadmin' | 'patient' | 'doctor'>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!res.locals.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const {role} = req.body;
    // Check if the user's role is in the allowed roles
    if (!roles.includes(role)) {
      return res.status(403).json({ message: "Access forbidden" });
    }

    next();
  };
};
