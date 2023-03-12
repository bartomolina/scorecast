import { IFixture } from "../global";
import { createContext, useContext, useEffect, useState } from "react";
import useSWR from "swr";
import axios from "axios";
import { readContract } from "@wagmi/core";

import ConsumerContractJSON from "../lib/contracts/consumer-contract.json";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

const ScoreCastContext = createContext({
  fixtures: [] as IFixture[],
  fetchFixtures: () => {},
});

export const useScoreCast = () => useContext(ScoreCastContext);

export const ScoreCastProvider = ({ children }: React.PropsWithChildren) => {
  const { data } = useSWR("/api/getFixtures", fetcher);
  const [fixtures, setFixtures] = useState([] as IFixture[]);

  const fetchFixtures = () => {
    if (data) {
      readContract({
        address: ConsumerContractJSON.address,
        abi: ConsumerContractJSON.abi as any,
        functionName: "getActivePools",
      }).then((pools: any) => {
        // Transform returned array from ethers into an objects array
        pools.forEach((fixtureId: string) => {
          data.find((fixture: any) => fixture.id === parseInt(fixtureId)).active = true;
        });
        setFixtures(data);
      });
    }
  };

  useEffect(() => {
    fetchFixtures();
  }, [data]);

  return <ScoreCastContext.Provider value={{ fixtures, fetchFixtures }}>{children}</ScoreCastContext.Provider>;
};
