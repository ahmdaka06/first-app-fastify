import Fastify, { FastifyRequest, FastifyReply } from "fastify";

import fjwt, { FastifyJWT } from '@fastify/jwt';
import fCookie from '@fastify/cookie';

import 'dotenv/config';

import { userRoutes } from './modules/user/user.route';
import { userSchemas } from './modules/user/user.schema';

const app = Fastify({logger: true});

app.decorate('authenticate', async (req: FastifyRequest, reply: FastifyReply) => {
	const token = req.cookies.access_token;

	if(!token) {
		return reply.status(401).send({message: 'Authentication required'});
	}

	const decoded = req.jwt.verify<FastifyJWT['user']>(token);

	req.user = decoded;
});

const secret = process.env.JWT_SECRET;

// jwt
if(secret) {
	app.register(fjwt, { secret});

	app.addHook('preHandler', (req, res, next) => {
		// here we are
		req.jwt = app.jwt
		return next()
	});

	// cookies
	app.register(fCookie, {
        secret: 'some-secret-key',
        hook: 'preHandler',
	})

	// graceful shutdown
	const listeners = ['SIGINT', 'SIGTERM'];

	listeners.forEach(signal => {
		process.on(signal, async () => {
			await app.close();
			process.exit(0);
		})
	})

	app.register(userRoutes, {
        prefix: 'api/users'
    });

	// loop through schemas and add to the app
	for (let schema of [...userSchemas]) {
		app.addSchema(schema);
	}

	app.get('/healthcheck', (req: FastifyRequest, res: FastifyReply) => {
		res.send({message: 'Success'});
	});

	async function main () {
		console.log('starting server');
		await app.listen({
			port: 8000,
			host: 'localhost'
		})
	}

	main();
}