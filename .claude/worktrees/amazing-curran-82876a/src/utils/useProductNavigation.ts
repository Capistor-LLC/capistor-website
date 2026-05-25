import { useState, useCallback } from "react";
import { Product } from "./productLoader";

export const useProductNavigation = (products: Product[]) => {
  const [currentProduct, setCurrentProduct] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextProduct = useCallback(() => {
    setCurrentProduct((prev) => (prev + 1) % products.length);
    setCurrentImageIndex(0);
  }, [products.length]);

  return {
    currentProduct,
    currentImageIndex,
    setCurrentProduct,
    setCurrentImageIndex,
    nextProduct,
  };
};