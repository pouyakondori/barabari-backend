import { Resolver, Query, Arg } from "type-graphql";
import { ConstitutionType, ChapterType, ArticleType, ClauseType } from "../types/ConstitutionType";
import { Constitution } from "../../models/Constitution";
import { Chapter } from "../../models/Chapter";
import { Article } from "../../models/Article";
import { Clause } from "../../models/Clause";
import { Country } from "../../models/Country";

@Resolver()
export class ConstitutionResolver {
  @Query(() => ConstitutionType, { nullable: true })
  async constitution(@Arg("countrySlug") countrySlug: string): Promise<ConstitutionType | null> {
    const country = await Country.findOne({ slug: countrySlug.toLowerCase() }).lean();
    if (!country) return null;

    const constitution = await Constitution.findOne({ countryId: country._id }).lean();
    if (!constitution) return null;

    const chapters = await Chapter.find({ constitutionId: constitution._id })
      .sort({ order: 1 })
      .lean();

    const chapterIds = chapters.map((c) => c._id);
    const articles = await Article.find({ chapterId: { $in: chapterIds } })
      .sort({ order: 1 })
      .lean();

    const articleIds = articles.map((a) => a._id);
    const clauses = await Clause.find({ articleId: { $in: articleIds } })
      .sort({ order: 1 })
      .lean();

    // Group articles by chapterId
    const articlesByChapter = new Map<string, any[]>();
    for (const article of articles) {
      const key = article.chapterId.toString();
      if (!articlesByChapter.has(key)) articlesByChapter.set(key, []);
      articlesByChapter.get(key)!.push(article);
    }

    // Group clauses by articleId
    const clausesByArticle = new Map<string, any[]>();
    for (const clause of clauses) {
      const key = clause.articleId.toString();
      if (!clausesByArticle.has(key)) clausesByArticle.set(key, []);
      clausesByArticle.get(key)!.push(clause);
    }

    const mappedChapters: ChapterType[] = chapters.map((ch) => ({
      id: ch._id.toString(),
      number: ch.number,
      title: ch.title,
      order: ch.order,
      articles: (articlesByChapter.get(ch._id.toString()) || []).map((art): ArticleType => ({
        id: art._id.toString(),
        number: art.number,
        title: art.title,
        order: art.order,
        clauses: (clausesByArticle.get(art._id.toString()) || []).map((cl): ClauseType => ({
          id: cl._id.toString(),
          number: cl.number,
          text: cl.text,
          topicSlugs: cl.topicSlugs,
          agreeCount: cl.agreeCount,
          disagreeCount: cl.disagreeCount,
          order: cl.order,
          countryId: cl.countryId.toString(),
          articleId: cl.articleId.toString(),
        })),
      })),
    }));

    return {
      id: constitution._id.toString(),
      countryId: constitution.countryId.toString(),
      fullTextUrl: constitution.fullTextUrl,
      chapters: mappedChapters,
      createdAt: constitution.createdAt,
    };
  }

  @Query(() => ClauseType, { nullable: true })
  async clause(@Arg("id") id: string): Promise<ClauseType | null> {
    const doc = await Clause.findById(id).lean();
    if (!doc) return null;
    return {
      id: doc._id.toString(),
      number: doc.number,
      text: doc.text,
      topicSlugs: doc.topicSlugs,
      agreeCount: doc.agreeCount,
      disagreeCount: doc.disagreeCount,
      order: doc.order,
      countryId: doc.countryId.toString(),
      articleId: doc.articleId.toString(),
    };
  }
}
