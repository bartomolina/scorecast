import { PropsWithChildren } from "react";
import { Montserrat } from "@next/font/google";
import Nav from "./nav";
import Footer from "./footer";

const montserrat = Montserrat({
  style: ["normal"],
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const Layout = ({ children }: PropsWithChildren) => (
  <>
    <svg
      className="absolute inset-0 -z-10 h-full w-full stroke-gray-200 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="0787a7c5-978c-4f66-83c7-11c213f99cb7"
          width="200"
          height="200"
          x="50%"
          y="-1"
          patternUnits="userSpaceOnUse"
        >
          <path d="M.5 200V.5H200" fill="none"></path>
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth="0" fill="url(#0787a7c5-978c-4f66-83c7-11c213f99cb7)"></rect>
    </svg>
    <div className={`${montserrat.variable} font-sans min-h-full`}>
      <div className="relative isolate overflow-hidden flex text-center items-center justify-center py-3">
        <svg
          viewBox="0 0 577 310"
          aria-hidden="true"
          className="absolute top-1/2 left-[max(-7rem,calc(50%-52rem))] -z-10 w-[36.0625rem] -translate-y-1/2 transform-gpu blur-2xl"
        >
          <path
            id="1d77c128-3ec1-4660-a7f6-26c7006705ad"
            fill="url(#49a52b64-16c6-4eb9-931b-8e24bf34e053)"
            fillOpacity=".3"
            d="m142.787 168.697-75.331 62.132L.016 88.702l142.771 79.995 135.671-111.9c-16.495 64.083-23.088 173.257 82.496 97.291C492.935 59.13 494.936-54.366 549.339 30.385c43.523 67.8 24.892 159.548 10.136 196.946l-128.493-95.28-36.628 177.599-251.567-140.953Z"
          />
          <defs>
            <linearGradient
              id="49a52b64-16c6-4eb9-931b-8e24bf34e053"
              x1="614.778"
              x2="-42.453"
              y1="26.617"
              y2="96.115"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#9089FC" />
              <stop offset={1} stopColor="#FF80B5" />
            </linearGradient>
          </defs>
        </svg>
        <svg
          viewBox="0 0 577 310"
          aria-hidden="true"
          className="absolute top-1/2 left-[max(45rem,calc(50%+8rem))] -z-10 w-[36.0625rem] -translate-y-1/2 transform-gpu blur-2xl"
        >
          <use href="#1d77c128-3ec1-4660-a7f6-26c7006705ad" />
        </svg>
        <div className="text-sm font-semibold">
          Add Mumbai Network in{" "}
          <a href="https://chainlist.org/?testnets=true&search=mumbai" target="_blank" rel="noopener noreferrer" className="underline">
            ChainList
          </a>{" "}
          -{" "}
          <a href="https://mumbaifaucet.com/" target="_blank" rel="noopener noreferrer" className="underline">
            Get Test Tokens
          </a>
        </div>
      </div>
      <Nav />
      <div>{children}</div>
      <div className="sticky top-[100vh]">
        <Footer />
      </div>
    </div>
  </>
);

export default Layout;
