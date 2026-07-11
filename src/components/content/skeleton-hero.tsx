export function SkeletonHero() {
  return (
    <section className="h-[360px] animate-pulse overflow-hidden rounded-xl bg-surface md:h-[500px] lg:h-[540px]">
      <div className="flex h-full items-center p-7 md:p-14 lg:p-16">
        <div className="max-w-[700px] space-y-4">
          <div className="h-6 w-24 rounded-[10px] bg-zinc-800" />
          <div className="h-9 w-72 rounded bg-zinc-800 md:h-12 md:w-96 lg:h-16 lg:w-[500px]" />
          <div className="h-4 w-full max-w-xl rounded bg-zinc-800 md:h-5" />
          <div className="h-4 w-3/4 max-w-md rounded bg-zinc-800 md:h-5" />
          <div className="h-12 w-32 rounded-[14px] bg-zinc-800 md:h-14 md:w-36 lg:h-16 lg:w-40 lg:rounded-[18px]" />
        </div>
      </div>
    </section>
  );
}
