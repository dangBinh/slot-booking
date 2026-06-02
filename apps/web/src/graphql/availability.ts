import { gql } from '@apollo/client';

export const AVAILABILITY_RULES_QUERY = gql`
  query AvailabilityRules($userId: ID!) {
    availabilityRules(userId: $userId) {
      id userId weekday startTime endTime slotDurationMinutes
    }
  }
`;

export const CREATE_AVAILABILITY_MUTATION = gql`
  mutation CreateAvailability($input: CreateAvailabilityInput!) {
    createAvailability(input: $input) {
      id userId weekday startTime endTime slotDurationMinutes
    }
  }
`;

export const DELETE_AVAILABILITY_MUTATION = gql`
  mutation DeleteAvailability($id: ID!) {
    deleteAvailability(id: $id) { id }
  }
`;
