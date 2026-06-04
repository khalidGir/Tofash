Tofash — MVP PRD (Phase 1)

Product Name

Tofash (ጦፋሽ)

Meaning:
A local Amharic-inspired brand focused on homemade desserts and sweets.

---

1. Product Vision

Tofash is a curated marketplace web app for homemade dessert sellers in Ethiopia.

The platform helps customers:

- Discover trusted homemade dessert sellers
- Browse menus visually
- Place orders easily
- Communicate with sellers
- Upload payment proof
- Schedule orders

The platform helps sellers:

- Organize orders
- Showcase products professionally
- Build customer trust
- Manage order flow in one place

Phase 1 is focused ONLY on:

- Homemade desserts & sweets
- Addis Ababa
- Curated onboarding
- Marketplace validation

No in-house delivery operations will exist in Phase 1.

---

2. Product Goals (Phase 1)

Primary Goal:

- Increase number of successful orders

Secondary Goals:

- Validate user behavior
- Build customer trust
- Build repeat ordering habits
- Organize seller workflows

---

3. Non-Goals (NOT included in MVP)

The following are intentionally excluded from Phase 1:

- In-house delivery fleet
- Wallet system
- Escrow system
- AI recommendations
- Advanced analytics
- Loyalty system
- Seller subscriptions
- Automated refunds
- Complex marketing tools
- Native mobile apps
- Multi-city operations

---

4. Platform Type

Progressive Web App (PWA)

Requirements:

- Mobile-first responsive design
- Installable on home screen
- App-like experience
- Fast loading
- No App Store required

Languages:

- English
- Amharic

---

5. User Roles

5.1 Guest User

Can:

- Browse sellers
- Search products
- View product pages
- Add items to cart
- Place order
- Upload payment proof

Cannot:

- Save favorites
- View full order history

---

5.2 Customer Account

Can:

- View order history
- Track order status
- Chat with seller
- Leave ratings
- Reorder items

---

5.3 Seller

Can:

- Manage products
- Manage orders
- Accept/reject orders
- Approve payment proof
- Set preparation times
- Set working hours
- Chat with customers

Cannot:

- Delete completed orders
- Modify platform policies

---

5.4 Admin

Full platform access.

Can:

- Approve sellers
- Suspend sellers
- Manage disputes
- Edit products
- View analytics
- Moderate content
- Access all order history
- Manage featured sellers

---

6. Seller Onboarding

Seller registration is NOT automatic.

All sellers require manual approval.

Required seller information:

- Full name
- Phone number
- Government ID
- Store name
- Profile image
- Social media links
- Payment method details
- Approximate location

---

7. Marketplace Structure

Each seller has:

- Dedicated storefront page
- Banner image
- Product catalog
- Ratings
- Reviews
- Preparation time
- Working hours
- Pickup availability
- Delivery availability

---

8. Core Customer Features

8.1 Home Page

Includes:

- Featured sellers
- Trending desserts
- New arrivals
- Categories
- Search bar

---

8.2 Search

Search by:

- Product name
- Seller name
- Category

Examples:

- Cake
- Cookies
- Cupcakes

---

8.3 Product Page

Displays:

- Product images
- Description
- Price
- Preparation time
- Seller info
- Ratings

---

8.4 Cart & Checkout

Customer can:

- Add products
- Select quantity
- Add notes
- Choose:
  - Pickup
  - External delivery
- Choose:
  - Immediate order
  - Scheduled order

---

8.5 Payment Proof Upload

Customer uploads:

- Screenshot/photo of transfer

Order status becomes:

- Pending Payment Verification

Seller can:

- Approve payment
- Reject payment

If seller does not respond within defined timeout:

- Order expires automatically

---

8.6 Chat System

Simple in-app chat between:

- Customer
- Seller

MVP Chat Scope:

- Text only
- No voice
- No video
- No media uploads initially

---

8.7 Ratings & Reviews

Customers can:

- Leave star ratings
- Leave text reviews

Only verified orders can review.

---

9. Seller Dashboard (MVP Scope)

Seller dashboard includes:

Orders

- New orders
- Pending payments
- Accepted orders
- Rejected orders
- Completed orders

---

Product Management

Seller can:

- Add products
- Edit products
- Set availability
- Upload images

---

Store Settings

Seller can:

- Set working hours
- Set preparation times
- Toggle pickup availability
- Toggle external delivery availability

---

Customer Chat

Unified chat inbox.

---

10. Admin Panel

Seller Management

- Approve/reject sellers
- Suspend sellers
- View seller history

---

Product Moderation

- Remove low-quality content
- Edit categories
- Feature products

---

Order Monitoring

- View all orders
- View disputes
- Monitor fraud activity

---

Analytics Dashboard

Track:

- Total orders
- GMV
- Top sellers
- Repeat customers
- Most searched products
- Conversion rates

---

11. Order Flow

1. Customer browses products
2. Adds items to cart
3. Places order
4. Uploads payment proof
5. Seller verifies payment
6. Seller accepts/rejects order
7. Customer receives updates
8. Order completed
9. Customer leaves review

---

12. Trust & Safety

Requirements:

- Verified sellers only
- Manual onboarding
- Dispute reporting
- Fraud monitoring
- Seller suspension system

No anonymous sellers allowed.

---

13. Design Direction

Brand Feel:

- Feminine
- Warm
- Premium homemade
- Soft and elegant

Design Style:

- Clean UI
- Large food imagery
- Rounded cards
- Minimal clutter
- Dessert-first visuals

---

14. Recommended Tech Stack

Frontend:

- Next.js
- TailwindCSS
- PWA support

Backend:

- Supabase OR Firebase

Database:

- PostgreSQL

Authentication:

- OTP phone auth

Storage:

- Cloud image storage

Hosting:

- Vercel

---

15. Success Metrics (First 3 Months)

Primary KPI:

- Number of completed orders

Secondary KPIs:

- Repeat orders
- Seller retention
- Customer retention
- GMV
- Average order value

---

16. Future Roadmap (Post-MVP)

Future possibilities:

- Delivery integrations
- Escrow payments
- Seller subscriptions
- Advanced analytics
- Promotions
- Push notifications
- AI recommendations
- Loyalty systems
- Native apps
- Social feed
- Influencer collaborations