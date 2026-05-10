import { Resolver, Query, Mutation, Arg, Authorized, ID, Int } from "type-graphql";
import { Podcast } from "../../models/Podcast";
import { Country } from "../../models/Country";
import { Topic } from "../../models/Topic";
import { PodcastType, PaginatedPodcastResult, PodcastCountryType, PodcastTopicType } from "../types/PodcastType";
import { CreatePodcastInput, UpdatePodcastInput } from "../inputs/PodcastInput";
import { deleteFile } from "../../services/storage";

async function mapPodcast(doc: any): Promise<PodcastType> {
  const podcast = new PodcastType();
  podcast.id = doc._id.toString();
  podcast.title = { fa: doc.title.fa, en: doc.title.en };
  podcast.description = { fa: doc.description.fa, en: doc.description.en };
  podcast.audioUrl = doc.audioUrl;
  podcast.coverImage = doc.coverImageUrl || undefined;
  podcast.duration = doc.duration;
  podcast.publishedAt = doc.publishedAt?.toISOString?.() || doc.publishedAt;

  if (doc.countryId) {
    const country = await Country.findById(doc.countryId);
    if (country) {
      const c = new PodcastCountryType();
      c.id = country._id.toString();
      c.name = { fa: country.name.fa, en: country.name.en };
      podcast.country = c;
    }
  }

  if (doc.topicSlug) {
    const topic = await Topic.findOne({ slug: doc.topicSlug });
    if (topic) {
      const t = new PodcastTopicType();
      t.id = topic._id.toString();
      t.name = { fa: topic.name.fa, en: topic.name.en };
      podcast.topic = t;
    }
  }

  return podcast;
}

@Resolver()
export class AdminPodcastResolver {
  // ── Admin queries ──

  @Authorized("admin")
  @Query(() => PaginatedPodcastResult)
  async adminPodcasts(
    @Arg("search", { nullable: true }) search?: string,
    @Arg("countryId", () => ID, { nullable: true }) countryId?: string,
    @Arg("topicSlug", { nullable: true }) topicSlug?: string,
    @Arg("limit", () => Int, { nullable: true, defaultValue: 20 }) limit?: number,
    @Arg("offset", () => Int, { nullable: true, defaultValue: 0 }) offset?: number
  ): Promise<PaginatedPodcastResult> {
    const filter: any = {};

    if (search) {
      filter.$or = [
        { "title.fa": { $regex: search, $options: "i" } },
        { "title.en": { $regex: search, $options: "i" } },
      ];
    }
    if (countryId) filter.countryId = countryId;
    if (topicSlug) filter.topicSlug = topicSlug;

    const [docs, total] = await Promise.all([
      Podcast.find(filter)
        .sort({ publishedAt: -1 })
        .skip(offset ?? 0)
        .limit(limit ?? 20),
      Podcast.countDocuments(filter),
    ]);

    const items = await Promise.all(docs.map(mapPodcast));

    const result = new PaginatedPodcastResult();
    result.items = items;
    result.total = total;
    result.limit = limit ?? 20;
    result.offset = offset ?? 0;
    return result;
  }

  @Authorized("admin")
  @Query(() => PodcastType)
  async adminPodcast(@Arg("id", () => ID) id: string): Promise<PodcastType> {
    const doc = await Podcast.findById(id);
    if (!doc) throw new Error("Podcast not found");
    return mapPodcast(doc);
  }

  // ── Admin mutations ──

  @Authorized("admin")
  @Mutation(() => PodcastType)
  async adminCreatePodcast(
    @Arg("input") input: CreatePodcastInput
  ): Promise<PodcastType> {
    // Resolve topicId to topicSlug
    let topicSlug: string | undefined;
    if (input.topicId) {
      const topic = await Topic.findById(input.topicId);
      if (topic) topicSlug = topic.slug;
    }

    const doc = await Podcast.create({
      title: input.title,
      description: input.description,
      audioUrl: input.audioUrl,
      coverImageUrl: input.coverImage,
      countryId: input.countryId,
      topicSlug,
      duration: input.duration,
      publishedAt: input.publishedAt ? new Date(input.publishedAt) : new Date(),
    });
    return mapPodcast(doc);
  }

  @Authorized("admin")
  @Mutation(() => PodcastType)
  async adminUpdatePodcast(
    @Arg("id", () => ID) id: string,
    @Arg("input") input: UpdatePodcastInput
  ): Promise<PodcastType> {
    const update: any = {};
    if (input.title) update.title = input.title;
    if (input.description) update.description = input.description;
    if (input.audioUrl !== undefined) update.audioUrl = input.audioUrl;
    if (input.coverImage !== undefined) update.coverImageUrl = input.coverImage;
    if (input.countryId !== undefined) update.countryId = input.countryId || null;
    if (input.topicId !== undefined) {
      if (input.topicId) {
        const topic = await Topic.findById(input.topicId);
        update.topicSlug = topic?.slug || null;
      } else {
        update.topicSlug = null;
      }
    }
    if (input.duration !== undefined) update.duration = input.duration;
    if (input.publishedAt) update.publishedAt = new Date(input.publishedAt);

    const doc = await Podcast.findByIdAndUpdate(id, update, { new: true });
    if (!doc) throw new Error("Podcast not found");
    return mapPodcast(doc);
  }

  @Authorized("admin")
  @Mutation(() => Boolean)
  async adminDeletePodcast(@Arg("id", () => ID) id: string): Promise<boolean> {
    const doc = await Podcast.findById(id);
    if (!doc) throw new Error("Podcast not found");

    // Try to delete file from MinIO
    if (doc.audioUrl) {
      const objectName = doc.audioUrl.split("/").pop();
      if (objectName) {
        try {
          await deleteFile(objectName);
        } catch {
          // File may not exist in MinIO
        }
      }
    }

    await Podcast.findByIdAndDelete(id);
    return true;
  }

  // ── Public queries ──

  @Query(() => [PodcastType])
  async podcasts(
    @Arg("limit", () => Int, { nullable: true, defaultValue: 20 }) limit?: number
  ): Promise<PodcastType[]> {
    const docs = await Podcast.find()
      .sort({ publishedAt: -1 })
      .limit(limit ?? 20);
    return Promise.all(docs.map(mapPodcast));
  }

  @Query(() => [PodcastType])
  async podcastsByCountry(
    @Arg("countrySlug") countrySlug: string
  ): Promise<PodcastType[]> {
    const country = await Country.findOne({ slug: countrySlug });
    if (!country) return [];
    const docs = await Podcast.find({ countryId: country._id })
      .sort({ publishedAt: -1 });
    return Promise.all(docs.map(mapPodcast));
  }
}
