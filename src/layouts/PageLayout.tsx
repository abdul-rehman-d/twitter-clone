import { useRouter } from "next/router";
import { type PropsWithChildren } from "react";

type CustomProps = {
  headerText: string;
  showBackButton?: boolean;
};

const BackArrowSVG = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className="text-slate-200 inline-block max-w-full relative h-8 w-8"
  >
    <g className="fill-current">
      <path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z"></path>
    </g>
  </svg>
);

const PageLayout = (props: PropsWithChildren<CustomProps>) => {
  const router = useRouter();
  return (
    <main className="flex min-h-screen justify-center">
      <div className="relative w-full border-x border-slate-400 md:max-w-2xl">
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
      </div>
    </main>
  );
};

export default PageLayout;
