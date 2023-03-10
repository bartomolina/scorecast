import "../styles/globals.css";
import Head from "next/head";
import type { AppProps } from "next/app";
import { WagmiConfig } from "wagmi";
import { ConnectKitProvider } from "connectkit";
import client from "../lib/wagmi";
import { ScoreCastProvider } from "../components/scorecast-context";
import { NotificationsProvider } from "../components/notifications-context";
import Layout from "../components/layout";
import Notification from "../components/notification";

const App = ({ Component, pageProps }: AppProps) => (
  <>
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>
    <WagmiConfig client={client}>
      <ConnectKitProvider theme="auto" mode="light">
        <NotificationsProvider>
          <ScoreCastProvider>
            <Layout>
              <Component {...pageProps} />
              <Notification />
            </Layout>
          </ScoreCastProvider>
        </NotificationsProvider>
      </ConnectKitProvider>
    </WagmiConfig>
  </>
);

export default App;
