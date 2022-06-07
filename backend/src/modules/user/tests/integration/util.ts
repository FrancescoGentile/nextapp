//
//
//

// eslint-disable-next-line import/no-extraneous-dependencies
import supertest from 'supertest';
import { User } from '../../src/domain/models/user';

export async function get_token(request: supertest.SuperTest<any>, user: User) {
  const res = await request.post('/login').send({
    username: user.credentials.username.to_string(),
    password: 'ReallyComplicatedPassword',
  });
  return res.body.token;
}
