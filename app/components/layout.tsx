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
