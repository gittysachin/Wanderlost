import {
  render,
  screen,
  userEvent,
  fakeUser,
  fakeCartItem,
} from '../lib/test-utils'
import { ApolloConsumer } from '@apollo/client'
import AddToCart, { ADD_TO_CART_MUTATION } from '../components/AddToCart'
import { CURRENT_USER_QUERY } from '../components/User'

const mocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: {
      data: {
        authenticatedUser: {
          ...fakeUser(),
          cart: [],
        },
      },
    },
  },
  {
    request: { query: CURRENT_USER_QUERY },
    result: {
      data: {
        authenticatedUser: {
          ...fakeUser(),
          cart: [fakeCartItem('abc123')],
        },
      },
    },
  },
  {
    request: { query: ADD_TO_CART_MUTATION, variables: { id: 'abc123' } },
    result: {
      data: {
        addToCart: {
          ...fakeCartItem('abc123'),
          quantity: 1,
        },
      },
    },
  },
]

describe('<AddToCart/>', () => {
  it('renders and matches the snap shot', async () => {
    const { container } = render(<AddToCart id="abc123" />, {
      mocks,
      addTypename: false,
    })
    expect(container).toMatchSnapshot()
  })

  //   it('adds an item to cart when clicked', async () => {
  //     // Here I show you how to reach directly into the apollo cache to test the data.
  //     // This is against react-testing-library's whole ethos but I'm gonna show you anyway
  //     let apolloClient
  //     const { container } = render(
  //       <ApolloConsumer>
  //         {(client) => {
  //           apolloClient = client
  //           return <AddToCart id="abc123" />
  //         }}
  //       </ApolloConsumer>,
  //       { mocks, addTypename: false }
  //     )
  //     // check that the cart is empty to start
  //     const {
  //       data: { authenticatedUser: me },
  //     } = await apolloClient.query({ query: CURRENT_USER_QUERY })
  //     expect(me.cart).toHaveLength(0)
  //     // Click the button
  //     userEvent.click(screen.getByText(/Add To Cart/))
  //     // it should be in loading state
  //     expect(container).toHaveTextContent(/Adding to Cart/i)
  //     // wait until we come back from loading state
  //     await screen.findByText(/Add To Cart/i)
  //     // await waitFor(() => {}) // wait for next tick, weird apollo event loop thing
  //     // check if the item is in the cart
  //     const {
  //       data: { authenticatedUser: me2 },
  //     } = await apolloClient.query({ query: CURRENT_USER_QUERY })
  //     expect(me2.cart).toHaveLength(1)
  //     expect(me2.cart[0].id).toBe('omg123')
  //     expect(me2.cart[0].quantity).toBe(3)
  //   })
})