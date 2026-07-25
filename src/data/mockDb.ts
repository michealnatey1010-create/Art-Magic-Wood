export interface Product {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  price: number;
  discountPrice?: number;
  points: number;
  category: string;
  rating: number;
  image: string;
  isBestSeller?: boolean;
  isNew?: boolean;
  isFlashSale?: boolean;
}

export interface School {
  id: string;
  nameEn: string;
  nameAr: string;
}

export interface SupplyKitItem {
  id: string;
  nameEn: string;
  nameAr: string;
  quantity: number;
  price: number;
}

export interface TeacherPlan {
  id: string;
  nameEn: string;
  nameAr: string;
  price: number;
  billingEn: string;
  billingAr: string;
  featuresEn: string[];
  featuresAr: string[];
}

export const schools: School[] = [
  { id: "s1", nameEn: "International Academy of Riyadh", nameAr: "أكاديمية الرياض الدولية" },
  { id: "s2", nameEn: "Al-Resalah Private School", nameAr: "مدارس الرسالة الأهلية" },
  { id: "s3", nameEn: "Dar Al-Fikr Schools", nameAr: "مدارس دار الفكر" },
];

export const supplyKits: Record<string, Record<string, SupplyKitItem[]>> = {
  s1: {
    g1: [
      { id: "ki1", nameEn: "Triangular Pencils (12 Pack)", nameAr: "أقلام رصاص مثلثية (12 قلم)", quantity: 1, price: 4.5 },
      { id: "ki2", nameEn: "Premium Drawing Notebook 60 pages", nameAr: "كشكول رسم فاخر 60 صفحة", quantity: 2, price: 3.0 },
      { id: "ki3", nameEn: "Ergonomic Kids Scissors", nameAr: "مقص أطفال مريح", quantity: 1, price: 2.0 },
      { id: "ki4", nameEn: "Washable Glue Stick 40g", nameAr: "لاصق أصابع قابل للغسل 40 جرام", quantity: 3, price: 1.5 },
      { id: "ki5", nameEn: "Ergonomic School Backpack (Blue)", nameAr: "حقيبة مدرسية مريحة (أزرق)", quantity: 1, price: 25.0 }
    ],
    g2: [
      { id: "ki6", nameEn: "Blue Ballpoint Pens (10 Pack)", nameAr: "أقلام حبر زرقاء (10 أقلام)", quantity: 1, price: 3.5 },
      { id: "ki7", nameEn: "Math Geometry Set", nameAr: "علبة هندسة رياضيات", quantity: 1, price: 6.0 },
      { id: "ki2", nameEn: "Premium Drawing Notebook 60 pages", nameAr: "كشكول رسم فاخر 60 صفحة", quantity: 4, price: 3.0 },
      { id: "ki4", nameEn: "Washable Glue Stick 40g", nameAr: "لاصق أصابع قابل للغسل 40 جرام", quantity: 2, price: 1.5 },
      { id: "ki8", nameEn: "Double Zipper Pencil Case", nameAr: "مقلمة بسحاب مزدوج", quantity: 1, price: 5.0 }
    ]
  },
  s2: {
    g1: [
      { id: "ki1", nameEn: "Triangular Pencils (12 Pack)", nameAr: "أقلام رصاص مثلثية (12 قلم)", quantity: 2, price: 4.5 },
      { id: "ki9", nameEn: "Coloring Pencil Box (24 Colors)", nameAr: "علبة ألوان خشبية (24 لون)", quantity: 1, price: 7.5 },
      { id: "ki10", nameEn: "Wide-ruled Notebook 80 pages", nameAr: "كشكول مسطر عريض 80 صفحة", quantity: 3, price: 2.5 },
      { id: "ki11", nameEn: "Plastic Ruler 30cm", nameAr: "مسطرة بلاستيكية 30 سم", quantity: 1, price: 1.0 }
    ],
    g2: [
      { id: "ki6", nameEn: "Blue Ballpoint Pens (10 Pack)", nameAr: "أقلام حبر زرقاء (10 أقلام)", quantity: 2, price: 3.5 },
      { id: "ki10", nameEn: "Wide-ruled Notebook 80 pages", nameAr: "كشكول مسطر عريض 80 صفحة", quantity: 5, price: 2.5 },
      { id: "ki12", nameEn: "Pocket Calculator", nameAr: "آلة حاسبة جيبية", quantity: 1, price: 12.0 },
      { id: "ki13", nameEn: "Plastic Water Bottle 500ml", nameAr: "مطرة ماء بلاستيكية 500 مل", quantity: 1, price: 8.0 }
    ]
  }
};

