import { Resolver, Query, Arg } from "type-graphql";
import { TimelineEventType } from "../types/TimelineEventType";
import { TimelineEvent } from "../../models/TimelineEvent";
import { Country } from "../../models/Country";

@Resolver()
export class TimelineResolver {
  @Query(() => [TimelineEventType])
  async countryTimeline(
    @Arg("countrySlug") countrySlug: string
  ): Promise<TimelineEventType[]> {
    const country = await Country.findOne({ slug: countrySlug.toLowerCase() }).lean();
    if (!country) return [];

    const docs = await TimelineEvent.find({ countryId: country._id })
      .sort({ order: 1 })
      .lean();

    return docs.map((d) => ({
      id: d._id.toString(),
      countryId: d.countryId.toString(),
      date: d.date,
      title: d.title,
      description: d.description,
      order: d.order,
    }));
  }
}
