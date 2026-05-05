import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Role } from "@prisma/client";
import e from "express";
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Airbnb Backend API",
            version: "1.0.0",
            description: "REST API for Airbnb listings, users, and authentication",
        },
        servers: [
            {
                url: "http://localhost:3000/api/v1",
                description: "Development server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            schemas: {
                User: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                            format: "uuid",
                        },
                        name: {
                            type: "string",
                        },
                        email: {
                            type: "string",
                            format: "email",
                        },
                        password: {
                            type: "string",
                            format: "password",
                        },
                    },
                    required: ["name", "email", "password"],
                },
                Listing: {
                    type: "object",
                    properties: {
                        title: {
                            type: "string",
                            example: "Cozy Apartment in Downtown",
                        },
                        description: {
                            type: "string",
                            example: "A cozy apartment located in the heart of the city, close to all attractions.",
                        },
                        price: {
                            type: "number",
                            format: "float",
                            example: 150.0,
                        },
                        location: {
                            type: "string",
                            example: "123 Main St, Anytown, USA",
                        },
                        hostId: {
                            type: "string",
                            format: "uuid",
                            example: "3",
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                            example: "2023-01-01T00:00:00Z",
                        },
                    },
                    required: ["title", "description", "price", "location", "hostId"],
                },
                Bookings: {
                    type: "object",
                    properties: {
                        listingId: {
                            type: "string",
                            format: "uuid",
                        },
                        userId: {
                            type: "string",
                            format: "uuid",
                        },
                        startDate: {
                            type: "string",
                            format: "date",
                        },
                        endDate: {
                            type: "string",
                            format: "date",
                        },
                    },
                    required: ["listingId", "userId", "startDate", "endDate"],
                },
                UploadImage: {
                    type: "object",
                    properties: {
                        listingId: {
                            type: "string",
                            format: "uuid",
                        },
                        imageUrl: {
                            type: "string",
                            format: "uri",
                        },
                    },
                    required: ["listingId", "imageUrl"],
                },
                LoginRequest: {
                    type: "object",
                    properties: {
                        email: {
                            type: "string",
                            format: "email",
                        },
                        password: {
                            type: "string",
                            format: "password",
                        },
                    },
                    required: ["email", "password"],
                },
                LoginResponse: {
                    type: "object",
                    properties: {
                        token: {
                            type: "string",
                        },
                    },
                },
                ErrorResponse: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                        },
                    },
                },
                RegisterInput: {
                    type: "object",
                    properties: {
                        name: {
                            type: "string",
                        },
                        email: {
                            type: "string",
                            format: "email",
                        },
                        username: {
                            type: "string",
                        },
                        phone: {
                            type: "string",
                        },
                        Role: {
                            type: "string",
                            enum: Object.values(Role),
                        },
                        password: {
                            type: "string",
                            format: "password",
                        },
                    },
                    required: ["name", "email", "password"],
                },
                UpdateUserInput: {
                    type: "object",
                    properties: {
                        name: {
                            type: "string",
                            example: "John Doe",
                        },
                        email: {
                            type: "string",
                            format: "email",
                            example: "john.doe@example.com",
                        },
                        username: {
                            type: "string",
                            example: "john_doe",
                        },
                        phone: {
                            type: "string",
                            example: "1234567890",
                        },
                        Role: {
                            type: "string",
                            enum: Object.values(Role),
                            example: "GUEST",
                        },
                        password: {
                            type: "string",
                            format: "password",
                            example: "new_secure_password",
                        },
                    },
                },
            },
        },
    },
    apis: ["./src/routes/v1/*.ts"],
};
const swaggerSpec = swaggerJsdoc(options);
export function setupSwagger(app) {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.get("/api-docs.json", (req, res) => {
        res.json(swaggerSpec);
    });
    console.log("Swagger docs available at http://localhost:3000/api-docs");
}
//# sourceMappingURL=swagger.js.map