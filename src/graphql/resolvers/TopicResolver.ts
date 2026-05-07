import { Resolver, Query, Arg } from "type-graphql";
import { TopicType } from "../types/TopicType";
import { Topic } from "../../models/Topic";

@Resolver()
export class TopicResolver {
  @Query(() => [TopicType])
  async topics(): Promise<TopicType[]> {
    const docs = await Topic.find().sort({ category: 1, order: 1 }).lean();
    return docs.map((d) => ({
      id: d._id.toString(),
      slug: d.slug,
      name: d.name,
      category: d.category,
      description: d.description,
      order: d.order,
    }));
  }

  @Query(() => TopicType, { nullable: true })
  async topic(@Arg("slug") slug: string): Promise<TopicType | null> {
    const doc = await Topic.findOne({ slug: slug.toLowerCase() }).lean();
    if (!doc) return null;
    return {
      id: doc._id.toString(),
      slug: doc.slug,
      name: doc.name,
      category: doc.category,
      description: doc.description,
      order: doc.order,
    };
  }
}
