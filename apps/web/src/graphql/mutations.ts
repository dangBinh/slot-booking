import { gql } from '@apollo/client';

export const CREATE_BOOKING_MUTATION = gql`
  mutation CreateBooking($input: CreateBookingInput!) {
    createBooking(input: $input) { id startAt endAt status }
  }
`;
