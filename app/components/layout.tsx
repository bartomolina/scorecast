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
      <rect width="100%" height="100%" stroke-width="0" fill="url(#0787a7c5-978c-4f66-83c7-11c213f99cb7)"></rect>
    </svg>
    <div className={`${montserrat.variable} font-sans min-h-full`}>
      <Nav />
      <div>{children}</div>
      <div className="sticky top-[100vh]">
        <Footer />
      </div>
    </div>
  </>
);

export default Layout;
