# Uphar Gift Shop

Uphar Gift Shop is a modern React + TypeScript storefront for browsing, discovering, and managing gift products. The project is designed for a gifting brand that sells curated items such as keychains, decorative accessories, occasions-based gifts, and personalized products.

## Project overview

This application includes:

- a customer-facing product catalogue and category pages
- product filtering and search
- cart and wishlist functionality
- a checkout flow
- a shareable selection feature for sending a saved list to others
- an admin panel for managing products, categories, tags, occasions, homepage slides, and sales records
- a simple sales/khata-style tracker showing what was sold, stock updates, and profit-related analytics
- a responsive storefront with a premium, lifestyle-focused UI

## Main features

### 1. Product catalogue and browsing experience
- Landing page with hero slider, category cards, occasion sections, and featured collections
- Category browsing with dedicated pages per collection
- Product listing pages for new arrivals, pre-orders, deals, and the full shop
- Search across products and category content

### 2. Cart, wishlist, and product interaction
- Add products to cart or wishlist
- Adjust cart quantities and remove items
- Inventory-aware cart logic with sold-out handling
- Save product lists for later and continue shopping

### 3. Share selection feature
- Users can share selected cart or wishlist items using a generated token
- Each share is persisted in local storage and linked to a dedicated route like `/share/:token`
- Shared links can be copied, opened natively on mobile, or sent through WhatsApp
- The recipient can view the selected product list, item quantity, and total value

### 4. Admin dashboard
- Secure admin access via session storage flag
- Add, edit, delete, and view products
- Create and assign categories and tags
- Manage occasions and homepage slides
- Track sales and inventory state
- Upload product and category images through Cloudinary

### 5. Occasion and brand-driven merchandising
- Dedicated pages for different gifting occasions
- Occasion-specific icons, labels, and product groupings
- Curated home page sections designed to match a gift boutique identity

## Tech stack

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Supabase integration for product/category data
- LocalStorage-based state for cart, wishlist, and share selections

## Getting started

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Production notes

This build is structured as a storefront front-end and can be connected to Supabase or a custom backend for production data persistence. Some features such as sharing and cart behaviour are implemented with browser storage for a lightweight MVP flow.

## Project purpose

The application is built to help a gifting business present products elegantly, keep browsing intuitive, and simplify the sales journey for both shoppers and administrators. It combines catalog experience, commerce actions, and a simple CMS-like admin workflow in one React app.

