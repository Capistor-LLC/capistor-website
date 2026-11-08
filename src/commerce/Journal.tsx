import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Helmet } from "react-helmet-async";
import { supabase, hasSupabase, DbBlogPost } from "../lib/supabase";
import Seo from "../components/ui/Seo";
import { PageIntro, ButtonLink, Arrow } from "./Shell";
import { articles } from "./articles";
import { useBuildContent } from "./BuildContent";
export function Journal() {
  const [posts, setPosts] = useState<DbBlogPost[]>(
    useBuildContent().posts || [],
  );
  useEffect(() => {
    if (hasSupabase)
      supabase
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(24)
        .then(({ data }) => {
          if (data) setPosts(data);
        });
  }, []);
  return (
    <div className="page-wrap">
      <Seo
        title="Hardware planning & PCB design journal"
        url="/journal"
        description="Practical guides to hardware briefs, PCB reviews and buying engineering files. Clear starting points for your next electronics project."
      />
      <PageIntro
        label="FROM THE WORKBENCH"
        title="Understand more. Build with purpose."
      >
        <p>
          Practical notes on the decisions that happen before, during and after
          a hardware project.
        </p>
      </PageIntro>
      <div className="journal-grid">
        {[
          ...posts.map((p) => ({
            slug: p.slug,
            title: p.title,
            category: p.tags?.[0] || "Engineering",
            minutes: p.reading_minutes || 3,
            excerpt: p.excerpt,
            href: `/blog/${p.slug}`,
          })),
          ...articles.map((a) => ({ ...a, href: `/journal/${a.slug}` })),
        ].map((a) => (
          <Link to={a.href} className="journal-card" key={a.href}>
            <p className="eyebrow">
              {a.category} · {a.minutes} MIN READ
            </p>
            <h2>{a.title}</h2>
            <p>{a.excerpt}</p>
            <span>
              Read the article <Arrow />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
export function Article() {
  const { slug } = useParams();
  const a = articles.find((a) => a.slug === slug);
  if (!a)
    return (
      <div className="page-wrap">
        <PageIntro label="JOURNAL" title="Article not found" />
        <ButtonLink to="/journal">Return to the journal</ButtonLink>
      </div>
    );
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.excerpt,
    author: { "@type": "Organization", name: "Capistor editorial" },
    publisher: { "@type": "Organization", name: "Capistor Technologies" },
    mainEntityOfPage: `https://capistor.com/journal/${a.slug}`,
  };
  return (
    <div className="page-wrap narrow">
      <Seo
        title={a.title}
        description={a.excerpt}
        type="article"
        url={`/journal/${a.slug}`}
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(schema).replace(/</g, "\\u003c")}
        </script>
      </Helmet>
      <Link className="back-link" to="/journal">
        ← Journal
      </Link>
      <PageIntro
        label={`${a.category} · ${a.minutes} MIN READ`}
        title={a.title}
      >
        <p>{a.excerpt}</p>
        <p className="micro">
          Capistor editorial · Practical guidance, with the scope limits stated
          below.
        </p>
      </PageIntro>
      <article className="prose">
        <ReactMarkdown>{a.body}</ReactMarkdown>
      </article>
      <section className="section">
        <h2>Make it specific to your project.</h2>
        <p style={{ margin: "20px 0" }}>
          A focused conversation can help turn these questions into a useful
          next step.
        </p>
        <ButtonLink to="/services/hardware-idea-review">
          Explore a hardware idea review
        </ButtonLink>
      </section>
    </div>
  );
}
