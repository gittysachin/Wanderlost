import App from 'next/app';
import { ApolloProvider } from '@apollo/react-hooks';
import Page from '../components/Page';
import withData from '../lib/withData';
import { CartStateProvider } from '../components/LocalState';
import { StripeProvider } from 'react-stripe-elements';

function MyApp({ Component, apollo, pageProps }) {
  return (
    <ApolloProvider client={apollo}>
      <CartStateProvider>
        {/* <StripeProvider apiKey="pk_test_zywrqZUXI6crPwbzolFxAyF100AF2Wh0HA"> */}
        <Page>
          <Component {...pageProps} />
        </Page>
        {/* </StripeProvider> */}
      </CartStateProvider>
    </ApolloProvider>
  );
}

MyApp.getInitialProps = async ({ Component, ctx }) => {
  let pageProps = {};
  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(ctx);
  }
  // this exposes the query to the user
  pageProps.query = ctx.query;
  return { pageProps };
}

export default withData(MyApp);
