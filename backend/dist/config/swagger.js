import path from "path";
import { fileURLToPath } from "url";
import swaggerjsdoc from "swagger-jsdoc";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const docsPath = path.resolve(__dirname, "../docs/**/*.ts").replace(/\\/g, "/");
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Nursify API",
            version: "1.0.0",
            description: "Educational Platform for Nursing Students API built with Express, TS, and MongoDB",
            contact: {
                name: "Nursify Team",
            },
            servers: [
                {
                    url: "http://localhost:5000/",
                },
            ],
        },
        tags: [
            {
                name: "Auth",
                description: "Authentication APIs",
            },
            {
                name: "Users",
                description: "User management APIs",
            },
            {
                name: "Subjects",
                description: "Subject, Lecture, Summary, Audio Record, and Quiz APIs",
            },
            {
                name: "Notifications",
                description: "Notifications management APIs",
            },
            {
                name: "Stories",
                description: "Stories management APIs",
            },
            {
                name: "Chat",
                description: "Chat & Messaging APIs",
            },
        ],
    },
    apis: [docsPath],
};
const spacs = swaggerjsdoc(options);
export default spacs;
//# sourceMappingURL=swagger.js.map