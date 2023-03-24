import { useClerk, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/router";
import { type PropsWithChildren } from "react";

type CustomProps = {
  headerText: string;
  showBackButton?: boolean;
};

const HomeSVG = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className="relative inline-block h-7 w-7 fill-current text-slate-200"
  >
    <g>
      <path d="M12 1.696L.622 8.807l1.06 1.696L3 9.679V19.5C3 20.881 4.119 22 5.5 22h13c1.381 0 2.5-1.119 2.5-2.5V9.679l1.318.824 1.06-1.696L12 1.696zM12 16.5c-1.933 0-3.5-1.567-3.5-3.5s1.567-3.5 3.5-3.5 3.5 1.567 3.5 3.5-1.567 3.5-3.5 3.5z"></path>
    </g>
  </svg>
);

const LogoutSVG = () => (
  <svg
    height="800px"
    width="800px"
    viewBox="0 0 490.3 490.3"
    className="relative inline-block h-7 w-7 fill-current text-slate-200 rotate-180"
  >
    <g>
      <g>
        <path
          d="M0,121.05v248.2c0,34.2,27.9,62.1,62.1,62.1h200.6c34.2,0,62.1-27.9,62.1-62.1v-40.2c0-6.8-5.5-12.3-12.3-12.3
			s-12.3,5.5-12.3,12.3v40.2c0,20.7-16.9,37.6-37.6,37.6H62.1c-20.7,0-37.6-16.9-37.6-37.6v-248.2c0-20.7,16.9-37.6,37.6-37.6h200.6
			c20.7,0,37.6,16.9,37.6,37.6v40.2c0,6.8,5.5,12.3,12.3,12.3s12.3-5.5,12.3-12.3v-40.2c0-34.2-27.9-62.1-62.1-62.1H62.1
			C27.9,58.95,0,86.75,0,121.05z"
        />
        <path
          d="M385.4,337.65c2.4,2.4,5.5,3.6,8.7,3.6s6.3-1.2,8.7-3.6l83.9-83.9c4.8-4.8,4.8-12.5,0-17.3l-83.9-83.9
			c-4.8-4.8-12.5-4.8-17.3,0s-4.8,12.5,0,17.3l63,63H218.6c-6.8,0-12.3,5.5-12.3,12.3c0,6.8,5.5,12.3,12.3,12.3h229.8l-63,63
			C380.6,325.15,380.6,332.95,385.4,337.65z"
        />
      </g>
    </g>
  </svg>
);

const BackArrowSVG = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className="relative inline-block h-8 w-8 max-w-full text-slate-200"
  >
    <g className="fill-current">
      <path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z"></path>
    </g>
  </svg>
);

const PageLayout = (props: PropsWithChildren<CustomProps>) => {
  const router = useRouter();
  const { signOut } = useClerk();
  const { isSignedIn } = useUser();
  return (
    <>
    <main className="relative flex min-h-screen flex-row">
      <div
        className="sticky top-0 bottom-0 left-0 flex h-screen w-full min-w-min flex-row justify-end p-2 lg:p-8"
        style={{ maxWidth: "calc((100% - 42rem) / 2)" }}
      >
        <nav className="flex w-full max-w-xs flex-col">
          <Link
            href="/"
            className="flex w-max flex-row items-center gap-x-4 rounded-full p-4 hover:bg-[#181818]"
          >
            <HomeSVG />
            <span className="hidden lg:block">Home</span>
          </Link>
          {!!isSignedIn &&
            <button
              className="mt-auto flex w-max flex-row items-center gap-x-4 rounded-full p-4 hover:bg-[#181818]"
              onClick={() => void signOut()}
            >
              <LogoutSVG />
              <span className="hidden lg:block">Logout</span>
            </button>
          }
        </nav>
      </div>
      <div className="relative flex-grow flex flex-col border-x border-slate-400 md:max-w-2xl">
        <div className="supports-backdrop-blur:bg-white/95s sticky top-0 z-40 flex flex-row items-center gap-x-2 border-b border-slate-400 p-4 backdrop-blur-3xl">
          {!!props.showBackButton && (
            <button
              onClick={() => {
                router.back();
              }}
            >
              <BackArrowSVG />
            </button>
          )}
          {!!props.headerText && (
            <h1 className="text-xl font-semibold">{props.headerText}</h1>
          )}
        </div>
        {props.children}
        <footer className="sticky bottom-0 w-full border-t border-slate-400 bg-black py-1 text-center md:max-w-2xl mx-auto">
          <span>{`Made with ❤️ by `}</span>
          <a
            className="text-slate-400 underline hover:text-slate-600"
            href="https://abdul-rehman-d.github.io/"
            target="_blank"
          >
            Abdul Rehman
          </a>
        </footer>
      </div>
    </main>
    </>
  );
};

export default PageLayout;
