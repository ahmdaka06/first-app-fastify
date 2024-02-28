import { FastifyInstance } from 'fastify';
import { $ref } from './user.schema';

import { register, getUsers, login, logout } from './user.controller';

export async function userRoutes(app: FastifyInstance) {
	app.get('/', {}, getUsers);

	app.get('/all', {}, getUsers);

	app.delete('/logout', {}, logout)

	app.post('/register', {
		schema: {
			body: $ref('createRegisterSchema'),
			response: {
				201: $ref('registerResponseSchema')
			}
		}
	}, register);

	app.post('/login', {
		schema: {
			body: $ref('createLoginSchema'),
			response: {
				201: $ref('loginResponseSchema')
			}
		}
	}, login);

	app.post('/logout', () => {});

	app.log.info('user routes registered');
}

