"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, products as initialProducts, coupons } from "@/data/mockDb";

export type UserRole = "parent" | "school" | "seller" | "admin";

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  pointsEarned: number;
  status: "Pending" | "Shipped" | "Delivered";
  date: string;
  deliverToSchool: boolean;
  schoolId?: string;
}

interface AppContextProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  products: Product[];
  addNewProduct: (product: Omit<Product, "id" | "rating" | "isNew">) => void;
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  userPoints: number;
  setUserPoints: React.Dispatch<React.SetStateAction<number>>;
  activeCoupons: string[];
  redeemCoupon: (code: string, cost: number) => boolean;
  orders: Order[];
  createOrder: (deliverToSchool: boolean, schoolId?: string) => void;
  notifications: string[];
  addNotification: (msg: string) => void;
  clearNotifications: () => void;
  // School Dashboard State
  schoolLists: Record<string, any>;
  uploadSchoolList: (schoolId: string, grade: string, items: any[]) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>("parent");
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [userPoints, setUserPoints] = useState<number>(350); // Start with some initial points to test rewards
  const [activeCoupons, setActiveCoupons] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<string[]>([
    "Welcome to the Electronic Library portal!",
    "Get 10% off using coupon EDUSTART10 in the Points Hub!"
  ]);
  const [schoolLists, setSchoolLists] = useState<Record<string, any>>({});

  // Add notification helper
  const addNotification = (msg: string) => {
    setNotifications((prev) => [msg, ...prev]);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Add Product to store (Marketplace simulation)
  const addNewProduct = (newProd: Omit<Product, "id" | "rating" | "isNew">) => {
    const created: Product = {
      ...newProd,
      id: `p-${Date.now()}`,
      rating: 5.0,
      isNew: true
    };
    setProducts((prev) => [created, ...prev]);
    addNotification(`New product "${newProd.nameEn}" added to shop catalog!`);
  };

  // Cart operations
  const addToCart = (product: Product, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    addNotification(`Added "${product.nameEn}" to your shopping cart.`);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: qty } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  // Wishlist
  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        addNotification(`Removed "${product.nameEn}" from wishlist.`);
        return prev.filter((item) => item.id !== product.id);
      } else {
        addNotification(`Added "${product.nameEn}" to wishlist.`);
        return [...prev, product];
      }
    });
  };

  // Redeem Coupon
  const redeemCoupon = (code: string, cost: number): boolean => {
    if (userPoints < cost) {
      addNotification("Insufficient points to redeem this reward.");
      return false;
    }
    setUserPoints((prev) => prev - cost);
    setActiveCoupons((prev) => [...prev, code]);
    addNotification(`Successfully redeemed coupon: ${code}`);
    return true;
  };

  // Create Order
  const createOrder = (deliverToSchool: boolean, schoolId?: string) => {
    if (cart.length === 0) return;

    let subtotal = cart.reduce((acc, item) => {
      const price = item.product.discountPrice || item.product.price;
      return acc + price * item.quantity;
    }, 0);

    // Apply Coupon Discount if EDUSTART10 is active
    let discount = 0;
    if (activeCoupons.includes("EDUSTART10")) {
      discount = subtotal * 0.10;
      // Remove it from active coupons after single use
      setActiveCoupons((prev) => prev.filter((c) => c !== "EDUSTART10"));
    }

    const total = Math.max(0, subtotal - discount);
    const pointsEarned = cart.reduce((acc, item) => acc + item.product.points * item.quantity, 0);

    const newOrder: Order = {
      id: `ord-${Math.floor(1000 + Math.random() * 9000)}`,
      items: [...cart],
      total,
      pointsEarned,
      status: "Pending",
      date: new Date().toLocaleDateString(),
      deliverToSchool,
      schoolId
    };

    setOrders((prev) => [newOrder, ...prev]);
    setUserPoints((prev) => prev + pointsEarned);
    clearCart();
    addNotification(`Order ${newOrder.id} placed! Earned +${pointsEarned} reward points.`);
  };

  // School supply upload list
  const uploadSchoolList = (schoolId: string, grade: string, items: any[]) => {
    setSchoolLists((prev) => ({
      ...prev,
      [`${schoolId}-${grade}`]: items
    }));
    addNotification(`School list for ${schoolId} - Grade ${grade} uploaded successfully!`);
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        products,
        addNewProduct,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        wishlist,
        toggleWishlist,
        userPoints,
        setUserPoints,
        activeCoupons,
        redeemCoupon,
        orders,
        createOrder,
        notifications,
        addNotification,
        clearNotifications,
        schoolLists,
        uploadSchoolList
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
