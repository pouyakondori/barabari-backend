import { Resolver, Query, Arg, Int } from "type-graphql";
import { CountryType } from "../types/CountryType";
import { Country } from "../../models/Country";

@Resolver()
export class CountryResolver {
  @Query(() => [CountryType])
  async countries(
    @Arg("limit", () => Int, { defaultValue: 20 }) limit: number,
    @Arg("offset", () => Int, { defaultValue: 0 }) offset: number
  ): Promise<CountryType[]> {
    const cappedLimit = Math.min(limit, 100);
    const docs = await Country.find()
      .sort({ "name.en": 1 })
      .skip(offset)
      .limit(cappedLimit)
      .lean();

    return docs.map(mapCountry);
  }

  @Query(() => CountryType, { nullable: true })
  async country(@Arg("slug") slug: string): Promise<CountryType | null> {
    const doc = await Country.findOne({ slug: slug.toLowerCase() }).lean();
    if (!doc) return null;
    return mapCountry(doc);
  }

  @Query(() => [CountryType])
  async searchCountries(@Arg("query") query: string): Promise<CountryType[]> {
    const regex = new RegExp(query, "i");
    const docs = await Country.find({
      $or: [{ "name.en": regex }, { "name.fa": regex }],
    })
      .limit(20)
      .lean();

    return docs.map(mapCountry);
  }
}

function mapCountry(doc: any): CountryType {
  return {
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
  };
}
