import React, { createContext, useContext, useState, useEffect } from "react";
import { API_BASE_URL } from "../config";

export interface Subcategory {
  label: string;
  icon: string;
}

export interface Category {
  _id: string;
  label: string;
  img: string;
  subcategories: Subcategory[];
}

interface CategoryContextType {
  categories: Category[];
  subcategoriesData: Record<string, string[]>;
  subcatIcons: Record<string, string>;
  loading: boolean;
  error: string | null;
  refreshCategories: () => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/categories`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
        setError(null);
      } else {
        setError(data.message || "Failed to fetch categories");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const subcategoriesData = React.useMemo(() => {
    const data: Record<string, string[]> = {};
    categories.forEach((cat) => {
      data[cat.label] = cat.subcategories.map((sub) => sub.label);
    });
    return data;
  }, [categories]);

  const subcatIcons = React.useMemo(() => {
    const icons: Record<string, string> = {};
    categories.forEach((cat) => {
      cat.subcategories.forEach((sub) => {
        if (sub.icon) {
          icons[sub.label] = sub.icon;
        }
      });
    });
    return icons;
  }, [categories]);

  return (
    <CategoryContext.Provider
      value={{
        categories,
        subcategoriesData,
        subcatIcons,
        loading,
        error,
        refreshCategories: fetchCategories,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error("useCategories must be used within a CategoryProvider");
  }
  return context;
};