export const products: Product[] = [
  {
    id: "p1",
    nameEn: "Ergonomic Orthopedic School Bag",
    nameAr: "حقيبة مدرسية لتقويم العظام مريحة",
    descriptionEn: "High-quality padded straps, breathable mesh back, with double compartment for school books.",
    descriptionAr: "أحزمة مبطنة عالية الجودة، ظهر شبكي يتنفس، مع قسمين مزدوجين للكتب المدرسية.",
    price: 45.0,
    discountPrice: 38.0,
    points: 80,
    category: "School Bags",
    rating: 4.8,
    image: "bag", // We will render drawing fallback or emoji
    isBestSeller: true
  },
  {
    id: "p2",
    nameEn: "Premium Pastel Markers (Set of 6)",
    nameAr: "أقلام تظليل باستيل فاخرة (طقم 6)",
    descriptionEn: "Smudge-free highlighters for classroom study and color-coded notes.",
    descriptionAr: "أقلام تظليل مانعة للتلطخ للمذاكرة وكتابة الملاحظات الملونة.",
    price: 8.0,
    discountPrice: 6.5,
    points: 15,
    category: "Pens",
    rating: 4.7,
    image: "pens",
    isFlashSale: true
  },
  {
    id: "p3",
    nameEn: "Advanced Scientific Calculator Pro",
    nameAr: "آلة حاسبة علمية متطورة برو",
    descriptionEn: "Supports over 240 math functions, ideal for high school and university students.",
    descriptionAr: "تدعم أكثر من 240 دالة رياضية، مثالية لطلاب الثانوي والجامعات.",
    price: 25.0,
    points: 50,
    category: "Office Supplies",
    rating: 4.9,
    image: "calc",
    isNew: true
  },
  {
    id: "p4",
    nameEn: "Acrylic Painting Kit (12 Tubes + Brushes)",
    nameAr: "مجموعة ألوان أكريليك (12 أنبوب + فرش)",
    descriptionEn: "Vibrant colors with strong pigments. Non-toxic, quick-drying art supplies.",
    descriptionAr: "ألوان زاهية بصبغة قوية. غير سامة وسريعة الجفاف لمحبي الرسم.",
    price: 18.0,
    discountPrice: 15.0,
    points: 35,
    category: "Art Supplies",
    rating: 4.5,
    image: "art",
    isBestSeller: true
  },
  {
    id: "p5",
    nameEn: "Interactive English-Arabic Globe",
    nameAr: "مجسم الكرة الأرضية التفاعلي عربي-إنجليزي",
    descriptionEn: "Touch-activated talking globe with fun geographical quizzes and facts.",
    descriptionAr: "مجسم متحدث يعمل باللمس يحتوي على مسابقات تعليمية وحقائق جغرافية.",
    price: 60.0,
    points: 120,
    category: "Educational Games",
    rating: 4.9,
    image: "game",
    isNew: true
  },
  {
    id: "p6",
    nameEn: "Whiteboard Dry-Erase Markers (12 Pack)",
    nameAr: "أقلام سبورة قابلة للمسح (12 قلم)",
    descriptionEn: "Low odor ink, vivid colors, easy dry wipe, perfect for teachers.",
    descriptionAr: "حبر خفيف الرائحة، ألوان زاهية، سهلة المسح الجاف، مثالية للمعلمين.",
    price: 12.0,
    points: 25,
    category: "Teacher Supplies",
    rating: 4.6,
    image: "markers"
  },
  {
    id: "p7",
    nameEn: "Grid Notebook A4 (80 Sheets)",
    nameAr: "دفتر مربعات مقاس A4 (80 ورقة)",
    descriptionEn: "Perfect for science, mathematics, and sketching complex diagrams.",
    descriptionAr: "مثالي للعلوم، الرياضيات، وتخطيط الرسوم البيانية المعقدة.",
    price: 3.5,
    points: 7,
    category: "Notebooks",
    rating: 4.4,
    image: "notebook"
  },
  {
    id: "p8",
    nameEn: "Bespoke Thesis Printing & Binding",
    nameAr: "خدمة طباعة وتجليد الرسائل الجامعية",
    descriptionEn: "High-quality digital print, hardcover with gold lettering options.",
    descriptionAr: "طباعة رقمية عالية الدقة، غلاف فني مع خيارات كتابة ذهبية.",
    price: 30.0,
    points: 60,
    category: "Printing Services",
    rating: 4.8,
    image: "print"
  }
];

