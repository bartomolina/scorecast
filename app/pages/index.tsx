import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

const About = () => (
  <>
    <Head>
      <title>About - ScoreCast.wtf</title>
      <meta name="description" content="ScoreCast" />
    </Head>
    <header className="mx-auto max-w-6xl px-6 lg:px-8 pt-4 pb-8 sr-only">
      <h1 className="text-5xl font-thin leading-tight tracking-tight text-gray-900">Home</h1>
    </header>
    {/* <div className="relative isolate overflow-hidden bg-white">
  <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 pb-14 lg:pt-8"> */}
    <div className="bg-transparent mx-auto max-w-7xl overflow-hidden px-6 pt-10 pb-24 sm:pb-32 lg:flex lg:py-40 lg:px-8">
      <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
        <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">Permissionless betting</h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          Permissionless on-chain betting using ChainLink Functions.
        </p>
        <div className="mt-10 flex items-center gap-x-6">
          <Link href={`/matches`} className="text-sm font-semibold leading-6 text-gray-900">
            All matches <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
      <div className="mx-auto block max-w-2xl ml-10">
        <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
          <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-2">
            <Image
              src="/screenshot.png"
              alt="ScoreCast screenshot"
              width={2432}
              height={1442}
              quality={100}
              className="w-[76rem] rounded-md shadow-2xl ring-1 ring-gray-900/10"
            />
          </div>
        </div>
      </div>
    </div>
  </>
);

export default About;
