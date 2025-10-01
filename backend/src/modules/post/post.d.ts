import { Request } from 'express';
interface AuthenticatedRequest extends Request {
    userId?: number;
    file?: Express.Multer.File;
}