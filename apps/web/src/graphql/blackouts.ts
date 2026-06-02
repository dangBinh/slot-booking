import { gql } from '@apollo/client';

export const BLACKOUT_SLOTS_QUERY = gql`
  query BlackoutSlots($userId: ID!, $from: DateTime!, $to: DateTime!) {
    blackoutSlots(userId: $userId, from: $from, to: $to) {
      id userId startAt endAt
    }
  }
`;

export const CREATE_BLACKOUT_MUTATION = gql`
  mutation CreateBlackout($input: CreateBlackoutInput!) {
    createBlackout(input: $input) { id userId startAt endAt }
  }
`;

export const DELETE_BLACKOUT_MUTATION = gql`
  mutation DeleteBlackout($id: ID!) {
    deleteBlackout(id: $id) { id }
  }
`;
