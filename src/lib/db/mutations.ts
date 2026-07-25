import crypto from "crypto";
import bcryptjs from "bcryptjs";
import { db } from "./index";

const genId = () => crypto.randomBytes(16).toString("hex");

// ─── Users ───
export function createUser(name: string, email: string, password: string) {
  const hashed = bcryptjs.hashSync(password, 12);
  return db.prepare("INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)").run(genId(), name, email, hashed);
}

// ─── Stages ───
export function createStage(data: { name: string; points: number; coverImage?: string; price: number; products: { name: string; price?: number; image?: string }[] }) {
  const id = genId();
  console.log("📦 Creating stage:", data.name, "| coverImage:", data.coverImage, "| price:", data.price);
  db.prepare("INSERT INTO stages (id, name, points, coverImage, price) VALUES (?, ?, ?, ?, ?)").run(id, data.name, data.points, data.coverImage || "", data.price);
  const insertProduct = db.prepare("INSERT INTO products (id, name, price, image, stage_id) VALUES (?, ?, ?, ?, ?)");
  for (const p of data.products) {
    insertProduct.run(genId(), p.name, p.price ?? 0, p.image || "", id);
  }
  return id;
}

export function deleteStage(id: string) {
  db.prepare("DELETE FROM stages WHERE id = ?").run(id);
}

// ─── Teacher Packages ───
export function createTeacherPackage(data: { name: string; monthlyPrice: number; quarterlyPrice: number; features: string[] }) {
  const id = genId();
  db.prepare("INSERT INTO teacher_packages (id, name, monthly_price, quarterly_price) VALUES (?, ?, ?, ?)").run(id, data.name, data.monthlyPrice, data.quarterlyPrice);
  const insertFeature = db.prepare("INSERT INTO teacher_features (id, text, package_id) VALUES (?, ?, ?)");
  for (const f of data.features) {
    insertFeature.run(genId(), f, id);
  }
  return id;
}

export function deleteTeacherPackage(id: string) {
  db.prepare("DELETE FROM teacher_packages WHERE id = ?").run(id);
}

// ─── Merchant Products ───
export function createMerchantProducts(vendorId: string, products: { name: string; price: number; stock: number; description?: string; image?: string; sku?: string }[]) {
  const insert = db.prepare("INSERT INTO merchant_products (id, name, description, price, stock, image, sku, vendor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  const insertMany = db.transaction((items: typeof products) => {
    for (const p of items) {
      insert.run(genId(), p.name, p.description || "", p.price, p.stock, p.image || "", p.sku || "", vendorId);
    }
  });
  insertMany(products);
  return products.length;
}

// ─── Pre-Order Products ───
export function createPreOrderProduct(data: { name: string; price: number; image: string }) {
  return db.prepare("INSERT INTO preorder_products (id, name, price, image) VALUES (?, ?, ?, ?)").run(genId(), data.name, data.price, data.image);
}

export function deletePreOrderProduct(id: string) {
  db.prepare("DELETE FROM preorder_products WHERE id = ?").run(id);
}

// ─── Libraries ───
export function createLibrary(data: { name: string; email: string; commission: number }) {
  return db.prepare("INSERT INTO libraries (id, name, email, commission) VALUES (?, ?, ?, ?)").run(genId(), data.name, data.email, data.commission);
}

export function toggleLibrary(id: string) {
  const lib = db.prepare("SELECT active FROM libraries WHERE id = ?").get(id) as any;
  if (!lib) throw new Error("Library not found");
  db.prepare("UPDATE libraries SET active = ? WHERE id = ?").run(lib.active ? 0 : 1, id);
}

export function deleteLibrary(id: string) {
  db.prepare("DELETE FROM libraries WHERE id = ?").run(id);
}
