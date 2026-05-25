import type { NextFunction, Request, Response } from "express";
export declare function getMyNotifications(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getAllNotifications(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getUnreadNotificationsCount(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function markNotificationAsRead(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function markAllNotificationsAsRead(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function deleteNotification(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function createSystemNotification(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=notifications.controller.d.ts.map