import NProgress from 'nprogress';
import StripeCheckout from 'react-stripe-checkout';
import { useMutation } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import { useRouter } from 'next/router';
import calcTotalPrice from '../lib/calcTotalPrice';
import { useCart } from './LocalState';
import { CURRENT_USER_QUERY, useUser } from './User';

const CREATE_ORDER_MUTATION = gql`
  mutation checkout($token: String!) {
    checkout(token: $token) {
      id
      charge
      total
      items {
        id
        title
      }
    }
  }
`;

function totalItems(cart) {
  return cart.reduce((tally, cartItem) => tally + cartItem.quantity, 0);
}


function TakeMyMoney({ children }) {
  const authenticatedUser = useUser();
  const { toggleCart } = useCart();
  const router = useRouter();

  const [checkout, { loading }] = useMutation(CREATE_ORDER_MUTATION, {
    update: () => toggleCart(false),
    refetchQueries: [{ query: CURRENT_USER_QUERY }],
  });

  async function onToken(res) {
    NProgress.start();
    // Manually call the mutation once we have the stripe token
    const order = await checkout({
      variables: {
        token: res.id,
      },
    }).catch((err) => {
      alert(err.message);
    });
    router.push({
      pathname: '/order',
      query: { id: order.data.checkout.id },
    });
  }

  if (loading) return null;

  return (
    <StripeCheckout
      amount={calcTotalPrice(authenticatedUser.cart)}
      name="Sick Fits"
      description={`Order of ${totalItems(authenticatedUser.cart)} items!`}
      image={
        authenticatedUser.cart.length
        && authenticatedUser.cart[0].item
        && authenticatedUser.cart[0].item.image
      }
      stripeKey="pk_test_zywrqZUXI6crPwbzolFxAyF100AF2Wh0HA"
      currency="USD"
      email={authenticatedUser.email}
      token={(res) => onToken(res)}
    >
      {children}
    </StripeCheckout>
  );
}

export default TakeMyMoney;
