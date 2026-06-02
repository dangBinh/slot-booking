import { bootstrapTestApp, TestStack } from './helpers/bootstrap';

describe('users query (integration)', () => {
  let stack: TestStack;
  beforeAll(async () => { stack = await bootstrapTestApp(); });
  afterAll(async () => { await stack.close(); });

  it('returns seeded users', async () => {
    await stack.users.save(stack.users.create({ name: 'Alice', email: 'alice@x.test' }));
    const res = await stack.gql(`{ users { id name email } }`);
    expect(res.status).toBe(200);
    expect(res.body.data.users).toHaveLength(1);
    expect(res.body.data.users[0].email).toBe('alice@x.test');
  });
});
