import { type AppType } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { Toaster } from "react-hot-toast";
import Head from "next/head";
import ReplyModal from "~/components/ReplyModal";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider {...pageProps}>
      <Head>
        <title>Twitter Clone</title>
        <meta name="description" content="Twitter Clone by Abdul Rehman Daniyal" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Toaster position="bottom-center" />
      <Component {...pageProps} />
      <ReplyModal />
    </ClerkProvider>
  )
};

export default api.withTRPC(MyApp);
