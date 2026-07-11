export function SkeletonHero() {
  return (
    <section className="h-[260px] animate-pulse overflow-hidden rounded-none bg-surface md:h-[500px] md:rounded-2xl lg:h-[460px] lg:rounded-3xl">
      <div className="flex h-full items-center p-5 md:p-14 lg:p-16">
        <div className="w-full space-y-3 md:max-w-[600px] md:space-y-4 lg:max-w-[700px]">
          <div className="h-4 w-16 rounded-[8px] bg-zinc-800 md:h-6 md:w-24 md:rounded-[10px]" />
          <div className="h-5 w-48 rounded bg-zinc-800 md:h-12 md:w-96 lg:h-16 lg:w-[500px]" />
          <div className="h-3 w-28 rounded bg-zinc-800 md:h-4 md:w-40" />
          <div className="h-3 w-full max-w-xl rounded bg-zinc-800 md:h-5" />
          <div className="h-3 w-3/4 max-w-md rounded bg-zinc-800 md:h-5" />
          <div className="h-8 w-20 rounded-[10px] bg-zinc-800 md:h-10 md:w-28 md:rounded-[12px]" />
        </div>
      </div>
    </section>
  );
}
