import { BigNumber } from "ethers";

interface Window {
  ethereum: ExternalProvider;
}

interface ITeamInfo {
  id: number;
  name: string;
  logo: string;
  winner: boolean;
  goals: number;
}

interface IFixture {
  id: number;
  date: number;
  venue: string;
  status: string;
  round: string;
  home: TeamInfo;
  away: TeamInfo;
  active: boolean;
}