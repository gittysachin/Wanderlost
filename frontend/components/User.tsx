import { useQuery, gql } from '@apollo/client';

const CURRENT_USER_QUERY = gql`
  query {
    user {
      id
      email
      name
      permissions
      cart {
        id
        quantity
        item {
          id
          price
          image
          title
          description
        }
      }
    }
  }
`;

function useUser() {
  const { data } = useQuery(CURRENT_USER_QUERY);
  if (data) {
    return data.user;
  }
  return null;
}

export { CURRENT_USER_QUERY, useUser };