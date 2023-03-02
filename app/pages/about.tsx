import Head from "next/head";
import Image from "next/image";

const About = () => (
  <>
    <Head>
      <title>About - ScoreCast.wtf</title>
      <meta name="description" content="ScoreCast" />
    </Head>
    <header className="mx-auto max-w-6xl px-6 lg:px-8 pt-4 pb-8">
      <h1 className="text-5xl font-thin leading-tight tracking-tight text-gray-900">About</h1>
    </header>
    <div className="bg-gray-100 pb-14">
      <div className="mx-auto max-w-6xl sm:px-6 lg:px-8 pb- pt-5 ">
      <div className="mx-auto w-full rounded-lg bg-white py-8 lg:px-20 md:px-10 px-6"></div>
      </div>
    </div>
  </>
);

export default About;
