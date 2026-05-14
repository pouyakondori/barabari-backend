import { Resolver, Query, Arg, Int } from "type-graphql";
import { TopicType, PaginatedTopicResult } from "../types/TopicType";
import { Topic } from "../../models/Topic";
import { Clause } from "../../models/Clause";

function mapTopic(d: any): TopicType {
  return {
    id: d._id.toString(),
    slug: d.slug,
    name: d.name,
    category: d.category,
    description: d.description,
    order: d.order,
  };
}

@Resolver()
export class TopicResolver {
  @Query(() => PaginatedTopicResult)
  async topics(
    @Arg("limit", () => Int, { nullable: true, defaultValue: 20 }) limit?: number,
    @Arg("offset", () => Int, { nullable: true, defaultValue: 0 }) offset?: number,
    @Arg("category", { nullable: true }) category?: string,
    @Arg("search", { nullable: true }) search?: string
  ): Promise<PaginatedTopicResult> {
    const filter: any = {};

    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { "name.fa": { $regex: search, $options: "i" } },
        { "name.en": { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }

    const [docs, total] = await Promise.all([
      Topic.find(filter)
        .sort({ category: 1, order: 1 })
        .skip(offset ?? 0)
        .limit(limit ?? 20)
        .lean(),
      Topic.countDocuments(filter),
    ]);

    const items = await Promise.all(
      docs.map(async (d) => {
        const topic = mapTopic(d);
        topic.clauseCount = await Clause.countDocuments({ topicSlugs: d.slug });
        return topic;
      })
    );

    const result = new PaginatedTopicResult();
    result.items = items;
    result.total = total;
    result.limit = limit ?? 20;
    result.offset = offset ?? 0;
    return result;
  }

  @Query(() => TopicType, { nullable: true })
  async topic(@Arg("slug") slug: string): Promise<TopicType | null> {
    const doc = await Topic.findOne({ slug: slug.toLowerCase() }).lean();
    if (!doc) return null;
    return mapTopic(doc);
  }
}
