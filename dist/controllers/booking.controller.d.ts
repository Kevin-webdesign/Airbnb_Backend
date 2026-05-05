import type { NextFunction, Request, Response } from "express";
export declare const getAllBookings: (req: Request, res: Response) => Promise<void>;
export declare const getBookingById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createBooking: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteBooking: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const changeBookingStatus: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateBooking: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=booking.controller.d.ts.map