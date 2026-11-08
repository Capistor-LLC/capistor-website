import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import type { Business, ShopItem } from "./types";
import { starterServices, defaultBusiness } from "./catalog";
import { api } from "./api";
import { useBuildContent } from "./BuildContent";
type Catalog = {
  items: ShopItem[];
  business: Business;
  available: boolean;
  loading: boolean;
  sandbox: boolean;
};
const initial = {
  items: starterServices,
  business: defaultBusiness,
  available: false,
  loading: true,
  sandbox: import.meta.env.VITE_PAYMENT_MODE !== "live",
};
const CatalogContext = createContext<Catalog>(initial);
export function CatalogProvider({ children }: { children: ReactNode }) {
  const { items } = useBuildContent();
  const [data, setData] = useState<Catalog>({
    ...initial,
    items: items?.length ? items : initial.items,
  });
  useEffect(() => {
    let active = true;
    const refresh = () => {
      api<Omit<Catalog, "loading">>("catalog")
        .then((d) => {
          if (active) setData({ ...d, loading: false });
        })
        .catch(() => {
          if (active) setData({ ...initial, loading: false });
        });
    };
    refresh();
    window.addEventListener("catalog:refresh", refresh);
    return () => {
      active = false;
      window.removeEventListener("catalog:refresh", refresh);
    };
  }, []);
  return (
    <CatalogContext.Provider value={data}>{children}</CatalogContext.Provider>
  );
}
export const useCatalog = () => useContext(CatalogContext);
