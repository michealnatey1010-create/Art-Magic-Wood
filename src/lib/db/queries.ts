import { db } from "./index";

export function getUsers(search?: string) {
  const sql = search
    ? `SELECT id, name, email, phone, role, created_at FROM users WHERE name LIKE ? OR email LIKE ? ORDER BY created_at DESC`
    : `SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC`;
  const params = search ? [`%${search}%`, `%${search}%`] : [];
  const users = db.prepare(sql).all(...params) as any[];
  for (const u of users) {
    const row = db.prepare("SELECT COUNT(*) as count FROM merchant_products WHERE vendor_id = ?").get(u.id) as any;
    u.product_count = row.count;
  }
  return users;
}

export function getUserByEmail(email: string) {
  return db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
}

export function getMerchantProducts(vendorId: string) {
  return db.prepare("SELECT * FROM merchant_products WHERE vendor_id = ? ORDER BY created_at DESC").all(vendorId);
}

export function getStages() {
  const stages = db.prepare("SELECT * FROM stages ORDER BY created_at DESC").all() as any[];
  for (const stage of stages) {
    stage.products = db.prepare("SELECT * FROM products WHERE stage_id = ? ORDER BY created_at ASC").all(stage.id);
  }
  return stages;
}

export function getTeacherPackages() {
  const packages = db.prepare("SELECT * FROM teacher_packages ORDER BY created_at DESC").all() as any[];
  for (const pkg of packages) {
    pkg.features = db.prepare("SELECT * FROM teacher_features WHERE package_id = ?").all(pkg.id);
  }
  return packages;
}

export function getPreOrderProducts() {
  return db.prepare("SELECT * FROM preorder_products ORDER BY created_at DESC").all();
}

export function getLibraries() {
  return db.prepare("SELECT * FROM libraries ORDER BY created_at DESC").all();
}

export function getDashboardStats() {
  const products = (db.prepare("SELECT COUNT(*) as count FROM products").get() as any).count;
  const stages = (db.prepare("SELECT COUNT(*) as count FROM stages").get() as any).count;
  const packages = (db.prepare("SELECT COUNT(*) as count FROM teacher_packages").get() as any).count;
  const preorders = (db.prepare("SELECT COUNT(*) as count FROM preorder_products").get() as any).count;
  const libraries = (db.prepare("SELECT COUNT(*) as count FROM libraries").get() as any).count;
  const users = (db.prepare("SELECT COUNT(*) as count FROM users").get() as any).count;
  return { products, stages, packages, preorders, libraries, users };
}
