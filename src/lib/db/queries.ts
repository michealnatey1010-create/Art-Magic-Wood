import prisma from "@/lib/prisma";

export async function getUsers(search?: string) {
  const users = await prisma.user.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
          ],
        }
      : undefined,
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      referralCode: true,
      referralActive: true,
      points: true,
      created_at: true,
      _count: { select: { merchant_products: true } },
    },
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    referralCode: u.referralCode,
    referralActive: u.referralActive,
    points: u.points,
    created_at: u.created_at,
    product_count: u._count.merchant_products,
  }));
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function getMerchantProducts(vendorId: string) {
  return prisma.merchantProduct.findMany({
    where: { vendor_id: vendorId },
    orderBy: { created_at: "desc" },
  });
}

export async function getStages() {
  const stages = await prisma.stage.findMany({
    orderBy: { created_at: "desc" },
    include: {
      category: true,
      products: { orderBy: { created_at: "asc" } },
    },
  });
  return stages;
}

export async function getTeacherPackages() {
  const packages = await prisma.teacherPackage.findMany({
    orderBy: { created_at: "desc" },
    include: {
      features: true,
    },
  });
  return packages;
}

export async function getPreOrderProducts() {
  return prisma.preorderProduct.findMany({
    orderBy: { created_at: "desc" },
  });
}

export async function getNotifications() {
  return prisma.notification.findMany({
    where: { status: "active" },
    orderBy: { created_at: "desc" },
  });
}

export async function getOrders(source?: string) {
  return prisma.order.findMany({
    where: source ? { source } : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      userId: true,
      source: true,
      itemId: true,
      itemName: true,
      price: true,
      discount: true,
      pointsUsed: true,
      pointsEarned: true,
      receiptImage: true,
      address: true,
      phone: true,
      senderPhone: true,
      status: true,
      createdAt: true,
      user: { select: { id: true, name: true, email: true, phone: true } },
    },
  });
}

export async function getDashboardStats() {
  const [products, stages, packages, preorders, users, orders] =
    await Promise.all([
      prisma.product.count(),
      prisma.stage.count(),
      prisma.teacherPackage.count(),
      prisma.preorderProduct.count(),
      prisma.user.count(),
      prisma.order.count(),
    ]);
  return { products, stages, packages, preorders, users, orders };
}
