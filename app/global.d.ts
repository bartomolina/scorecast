import { BigNumber } from "ethers";

interface Window {
  ethereum: ExternalProvider;
}

interface IFixture {
  home: string;
  away: string;
}