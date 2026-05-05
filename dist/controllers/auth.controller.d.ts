import type { Request, Response } from "express";
import type { NextFunction } from "express";
export declare function register(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function login(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getMe(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function changePassword(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function forgotPassword(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function resetPassword(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=auth.controller.d.ts.map