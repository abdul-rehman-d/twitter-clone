import { type PropsWithChildren } from "react"

const PageLayout = (props: PropsWithChildren) => {
  return (
    <main className="flex justify-center min-h-screen">
      <div className="w-full md:max-w-2xl border-x border-slate-400 relative">
        {/* <div className="border-b border-slate-400 p-4 sticky top-0 z-40 backdrop-blur-3xl supports-backdrop-blur:bg-white/95s">
          <h1 className="font-semibold text-xl">Home</h1>
        </div> */}
        {props.children}
      </div>
    </main>
  )
}

export default PageLayout