export const teacherPlans: TeacherPlan[] = [
  {
    id: "t1",
    nameEn: "Standard Box",
    nameAr: "الصندوق القياسي",
    price: 19.0,
    billingEn: "per month",
    billingAr: "شهرياً",
    featuresEn: ["4 dry-erase markers", "2 educational posters", "50 motivational stickers", "Basic classroom decorations"],
    featuresAr: ["4 أقلام سبورة ملونة", "2 بوستر تعليمي للجدران", "50 ملصق تشجيعي للطلاب", "ديكورات فصل دراسي أساسية"]
  },
  {
    id: "t2",
    nameEn: "Professional Box",
    nameAr: "الصندوق المهني",
    price: 49.0,
    billingEn: "per quarter (Save 15%)",
    billingAr: "ربع سنوي (توفير 15%)",
    featuresEn: ["12 dry-erase markers", "6 educational posters", "150 motivational stickers", "Advanced theme decorations", "Teaching pointer & card templates"],
    featuresAr: ["12 قلم سبورة ملونة", "6 بوسترات تعليمية للجدران", "150 ملصق تشجيعي للطلاب", "ديكورات فصل متكاملة حسب موضوع الشهر", "مؤشر تدريس وبطاقات شرح للمدرس"]
  },
  {
    id: "t3",
    nameEn: "Elite School-wide Subscription",
    nameAr: "الاشتراك النخبوي السنوي",
    price: 149.0,
    billingEn: "per year (Save 35%)",
    billingAr: "سنوياً (توفير 35%)",
    featuresEn: ["Monthly box delivered all year", "50 whiteboard markers total", "20 educational posters", "500 motivational stickers", "Premium seasonal holiday decorations", "One-click replacement service"],
    featuresAr: ["توصيل الصندوق شهرياً طوال العام الدراسي", "50 قلم سبورة ملونة إجمالي", "20 بوستر تعليمي للجدران", "500 ملصق تشجيعي للطلاب", "زينة مواسم الأعياد والفصول الممتازة", "خدمة التبديل والتعويض بنقرة واحدة"]
  }
];

export const coupons = [
  { code: "EDUSTART10", discount: 0.10, pointsCost: 100, labelEn: "10% Off Stationery", labelAr: "خصم 10% على القرطاسية" },
  { code: "FREEBAG", discount: 1.0, isFreeProduct: true, productId: "p1", pointsCost: 800, labelEn: "Free Orthopedic Bag", labelAr: "حقيبة تقويم عظام مجاناً" },
  { code: "TEACHERLOVE", discount: 15.0, pointsCost: 300, labelEn: "15 SAR Flat Discount", labelAr: "خصم بقيمة 15 ريال" }
];
