import { bootstrapTestApp, seedUserWithRule, TestStack } from './helpers/bootstrap';

const CREATE = `
mutation M($input: CreateBookingInput!) {
  createBooking(input: $input) {
    id startAt endAt status customerName customerEmail
  }
}`;

describe('createBooking mutation (integration)', () => {
  let stack: TestStack;
  beforeAll(async () => { stack = await bootstrapTestApp(); });
  afterAll(async () => { await stack.close(); });

  it('creates a booking and marks the slot as BOOKED in subsequent slots query', async () => {
    const { userId, mondayAt } = await seedUserWithRule(stack);
    const startAt = mondayAt(9, 0).toISOString();
    const takenIso = startAt;

    const res = await stack.gql(CREATE, {
      input: { userId, startAt, customerName: 'Bob', customerEmail: 'bob@x.test' },
    });
    expect(res.status).toBe(200);
    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.createBooking.status).toBe('CONFIRMED');

    const slotsRes = await stack.gql(
      `query Q($u: ID!, $from: DateTime!, $to: DateTime!) {
         slots(userId: $u, from: $from, to: $to) { start status }
       }`,
      { u: userId, from: '2026-06-01T00:00:00.000Z', to: '2026-06-02T00:00:00.000Z' },
    );
    const slots = slotsRes.body.data.slots;
    const target = slots.find((s: any) => s.start === takenIso);
    expect(target).toBeDefined();
    expect(target.status).toBe('BOOKED');
  });

  it('returns SLOT_NOT_IN_AVAILABILITY when startAt is off the grid', async () => {
    const { userId } = await seedUserWithRule(stack);
    const res = await stack.gql(CREATE, {
      input: {
        userId,
        startAt: '2026-06-01T09:15:00.000Z',
        customerName: 'Bob',
        customerEmail: 'bob@x.test',
      },
    });
    expect(res.status).toBe(200);
    expect(res.body.errors[0].extensions.code).toBe('SLOT_NOT_IN_AVAILABILITY');
  });

  it('returns VALIDATION when customerEmail is malformed', async () => {
    const { userId, mondayAt } = await seedUserWithRule(stack);
    const res = await stack.gql(CREATE, {
      input: { userId, startAt: mondayAt(9, 30).toISOString(), customerName: 'Bob', customerEmail: 'not-an-email' },
    });
    expect(res.body.errors[0].extensions.code).toBe('VALIDATION');
  });
});
