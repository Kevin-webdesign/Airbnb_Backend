import rateLimit from "express-rate-limit";
// General limiter: 100 requests per 15 minutes for all routes
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: "Too many requests from this IP, please try again later.",
        retryAfter: "15 minutes"
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
// Strict limiter: 20 requests per 15 minutes for POST routes
const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // limit each IP to 20 requests per windowMs
    message: {
        error: "Too many POST requests from this IP, please try again later.",
        retryAfter: "15 minutes"
    },
    standardHeaders: true,
    legacyHeaders: false,
});
export { generalLimiter, strictLimiter };
//# sourceMappingURL=rateLimiter.js.map