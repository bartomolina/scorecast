import { useRouter } from "next/router";
import Link, { LinkProps } from "next/link";
import React, { PropsWithChildren, useState, useEffect } from "react";

type ActiveLinksProps = LinkProps & {
  className?: string;
  activeClassName: string;
  inactiveClassName?: string;
};

const ActiveLink = ({
  children,
  activeClassName,
  inactiveClassName,
  className,
  ...props
}: PropsWithChildren<ActiveLinksProps>) => {
  const { asPath, isReady } = useRouter();
  const [computedClassName, setComputedClassName] = useState(className);

  useEffect(() => {
    // Check if the router fields are updated client-side
    if (isReady) {
      // Dynamic route will be matched via props.as
      // Static route will be matched via props.href
      let linkPathname;
      // @ts-ignore
      if (props.href.pathname) {
        // @ts-ignore
        linkPathname = new URL((props.as || props.href.pathname) as string, location.href).pathname;
      } else {
        linkPathname = new URL((props.as || props.href) as string, location.href).pathname;
      }

      // Using URL().pathname to get rid of query and hash
      const activePathname = new URL(asPath, location.href).pathname;

      const newClassName =
        linkPathname === activePathname || (linkPathname != "/" && activePathname.includes(linkPathname))
          ? `${activeClassName} ${className}`.trim()
          : `${inactiveClassName} ${className}`.trim();

      if (newClassName !== computedClassName) {
        setComputedClassName(newClassName);
      }
    }
  }, [asPath, isReady, props.as, props.href, activeClassName, inactiveClassName, className, computedClassName]);

  return (
    <Link className={computedClassName} {...props}>
      {children}
    </Link>
  );
};

export default ActiveLink;
