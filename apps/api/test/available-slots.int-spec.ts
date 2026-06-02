import { bootstrapTestApp, seedUserWithRule, TestStack } from './helpers/bootstrap';

describe('slots query (integration)', () => {
  let stack: TestStack;
  beforeAll(async () => { stack = await bootstrapTestApp(); });
  afterAll(async () => { await stack.close(); });

  it('expands rules into slots and marks existing bookings as BOOKED', async () => {
    const { userId, mondayAt } = await seedUserWithRule(stack);
    await stack.bookings.save(stack.bookings.create({
      userId, startAt: mondayAt(10, 0), endAt: mondayAt(10, 30),
      customerName: 'Bob', customerEmail: 'bob@x.test',
    }));

    const res = await stack.gql(
      `query Q($u: ID!, $from: DateTime!, $to: DateTime!) {
         slots(userId: $u, from: $from, to: $to) { start end status }
       }`,
      {
        u: userId,
        from: '2026-06-01T00:00:00.000Z',
        to:   '2026-06-02T00:00:00.000Z',
      },
    );
    expect(res.status).toBe(200);
    const slots = res.body.data.slots;
    const starts = slots.map((s: any) => s.start);
    expect(starts).toContain('2026-06-01T09:00:00.000Z');
    expect(starts).toContain('2026-06-01T09:30:00.000Z');
    expect(starts).toContain('2026-06-01T10:00:00.000Z');
    expect(starts).toContain('2026-06-01T10:30:00.000Z');
    const booked = slots.find((s: any) => s.start === '2026-06-01T10:00:00.000Z');
    expect(booked.status).toBe('BOOKED');
    const available = slots.find((s: any) => s.start === '2026-06-01T09:00:00.000Z');
    expect(available.status).toBe('AVAILABLE');
  });
});
