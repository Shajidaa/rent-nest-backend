import { prisma } from "../../lib/prisma";
import { ICategory } from "./categories.interface";
const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};
const createCategory = async (categoryData: ICategory) => {
  const slug = categoryData.slug || generateSlug(categoryData.name);

  const existingCategory = await prisma.category.findUnique({
    where: { slug },
  });

  if (existingCategory) {
    throw new Error("Category with this name/slug already exists.");
  }

  const category = await prisma.category.create({
    data: {
      ...categoryData,
      slug,
    },
    include: {
      properties: true,
    },
  });

  return category;
};
const getAllCategories = async () => {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,

      description: true,

      _count: {
        select: {
          properties: true,
        },
      },
    },

    orderBy: {
      name: "asc",
    },
  });

  return categories;
};
export const categoryService = {
  createCategory,
  getAllCategories,
};
