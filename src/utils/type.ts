import { JWT } from "@fastify/jwt";

declare module 'fastify' {
    interface FastifyRequest {
        jwt: JWT;
    }

    interface FastifyInstance {
        jwt: JWT;
    }
}

type UserPayload = {
    id: string;
    email: string;
    name: string;
}

declare module '@fastify/jwt' {
    interface FastifyJWT {
        user: UserPayload;
    }
}