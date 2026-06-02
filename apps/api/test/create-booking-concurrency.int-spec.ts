import { bootstrapTestApp, seedUserWithRule, TestStack } from './helpers/bootstrap';

const CREATE = `
mutation M($input: CreateBookingInput!) {
  createBooking(input: $input) { id }
}`;

describe('createBooking concurrency (integration)', () => {
  let stack: TestStack;
  beforeAll(async () => { stack = await bootstrapTestApp(); });
  afterAll(async () => { await stack.close(); });

  it('exactly one of two simultaneous requests for the same slot succeeds', async () => {
    const { userId, mondayAt } = await seedUserWithRule(stack);
    const startAt = mondayAt(10, 0).toISOString();

    const fire = () => stack.gql(CREATE, {
      input: { userId, startAt, customerName: 'Bob', customerEmail: 'bob@x.test' },
    });

    const [a, b] = await Promise.all([fire(), fire()]);

    const codes = [a, b].map(r =>
      r.body.errors?.[0]?.extensions?.code ?? 'OK',
    );
    expect(codes.sort()).toEqual(['OK', 'SLOT_TAKEN']);
  });
});
