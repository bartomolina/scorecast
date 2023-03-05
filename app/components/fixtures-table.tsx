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
          className="grid grid-cols-3 gap-4 bg-white rounded p-5 shadow hover:shadow-md hover:-translate-y-1 transform transition"
        >
          <div className="grid grid-cols-2 items-center">
            <Image className="pl-6" src={fixture.home.logo} alt={fixture.home.name} width={85} height={85} />
            <div className="text-center">
              <div className="font-semibold text-2xl text-gray-700">{fixture.home.name}</div>
              {!isNaN(fixture.home.goals) && <div className="text-3xl text-gray-900">{fixture.home.goals}</div>}
            </div>
          </div>
          <div className="text-center justify-center text-gray-600">
            <div className="items-center justify-center flex">
              <ClockIcon className="inline mr-1 h-4 w-4" />
              {new Date(fixture.date * 1000).toUTCString()}
            </div>
            <div className="mt-1 items-center justify-center flex">
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

    // <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
    //   <table className="min-w-full divide-y divide-gray-300">
    //     <thead className="bg-gray-50">
    //       <tr>
    //         <th scope="col" className="p-3 text-left text-sm font-semibold text-gray-900">
    //           Home
    //         </th>
    //         <th scope="col" className="p-3 text-left text-sm font-semibold text-gray-900">
    //           Away
    //         </th>
    //       </tr>
    //     </thead>
    //     <tbody className="divide-y divide-gray-200 bg-white">
    //       {fixtures.map((fixture) => (
    //         <tr key={fixture.id} className="h-16 hover:bg-gray-50">
    //           <td className="pl-6">
    //             <div className="font-semibold text-xl text-gray-800">
    //               {fixture.home.name}
    //             </div>
    //           </td>
    //           <td>
    //             <div className="text-gray-500">{fixture.away.name}</div>
    //           </td>
    //         </tr>
    //       ))}
    //     </tbody>
    //   </table>
    // </div>
  );
};

export default FixturesTable;
