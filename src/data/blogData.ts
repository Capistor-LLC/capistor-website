export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    date: string;
    excerpt: string;
    image: string;
    content: string;
    category: string;
    readTime: string;
    author: string;
}

export const blogPosts: BlogPost[] = [];

export const getBlogPostBySlug = (slug: string): BlogPost | undefined => {
    return blogPosts.find((post) => post.slug === slug);
};

export const getAllBlogPosts = (): BlogPost[] => {
    return blogPosts;
};
