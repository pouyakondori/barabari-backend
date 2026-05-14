import { Resolver, Mutation, Arg, Authorized, ID } from "type-graphql";
import { TopicType } from "../types/TopicType";
import { CreateTopicInput, UpdateTopicInput } from "../inputs/TopicInput";
import { Topic } from "../../models/Topic";

@Resolver()
export class AdminTopicResolver {
  @Authorized("admin")
  @Mutation(() => TopicType)
  async adminCreateTopic(
    @Arg("input") input: CreateTopicInput
  ): Promise<TopicType> {
    const doc = await Topic.create({
      name: input.name,
      slug: input.slug.toLowerCase(),
      description: input.description,
      category: input.category,
      order: input.order,
    });
    return mapTopic(doc.toObject());
  }

  @Authorized("admin")
  @Mutation(() => TopicType)
  async adminUpdateTopic(
    @Arg("id", () => ID) id: string,
    @Arg("input") input: UpdateTopicInput
  ): Promise<TopicType> {
    const update: any = {};
    if (input.name) update.name = input.name;
    if (input.slug) update.slug = input.slug.toLowerCase();
    if (input.description) update.description = input.description;
    if (input.category) update.category = input.category;
    if (input.order !== undefined) update.order = input.order;

    const doc = await Topic.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!doc) throw new Error("Topic not found");
    return mapTopic(doc);
  }

  @Authorized("admin")
  @Mutation(() => Boolean)
  async adminDeleteTopic(
    @Arg("id", () => ID) id: string
  ): Promise<boolean> {
    await Topic.findByIdAndDelete(id);
    return true;
  }
}

function mapTopic(doc: any): TopicType {
  return {
    id: doc._id.toString(),
    slug: doc.slug,
    name: doc.name,
    category: doc.category,
    description: doc.description,
    order: doc.order,
  };
}
