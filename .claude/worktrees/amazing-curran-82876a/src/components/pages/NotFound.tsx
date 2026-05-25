import { Link } from "react-router-dom";
import Seo from "../ui/Seo";

export default function NotFound() {
  return (
    <>
      <Seo title="Not found" description="The page you're looking for doesn't exist." />
      <div className="min-h-screen flex flex-col items-center justify-center bg-kindofwhite px-6 text-center">
        <p className="text-sexyblue/35 font-futura text-xs uppercase tracking-[0.25em] mb-4">
          404
        </p>
        <h1 className="text-5xl sm:text-7xl font-futura font-bold text-black mb-4 leading-none">
          Lost in space
        </h1>
        <p className="text-sexyblue/60 font-fransisco max-w-md mb-8">
          That page doesn't exist — or it might have been moved. Try one of these instead.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            to="/"
            className="px-5 py-2.5 rounded-lg bg-sexyblue text-kindofwhite font-futura text-sm hover:bg-capistor-600 transition-colors"
          >
            Home
          </Link>
          <Link
            to="/products"
            className="px-5 py-2.5 rounded-lg border border-capistor-300/40 text-sexyblue hover:border-sexyblue/60 font-futura text-sm transition-colors"
          >
            Projects
          </Link>
          <Link
            to="/blog"
            className="px-5 py-2.5 rounded-lg border border-capistor-300/40 text-sexyblue hover:border-sexyblue/60 font-futura text-sm transition-colors"
          >
            Blog
          </Link>
        </div>
      </div>
    </>
  );
}
