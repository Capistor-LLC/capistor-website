import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider, type HelmetServerState } from "react-helmet-async";
import { CatalogProvider } from "./commerce/context";
import { BuildContext, type BuildContent } from "./commerce/BuildContent";
import Shell, { PageIntro, ButtonLink } from "./commerce/Shell";
import {
  Home,
  Services,
  Shop,
  ItemPage,
  About,
  Legal,
  Work,
} from "./commerce/Public";
import { Journal, Article } from "./commerce/Journal";
import Login from "./commerce/Login";
import { Portal, OrderPage, PrivatePage } from "./commerce/Portal";
const CVPage = lazy(() => import("./components/pages/cv/page"));
const BlogPost = lazy(() => import("./components/pages/BlogPost"));
const CommerceAdmin = lazy(() => import("./commerce/Admin"));
const AdminDashboard = lazy(() => import("./components/admin/AdminDashboard"));
const AdminProductsList = lazy(
  () => import("./components/admin/AdminProductsList"),
);
const AdminProductEditor = lazy(
  () => import("./components/admin/AdminProductEditor"),
);
const AdminBlogList = lazy(() => import("./components/admin/AdminBlogList"));
const AdminBlogEditor = lazy(
  () => import("./components/admin/AdminBlogEditor"),
);
const AdminSeries = lazy(() => import("./components/admin/AdminSeries"));
const AdminSubscribers = lazy(
  () => import("./components/admin/AdminSubscribers"),
);
const wrap = (node: React.ReactNode) => <Shell>{node}</Shell>;
const admin = (node: React.ReactNode) => (
  <PrivatePage admin>{node}</PrivatePage>
);
export default function App({
  helmetContext,
  content = {},
}: {
  helmetContext?: { helmet?: HelmetServerState };
  content?: BuildContent;
} = {}) {
  return (
    <HelmetProvider context={helmetContext}>
      <BuildContext.Provider value={content}>
        <CatalogProvider>
          <Suspense
            fallback={wrap(
              <div className="page-wrap">
                <PageIntro label="CAPISTOR" title="Loading…" />
              </div>,
            )}
          >
            <Routes>
              <Route path="/" element={wrap(<Home />)} />
              <Route path="/services" element={wrap(<Services />)} />
              <Route path="/services/:slug" element={wrap(<ItemPage />)} />
              <Route path="/shop" element={wrap(<Shop />)} />
              <Route path="/shop/:slug" element={wrap(<ItemPage />)} />
              <Route path="/work" element={wrap(<Work />)} />
              <Route path="/about" element={wrap(<About />)} />
              <Route path="/legal/:kind" element={wrap(<Legal />)} />
              <Route path="/journal" element={wrap(<Journal />)} />
              <Route path="/journal/:slug" element={wrap(<Article />)} />
              <Route
                path="/blog"
                element={<Navigate to="/journal" replace />}
              />
              <Route path="/blog/:slug" element={wrap(<BlogPost />)} />
              <Route path="/cv" element={wrap(<CVPage />)} />
              <Route
                path="/products"
                element={<Navigate to="/work" replace />}
              />
              <Route
                path="/capabilities"
                element={<Navigate to="/services" replace />}
              />
              <Route path="/login" element={wrap(<Login />)} />
              <Route
                path="/staff"
                element={
                  <Navigate to="/login?next=%2Fadmin%2Fcommerce" replace />
                }
              />
              <Route
                path="/admin/login"
                element={
                  <Navigate to="/login?next=%2Fadmin%2Fcommerce" replace />
                }
              />
              <Route
                path="/portal"
                element={wrap(
                  <PrivatePage>
                    <Portal />
                  </PrivatePage>,
                )}
              />
              <Route
                path="/portal/orders/:id"
                element={wrap(
                  <PrivatePage>
                    <OrderPage />
                  </PrivatePage>,
                )}
              />
              <Route
                path="/admin/commerce"
                element={wrap(admin(<CommerceAdmin />))}
              />
              <Route path="/admin" element={admin(<AdminDashboard />)} />
              <Route
                path="/admin/products"
                element={admin(<AdminProductsList />)}
              />
              <Route
                path="/admin/products/new"
                element={admin(<AdminProductEditor mode="new" />)}
              />
              <Route
                path="/admin/products/:id/edit"
                element={admin(<AdminProductEditor mode="edit" />)}
              />
              <Route path="/admin/blog" element={admin(<AdminBlogList />)} />
              <Route
                path="/admin/blog/new"
                element={admin(<AdminBlogEditor mode="new" />)}
              />
              <Route
                path="/admin/blog/:id/edit"
                element={admin(<AdminBlogEditor mode="edit" />)}
              />
              <Route path="/admin/series" element={admin(<AdminSeries />)} />
              <Route
                path="/admin/subscribers"
                element={admin(<AdminSubscribers />)}
              />
              <Route
                path="*"
                element={wrap(
                  <div className="page-wrap">
                    <PageIntro label="404" title="That page isn’t here." />
                    <ButtonLink to="/">Return home</ButtonLink>
                  </div>,
                )}
              />
            </Routes>
          </Suspense>
        </CatalogProvider>
      </BuildContext.Provider>
    </HelmetProvider>
  );
}
