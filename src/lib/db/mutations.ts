import bcryptjs from "bcryptjs";
import prisma from "@/lib/prisma";

// ─── Users ───
export async function createUser(name: string, email: string, password: string) {
  const hashed = bcryptjs.hashSync(password, 12);
  return prisma.user.create({
    data: { name, email, password: hashed },
  });
}

// ─── Stages ───
export async function createStage(data: {
  name: string;
  points: number;
  coverImage?: string;
  price: number;
  products: { name: string; price?: number; image?: string }[];
}) {
  return prisma.stage.create({
    data: {
      name: data.name,
      points: data.points,
      coverImage: data.coverImage || "",
      price: data.price,
      products: {
        create: data.products.map((p) => ({
          name: p.name,
          price: p.price ?? 0,
          image: p.image || "",
        })),
      },
    },
  });
}

export async function deleteStage(id: string) {
  await prisma.stage.delete({ where: { id } });
}

// ─── Teacher Packages ───
export async function createTeacherPackage(data: {
  name: string;
  monthlyPrice: number;
  quarterlyPrice: number;
  features: string[];
}) {
  return prisma.teacherPackage.create({
    data: {
      name: data.name,
      monthly_price: data.monthlyPrice,
      quarterly_price: data.quarterlyPrice,
      features: {
        create: data.features.map((text) => ({ text })),
      },
    },
  });
}

export async function deleteTeacherPackage(id: string) {
  await prisma.teacherPackage.delete({ where: { id } });
}

// ─── Merchant Products ───
export async function createMerchantProducts(
  vendorId: string,
  products: {
    name: string;
    price: number;
    stock: number;
    description?: string;
    image?: string;
    sku?: string;
  }[]
) {
  let count = 0;
  await prisma.$transaction(
    products.map((p) => {
      const sku = p.sku?.trim() || null;
      if (sku) {
        return prisma.merchantProduct.upsert({
          where: { sku },
          update: {
            name: p.name,
            price: p.price,
            stock: p.stock,
            description: p.description || "",
            image: p.image || "",
          },
          create: {
            name: p.name,
            price: p.price,
            stock: p.stock,
            description: p.description || "",
            image: p.image || "",
            sku,
            vendor_id: vendorId,
          },
        });
      }
      return prisma.merchantProduct.create({
        data: {
          name: p.name,
          price: p.price,
          stock: p.stock,
          description: p.description || "",
          image: p.image || "",
          vendor_id: vendorId,
        },
      });
    })
  );
  count = products.length;
  return count;
}

// ─── Pre-Order Products ───
export async function createPreOrderProduct(data: {
  name: string;
  price: number;
  image: string;
}) {
  return prisma.preorderProduct.create({ data });
}

export async function deletePreOrderProduct(id: string) {
  await prisma.preorderProduct.delete({ where: { id } });
}

// ─── Libraries ───
export async function createLibrary(data: {
  name: string;
  email: string;
  commission: number;
}) {
  return prisma.library.create({ data });
}

export async function toggleLibrary(id: string) {
  const lib = await prisma.library.findUnique({ where: { id } });
  if (!lib) throw new Error("Library not found");
  await prisma.library.update({
    where: { id },
    data: { active: lib.active ? 0 : 1 },
  });
}

export async function updateLibraryCommission(id: string, commission: number) {
  await prisma.library.update({
    where: { id },
    data: { commission },
  });
}

export async function deleteLibrary(id: string) {
  await prisma.library.delete({ where: { id } });
}

// ─── Orders ───
export async function createOrder(data: {
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  payment_phone?: string;
  payment_receipt?: string;
  items?: string;
  total_amount?: number;
  notes?: string;
}) {
  return prisma.order.create({ data });
}

export async function updateOrderStatus(id: string, status: string) {
  await prisma.order.update({ where: { id }, data: { status } });
}

export async function deleteOrder(id: string) {
  await prisma.order.delete({ where: { id } });
}
