import { Resolver, Mutation, Arg, Authorized, ID } from "type-graphql";
import { CountryType } from "../types/CountryType";
import { CountryInput } from "../inputs/CountryInput";
import { Country } from "../../models/Country";

@Resolver()
export class AdminCountryResolver {
  @Authorized("admin")
  @Mutation(() => CountryType)
  async adminCreateCountry(
    @Arg("input") input: CountryInput
  ): Promise<CountryType> {
    const doc = await Country.create({
      ...input,
      slug: input.slug.toLowerCase(),
    });
    return mapCountry(doc.toObject());
  }

  @Authorized("admin")
  @Mutation(() => CountryType)
  async adminUpdateCountry(
    @Arg("id", () => ID) id: string,
    @Arg("input") input: CountryInput
  ): Promise<CountryType> {
    const doc = await Country.findByIdAndUpdate(
      id,
      { ...input, slug: input.slug.toLowerCase() },
      { new: true }
    ).lean();
    if (!doc) throw new Error("Country not found");
    return mapCountry(doc);
  }

  @Authorized("admin")
  @Mutation(() => Boolean)
  async adminDeleteCountry(
    @Arg("id", () => ID) id: string
  ): Promise<boolean> {
    await Country.findByIdAndDelete(id);
    return true;
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
    totalArea: doc.totalArea,
    landlocked: doc.landlocked,
    borders: doc.borders || [],
    naturalResources: doc.naturalResources || [],
    authors: doc.authors || [],
    amendments: doc.amendments || [],
    podcastUrl: doc.podcastUrl,
    videoUrl: doc.videoUrl,
    countryCode: doc.countryCode,
    systemOfGovernment: doc.systemOfGovernment,
    hdi: doc.hdi,
    independenceDate: doc.independenceDate,
    officialLanguages: doc.officialLanguages || [],
    gdp: doc.gdp,
    economicType: doc.economicType,
    religiousComposition: doc.religiousComposition || [],
    urbanizationRate: doc.urbanizationRate,
    corruptionIndex: doc.corruptionIndex,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
