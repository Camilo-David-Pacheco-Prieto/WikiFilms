import { prisma } from "../src/lib/prisma";
import { getMovieDetail, getSeriesDetail } from "../src/lib/tmdb";
import { getGameById } from "../src/lib/igdb";
import { IGDB_IMAGE_BASE, IGDB_COVER_SIZE } from "../src/types/igdb";

async function main() {
  const reviews = await prisma.review.findMany({
    where: { title: "" },
  });

  if (reviews.length === 0) {
    console.log("No reviews to backfill.");
    return;
  }

  console.log(`Found ${reviews.length} reviews to backfill...`);

  for (const review of reviews) {
    try {
      if (review.contentType === "movie") {
        const detail = await getMovieDetail(review.contentId);
        await prisma.review.update({
          where: { id: review.id },
          data: { title: detail.title, posterUrl: detail.posterUrl },
        });
        console.log(`  [movie/${review.contentId}] -> ${detail.title}`);
      } else if (review.contentType === "tv") {
        const detail = await getSeriesDetail(review.contentId);
        await prisma.review.update({
          where: { id: review.id },
          data: { title: detail.title, posterUrl: detail.posterUrl },
        });
        console.log(`  [tv/${review.contentId}] -> ${detail.title}`);
      } else if (review.contentType === "game") {
        const game = await getGameById(review.contentId);
        if (game) {
          const posterUrl = game.cover?.image_id
            ? `${IGDB_IMAGE_BASE}/t_${IGDB_COVER_SIZE}/${game.cover.image_id}.jpg`
            : null;
          await prisma.review.update({
            where: { id: review.id },
            data: { title: game.name, posterUrl },
          });
          console.log(`  [game/${review.contentId}] -> ${game.name}`);
        } else {
          console.log(`  [game/${review.contentId}] -> not found`);
        }
      }
    } catch (e) {
      console.error(`  Error on review ${review.id} (${review.contentType}/${review.contentId}):`, e);
    }
  }

  console.log("Done.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());