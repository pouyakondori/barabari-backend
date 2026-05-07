import { ObjectType, Field } from "type-graphql";

@ObjectType()
export class PlatformStatsType {
  @Field()
  totalCountries: number;

  @Field()
  totalClauses: number;

  @Field()
  totalVotes: number;

  @Field()
  totalComments: number;
}

@ObjectType()
export class HeatmapEntryType {
  @Field()
  countryCode: string;

  @Field()
  value: number;
}
