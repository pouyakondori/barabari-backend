import { Resolver, Query } from "type-graphql";
import { PlatformStatsType } from "../types/StatsType";
import { Country } from "../../models/Country";
import { Clause } from "../../models/Clause";
import { Vote } from "../../models/Vote";
import { Comment } from "../../models/Comment";
import { CountryType } from "../types/CountryType";

@Resolver()
export class StatsResolver {
  @Query(() => PlatformStatsType)
  async platformStats(): Promise<PlatformStatsType> {
    const [totalCountries, totalClauses, totalVotes, totalComments] =
      await Promise.all([
        Country.countDocuments(),
        Clause.countDocuments(),
        Vote.countDocuments(),
        Comment.countDocuments({ status: "approved", isDeleted: false }),
      ]);

    return { totalCountries, totalClauses, totalVotes, totalComments };
  }

  @Query(() => [CountryType])
  async featuredCountries(): Promise<CountryType[]> {
    const docs = await Country.find().sort({ "name.en": 1 }).limit(10).lean();
    return docs.map((doc) => ({
      id: doc._id.toString(),
      slug: doc.slug,
      name: doc.name,
      flag: doc.flag,
      population: doc.population,
      coordinates: doc.coordinates,
      abstract: doc.abstract,
      authors: doc.authors || [],
      amendments: doc.amendments || [],
      podcastUrl: doc.podcastUrl,
      videoUrl: doc.videoUrl,
      countryCode: doc.countryCode,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
  }
}
