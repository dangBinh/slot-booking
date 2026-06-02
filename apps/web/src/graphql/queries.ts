import { gql } from '@apollo/client';

export const USERS_QUERY = gql`
  query Users { users { id name email } }
`;

export const SLOTS_QUERY = gql`
  query Slots($userId: ID!, $from: DateTime!, $to: DateTime!) {
    slots(userId: $userId, from: $from, to: $to) { userId start end status }
  }
`;
