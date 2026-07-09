export function SkeletonHero() {
  return (
    <section className="relative overflow-hidden rounded-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-accent-brand/20 to-transparent" />
      <div className="relative z-10 animate-pulse px-6 py-16 md:px-8 md:py-24">
        <div className="h-14 w-72 rounded-lg bg-zinc-800 md:h-20 md:w-96" />
        <div className="mt-4 h-6 w-full max-w-xl rounded bg-zinc-800" />
        <div className="mt-2 h-6 w-3/4 max-w-md rounded bg-zinc-800" />
      </div>
    </section>
  );
}
