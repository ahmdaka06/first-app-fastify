import { z } from "zod";
import { buildJsonSchemas } from "fastify-zod";

// data that we nned from user to register
export const createRegisterSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2)
});

// exporting the type to provide to the request Body 
export type CreateRegisterInput = z.infer<typeof createRegisterSchema>;

// response schema for the registering user 
const registerResponseSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string().min(2)
});

// same for login route
export const createLoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8)
});

export type CreateLoginInput = z.infer<typeof createLoginSchema>;

const loginResponseSchema = z.object({
    accesToken: z.string(),
});

// to build our JSON schema, we user buildJsonSchemas from fastify-zod
// it returns all the schemas to register and a ref to refer these schemas

export const {
    schemas: userSchemas,
    $ref
} = buildJsonSchemas({
    createRegisterSchema,
    registerResponseSchema,
    createLoginSchema,
    loginResponseSchema
});