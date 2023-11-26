import Link from "next/link";

export const NotFound = (props: { name: string }) => (
  <main className="flex h-screen flex-col items-center justify-center">
    <h1 className="text-xl font-bold">{`404 | ${props.name} Not Found`}</h1>
    <Link href="/" className="underline hover:text-slate-400">
      Go Back to Home
    </Link>
  </main>
);
