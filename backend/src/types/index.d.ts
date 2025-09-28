import User from "../../src/modules/auth/user.model";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
