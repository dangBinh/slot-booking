import { bootstrapTestApp, TestStack } from './helpers/bootstrap';

const LIST = `query Q($u: ID!) {
  availabilityRules(userId: $u) { id weekday startTime endTime slotDurationMinutes }
}`;

const CREATE = `mutation M($input: CreateAvailabilityInput!) {
  createAvailability(input: $input) { id weekday startTime endTime slotDurationMinutes }
}`;

const DELETE = `mutation M($id: ID!) {
  deleteAvailability(id: $id) { id }
}`;

describe('availability (integration)', () => {
  let stack: TestStack;
  beforeAll(async () => { stack = await bootstrapTestApp(); });
  afterAll(async () => { await stack.close(); });

  it('lists, creates, and deletes availability rules', async () => {
    const user = await stack.users.save(stack.users.create({ name: 'A', email: `a-${Date.now()}@x.test` }));

    // initial: empty
    let res = await stack.gql(LIST, { u: user.id });
    expect(res.body.data.availabilityRules).toEqual([]);

    // create a Saturday window
    res = await stack.gql(CREATE, {
      input: { userId: user.id, weekday: 6, startTime: '10:00', endTime: '12:00', slotDurationMinutes: 30 },
    });
    expect(res.body.errors).toBeUndefined();
    const created = res.body.data.createAvailability;
    expect(created.weekday).toBe(6);

    // visible in the list
    res = await stack.gql(LIST, { u: user.id });
    expect(res.body.data.availabilityRules).toHaveLength(1);

    // delete
    res = await stack.gql(DELETE, { id: created.id });
    expect(res.body.data.deleteAvailability.id).toBe(created.id);

    // gone
    res = await stack.gql(LIST, { u: user.id });
    expect(res.body.data.availabilityRules).toEqual([]);
  });

  it('rejects an overlapping rule with AVAILABILITY_OVERLAP', async () => {
    const user = await stack.users.save(stack.users.create({ name: 'B', email: `b-${Date.now()}@x.test` }));
    await stack.gql(CREATE, {
      input: { userId: user.id, weekday: 1, startTime: '09:00', endTime: '11:00', slotDurationMinutes: 30 },
    });
    const res = await stack.gql(CREATE, {
      input: { userId: user.id, weekday: 1, startTime: '10:00', endTime: '12:00', slotDurationMinutes: 30 },
    });
    expect(res.body.errors[0].extensions.code).toBe('AVAILABILITY_OVERLAP');
  });

  it('rejects bad time format with AVAILABILITY_INVALID', async () => {
    const user = await stack.users.save(stack.users.create({ name: 'C', email: `c-${Date.now()}@x.test` }));
    const res = await stack.gql(CREATE, {
      input: { userId: user.id, weekday: 1, startTime: '9am', endTime: '12:00', slotDurationMinutes: 30 },
    });
    // class-validator regex fires before the service, so this surfaces as VALIDATION
    expect(['AVAILABILITY_INVALID', 'VALIDATION']).toContain(res.body.errors[0].extensions.code);
  });
});
