export function SkeletonHero() {
  return (
    <section className="h-[360px] animate-pulse overflow-hidden rounded-none bg-surface md:h-[500px] md:rounded-2xl lg:h-[460px] lg:rounded-3xl">
      <div className="flex h-full items-center p-7 md:p-14 lg:p-16">
        <div className="w-full space-y-4 md:max-w-[600px] lg:max-w-[700px]">
          <div className="h-6 w-24 rounded-[10px] bg-zinc-800" />
          <div className="h-9 w-72 rounded bg-zinc-800 md:h-12 md:w-96 lg:h-16 lg:w-[500px]" />
          <div className="h-4 w-40 rounded bg-zinc-800" />
          <div className="h-4 w-full max-w-xl rounded bg-zinc-800 md:h-5" />
          <div className="h-4 w-3/4 max-w-md rounded bg-zinc-800 md:h-5" />
          <div className="h-10 w-28 rounded-[12px] bg-zinc-800" />
        </div>
      </div>
    </section>
  );
}
