# 📱 Mobile Grocery App Homepage - Implementation Plan

## ✅ Backend Complete

### 1. Database Models
- ✅ Category Model (name, slug, image, description)
- ✅ Product Model updated (added category reference)

### 2. API Endpoints
- ✅ `GET /api/categories` - Get all categories
- ✅ `GET /api/categories/:slug` - Get category by slug  
- ✅ `GET /products?category=fruits` - Filter products by category
- ✅ `POST /api/categories` - Create category (Admin)
- ✅ `PUT /api/categories/:id` - Update category (Admin)
- ✅ `DELETE /api/categories/:id` - Delete category (Admin)

## 🚧 Frontend To-Do

### Components to Create:
1. **CategoryCard.js** - Displays circular category with image & name
2. **CategoryGrid.js** - Grid layout for categories (2-3 per row on mobile)
3. **OfferBanner.js** - Green banner component
4. **MobileHome.js** - Mobile-specific homepage layout

### Updates Needed:
1. **ProductList.js** - Support category filtering from URL params
2. **App.css** - Mobile-only styles for homepage
3. **Routes** - Ensure `/products?category=X` works

### Mobile Homepage Structure:
```
┌─────────────────────────────────┐
│  🔍 Search Bar                 │
├─────────────────────────────────┤
│  📢 30% OFF Banner             │
├─────────────────────────────────┤
│  Your might like these          │
│  ┌──────┬──────┬──────┐        │
│  │ 🍎   │ 🥬   │ 🍿   │        │
│  │Fruits│Fresh │Snack │        │
│  ├──────┼──────┼──────┤        │
│  │ 🛒   │ 🥜   │ 🛢️   │        │
│  │Grocer│ Nuts │ Oils │        │
│  └──────┴──────┴──────┘        │
└─────────────────────────────────┘
```

## 📋 Next Steps

1. Seed initial categories in database
2. Create CategoryCard component
3. Create CategoryGrid component  
4. Create OfferBanner component
5. Update Home component for mobile
6. Add mobile CSS
7. Test category navigation

## 🎯 Sample Categories to Seed

```javascript
[
  { name: 'Fruits', slug: 'fruits', image: 'fruits.png' },
  { name: 'Fresh', slug: 'fresh', image: 'fresh.png' },
  { name: 'Snack', slug: 'snack', image: 'snack.png' },
  { name: 'Grocery', slug: 'grocery', image: 'grocery.png' },
  { name: 'Nuts', slug: 'nuts', image: 'nuts.png' },
  { name: 'Oils', slug: 'oils', image: 'oils.png' }
]
```

