import { bootstrapTestApp, seedUserWithRule, TestStack } from './helpers/bootstrap';

const SLOTS = `query Q($u: ID!, $from: DateTime!, $to: DateTime!) {
  slots(userId: $u, from: $from, to: $to) { start status }
}`;

const CREATE_BL = `mutation M($input: CreateBlackoutInput!) {
  createBlackout(input: $input) { id startAt endAt }
}`;

const DELETE_BL = `mutation M($id: ID!) { deleteBlackout(id: $id) { id } }`;

const CREATE_BOOKING = `mutation M($input: CreateBookingInput!) {
  createBooking(input: $input) { id }
}`;

describe('blackouts (integration)', () => {
  let stack: TestStack;
  beforeAll(async () => { stack = await bootstrapTestApp(); });
  afterAll(async () => { await stack.close(); });

  it('blackout marks slot as BLOCKED, blocks booking, delete restores to AVAILABLE', async () => {
    const { userId, mondayAt } = await seedUserWithRule(stack);
    const startAtIso = mondayAt(10, 0).toISOString();

    let res = await stack.gql(SLOTS, { u: userId, from: '2026-06-01T00:00:00.000Z', to: '2026-06-02T00:00:00.000Z' });
    const beforeSlot = res.body.data.slots.find((s: any) => s.start === startAtIso);
    expect(beforeSlot.status).toBe('AVAILABLE');

    res = await stack.gql(CREATE_BL, { input: { userId, startAt: startAtIso } });
    expect(res.body.errors).toBeUndefined();
    const blackoutId = res.body.data.createBlackout.id;
    expect(res.body.data.createBlackout.endAt).toBe('2026-06-01T10:30:00.000Z');

    res = await stack.gql(SLOTS, { u: userId, from: '2026-06-01T00:00:00.000Z', to: '2026-06-02T00:00:00.000Z' });
    const afterBlackout = res.body.data.slots.find((s: any) => s.start === startAtIso);
    expect(afterBlackout.status).toBe('BLOCKED');

    res = await stack.gql(CREATE_BOOKING, {
      input: { userId, startAt: startAtIso, customerName: 'Bob', customerEmail: 'b@x.test' },
    });
    expect(res.body.errors[0].extensions.code).toBe('SLOT_BLACKED_OUT');

    res = await stack.gql(DELETE_BL, { id: blackoutId });
    expect(res.body.data.deleteBlackout.id).toBe(blackoutId);

    res = await stack.gql(SLOTS, { u: userId, from: '2026-06-01T00:00:00.000Z', to: '2026-06-02T00:00:00.000Z' });
    const afterDelete = res.body.data.slots.find((s: any) => s.start === startAtIso);
    expect(afterDelete.status).toBe('AVAILABLE');
  });

  it('blackout over a confirmed booking → SLOT_TAKEN', async () => {
    const { userId, mondayAt } = await seedUserWithRule(stack);
    const startAtIso = mondayAt(9, 0).toISOString();
    let res = await stack.gql(CREATE_BOOKING, {
      input: { userId, startAt: startAtIso, customerName: 'Bob', customerEmail: 'b@x.test' },
    });
    expect(res.body.errors).toBeUndefined();
    res = await stack.gql(CREATE_BL, { input: { userId, startAt: startAtIso } });
    expect(res.body.errors[0].extensions.code).toBe('SLOT_TAKEN');
  });

  it('blackout off-grid → SLOT_NOT_IN_AVAILABILITY', async () => {
    const { userId } = await seedUserWithRule(stack);
    const res = await stack.gql(CREATE_BL, {
      input: { userId, startAt: '2026-06-01T09:15:00.000Z' },
    });
    expect(res.body.errors[0].extensions.code).toBe('SLOT_NOT_IN_AVAILABILITY');
  });
});
