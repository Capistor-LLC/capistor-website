import { createContext, useContext } from "react";
import type { DbBlogPost } from "../lib/supabase";
import type { ShopItem } from "./types";
export type BuildContent = { posts?: DbBlogPost[]; items?: ShopItem[] };
export const BuildContext = createContext<BuildContent>({});
export const useBuildContent = () => useContext(BuildContext);
