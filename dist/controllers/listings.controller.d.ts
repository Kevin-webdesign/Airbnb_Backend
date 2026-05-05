import type { NextFunction, Request, Response } from "express";
declare global {
    namespace Express {
        interface Request {
            userId?: string;
            role?: string;
        }
    }
}
export declare const getAllListings: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getListingById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createListing: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const updateListing: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const deleteListing: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const listingsStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const listingssearch: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const listingsStats: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=listings.controller.d.ts.map