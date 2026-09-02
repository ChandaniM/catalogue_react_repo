# Project Features and Functional Details

## 1. Overview

Uphar Gift Shop is a storefront application for a gifting and lifestyle brand. The project focuses on browsing curated products, managing customer selections, and giving the business admin tools to edit the catalogue without needing a heavy CMS.

The app combines a polished storefront, category-based merchandising, wishlist/cart logic, and a lightweight admin management panel.

## 2. Customer-facing features

### Homepage and landing experience
The homepage acts as a marketing and storefront landing page. It includes:

- a hero slider with promotional banners
- category cards to highlight collections
- occasion-based sections to inspire gifting ideas
- featured products and best sellers
- promotional callout banners and trust-building sections

This gives the brand a premium ecommerce feel while still being simple to manage.

### Product catalog and category browsing
The app supports multiple shopping paths:

- home page category navigation
- full product listing pages
- category-specific pages for different product groups
- filters for arrivals, deals, pre-orders, and general shopping
- product search across the product catalog

Categories are modeled as reusable groups and can be assigned to products. This makes it easier to present products in a structured way and allow category-level merchandising.

### Search and discovery flow
Customers can search by product name or description. The search flow is shared across the site, so users can quickly filter product pages based on the active query.

This improves discoverability and keeps the app usable even when the product catalog grows.

### Cart and wishlist behaviour
The shopping context stores cart and wishlist data in browser local storage, making the experience persistent across refreshes.

Cart features include:

- add to cart
- remove items
- increase or decrease quantities
- sold-out handling
- total item count in the navigation

Wishlist features include:

- save products for later
- view saved items in a dedicated page
- move saved products into cart quickly

### Checkout experience
The app includes a checkout page for completing a purchase journey. It is designed for a gift shop flow where a customer can review and confirm purchase details before finalizing the order.

## 3. Share selection feature (newly added)

One of the most important added features is the ability to save and share a product selection.

### What it does
A user can create a saved list from the products they selected in the cart or wishlist. The system stores a tokenized selection in local storage and generates a public route such as `/share/:token`.

### Implementation details
The share feature is handled in `src/lib/share.ts` and includes:

- `createShareToken(items)` for generating a unique token
- `loadShareSelection(token)` for retrieving a saved list
- `getShareUrl(token)` for building a shareable URL
- `SharedSelection` and `SharedSelectionItem` models for structured storage

### User-facing behaviour
On the shared page, users can:

- view the list of selected items
- see each product image and item details
- see the product count and total estimated value
- copy the URL to clipboard
- use native sharing if supported by the browser
- send the list through WhatsApp

The page also handles missing or expired selections gracefully with a friendly “Selection not found” message.

This feature is especially useful for gifting workflows, where a customer wants to send a shortlist to family or friends before checkout.

## 4. Admin capabilities

The admin dashboard is a central management console for the business owner.

### Sales ledger / khata-style tracking
The admin panel includes a lightweight sales tracker that helps the shop owner keep daily records of product sales.

Features include:

- recording sale entries with product, quantity, customer, payment method, and notes
- marking paid, pending, or cancelled orders
- automatically updating stock and sold-quantity values when a sale is marked as paid
- recent sales log for daily activity tracking
- analytics for units sold, inventory value, revenue potential, and profit potential

This gives the shop a simple khata-style workflow for tracking business performance without a full accounting system.

### Product management
The admin can:

- add new products
- edit current products
- delete products
- upload product images
- assign category, tags, and occasion metadata
- mark products as new arrival, deal, or pre-order
- set pricing and quantity

### Category management
The admin panel supports:

- creating categories
- editing category info
- activating or deactivating categories
- setting cover images for category cards

This allows the storefront to stay organized and visually consistent as new collections are added.

### Tag and occasion management
Tags help filter and organize products within categories, and occasions help create gifting-specific browsing experiences.

The app supports:

- global tag creation
- product tag assignments
- occasion creation and display
- themed product grouping for seasonal or event-based shopping

### Homepage and content management
The admin can also manage:

- homepage slides
- promotional banners and content blocks
- product sales records and notes

This makes the project more than a static catalogue; it behaves like a small commerce admin system with a visual storefront.

## 5. Technical architecture

### Frontend structure
The frontend uses a modular React architecture with components divided by responsibility:

- `src/pages` for screens and route-level pages
- `src/components` for reusable UI blocks
- `src/context` for state management
- `src/lib` for service and data helper logic
- `src/services` for API-related category and content operations
- `src/types` for shared models

### State management
The app uses React context for central commerce state. The `ShopProvider` manages:

- cart items
- wishlist IDs
- search query
- feature flags
- inventory-aware cart actions

This keeps cross-page state consistent while avoiding heavy dependencies.

### Data persistence
The project uses a hybrid data model:

- Supabase for product and catalogue data when configured
- localStorage for cart, wishlist, share selections, and feature flags
- static or uploaded asset URLs for product visuals

This lightweight combination supports rapid development and demo deployment.

## 6. Business value of the project

This project is built for a small to medium gifting business that needs:

- a visually appealing storefront
- a clear product browsing experience
- easy updates from the admin side
- a simple way to manage product collections and occasions
- the ability to share curated product lists with buyers

The result is a complete product showcase and shopping experience with strong usability for both customers and administrators.

## 7. Summary

The key additions to this project are a modern gift shop storefront, category-driven product discovery, wishlist/cart functionality, lightweight checkout, shareable selections, and an admin dashboard capable of managing the business catalog. Together, these features turn the application into a practical ecommerce prototype for a gifting brand.
