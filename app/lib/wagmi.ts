import { createClient } from "wagmi";
import { polygonMumbai } from "wagmi/chains";
import { getDefaultClient } from "connectkit";

const client = createClient(
  getDefaultClient({
    appName: "WAGMI",
    alchemyId:  process.env.NEXT_PUBLIC_ALCHEMY_MUMBAI_API,
    chains: [polygonMumbai],
  })
);

export default client;
