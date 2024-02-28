import { FastifyReply, FastifyRequest } from "fastify";
import bcrypt from 'bcrypt';
import { CreateRegisterInput, CreateLoginInput } from "./user.schema";
import prisma from '../../utils/prisma';

const SALT_ROUNDS = 10

export async function getUsers (
    req: FastifyRequest<{
        Body: CreateRegisterInput;
    }>,
    reply: FastifyReply
) {

    const users = await prisma.user.findMany({
            select: {
                name: true,
                id: true,
                email: true,
            },
        });

    return reply.code(200).send(users);
}

export async function login (
    req: FastifyRequest<{
        Body: CreateLoginInput;
    }>,
    reply: FastifyReply
) : Promise<{accessToken: string}>{

    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
        where: {
            email
        }
    });

    const isMatch: boolean | null = user && (await bcrypt.compare(password, user.password));

    if (!user || !isMatch) {
        return reply.code(401).send({ message: "Invalid email or password" });
    }

    const payload = {
        id: user.id,
        email: user.email,
        name: user.name
    }

    const token = req.jwt.sign(payload);

    reply.setCookie('access_token', token, {
		path: '/',
		httpOnly: true,
		secure: true
	});

	return {accessToken: token}

}

export async function register (
    req: FastifyRequest<{
        Body: CreateRegisterInput;
    }>,
    reply: FastifyReply
) {

    const { email, password, name } = req.body;

    const existingUser = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if (existingUser) {
        return reply.code(400).send({ message: "Email already exists" });
    }

    try {
        
        const hash = await bcrypt.hash(password, SALT_ROUNDS);

        const user = await prisma.user.create({
            data: {
                email,
                password: hash,
                name
            }
        });

        return reply.code(201).send(user);
    } catch (error) {
        console.log(error);
        return reply.code(500).send({ message: "Something went wrong" });
    }
}

export async function logout (
    req: FastifyRequest,
    reply: FastifyReply
) {
    reply.clearCookie('access_token');
    return reply.code(200).send({message: 'Logged out'});
}