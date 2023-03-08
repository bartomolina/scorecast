import { IFixture } from "../global";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { MapPinIcon, ClockIcon } from "@heroicons/react/24/outline";

type Props = {
  fixtures: IFixture[];
};

const FixturesTable = ({ fixtures }: Props) => {
  const router = useRouter();

  return (
    <div className="space-y-4">
      {fixtures.map((fixture) => (
        <Link
          href={`/matches/${fixture.id}`}
          key={fixture.id}
          className="grid grid-cols-3 gap-4 bg-white rounded p-5 shadow hover:cursor-pointer hover:shadow-md hover:-translate-y-1 transform transition"
        >
          <div className="grid grid-cols-2 items-center">
            <Image className="pl-6" src={fixture.home.logo} alt={fixture.home.name} width={85} height={85} />
            <div className="text-center">
              <div className="font-semibold text-2xl text-gray-700">{fixture.home.name}</div>
              {!isNaN(fixture.home.goals) && <div className="text-3xl text-gray-900">{fixture.home.goals}</div>}
            </div>
          </div>
          <div className="text-center justify-center text-gray-600">
            <div className="flex justify-center text-center items-center">
              <ClockIcon className="inline mr-1 h-4 w-4" />
              {new Date(fixture.date * 1000).toUTCString()}
            </div>
            <div className="mt-1 flex justify-center text-center items-center">
              <MapPinIcon className="inline mr-1 h-4 w-4" />
              {fixture.venue}
            </div>
            <div
              className={`inline-block text-sm mt-3 px-2 rounded text-white ${
                fixture.status === "Match Finished"
                  ? "bg-green-500"
                  : fixture.status === "First Half"
                  ? "bg-orange-500"
                  : "bg-red-500"
              }`}
            >
              {fixture.status}
            </div>
          </div>
          <div className="grid grid-cols-2 items-center">
            <div className="text-center">
              <div className="font-semibold text-2xl text-gray-700">{fixture.away.name}</div>
              {!isNaN(fixture.home.goals) && <div className="text-3xl text-gray-900">{fixture.away.goals}</div>}
            </div>
            <Image
              className="pr-6 justify-self-end"
              src={fixture.away.logo}
              alt={fixture.away.name}
              width={85}
              height={85}
            />
          </div>
        </Link>
      ))}
    </div>
  );
};

export default FixturesTable;
