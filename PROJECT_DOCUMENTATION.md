# Tiferes L'Moshe - Project Documentation

## Overview

**Tiferes L'Moshe** is a fast, modern, searchable online audio discourse archive built with Next.js 15, TypeScript, and TailwindCSS. The platform allows users to browse, search, and listen to recorded shiurim (Jewish Torah discourses) with timestamps, while providing administrators with a comprehensive content management system.

**Status:** Production-ready, deployed on Vercel

---

## Tech Stack

### Core Framework
- **Next.js 15** (App Router) - React meta-framework
- **TypeScript** - Type-safe development
- **React 19** - UI library
- **TailwindCSS** - Utility-first CSS framework

### Backend & Storage
- **Supabase** - PostgreSQL database, authentication, real-time features
- **Cloudflare R2** - S3-compatible object storage for MP3 audio files and images
- **AWS SDK v3** (`@aws-sdk/client-s3`) - R2 upload integration

### External Services
- **Resend API** - Transactional email for contact form
- **Vercel** - Hosting platform
- **GitHub** - Version control and deployment automation

### Design & Fonts
- **Google Fonts** - Castoro (headings), Poppins (body text)
- **Lucide React** - Icon library

---

## Project Structure

```
tiferes-lmoshe/
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout with Navbar & footer
│   │   ├── page.tsx                   # Homepage with shiur cards
│   │   ├── api/
│   │   │   ├── contact/route.ts       # Contact form handler
│   │   │   ├── upload/route.ts        # Audio/image upload to R2
│   │   │   ├── pages/route.ts         # Fetch all pages
│   │   │   └── pages/[slug]/route.ts  # Fetch single page
│   │   ├── shiur/
│   │   │   └── [slug]/
│   │   │       ├── page.tsx           # Shiur detail (server component)
│   │   │       └── detail-content.tsx # Shiur detail (client component)
│   │   ├── pages/
│   │   │   └── [slug]/page.tsx        # Custom page viewer
│   │   ├── admin/
│   │   │   ├── page.tsx               # Admin login page
│   │   │   ├── new/page.tsx           # Create new shiur form
│   │   │   └── pages/page.tsx         # Page builder admin interface
│   │   ├── about/page.tsx             # Redirect to /pages/about-shul
│   │   ├── contact/page.tsx           # Contact form page
│   │   ├── donate/page.tsx            # Donation redirect page
│   │   └── book/page.tsx              # Book/seforim page
│   ├── components/
│   │   ├── Navbar.tsx                 # Main navigation bar with logo
│   │   ├── SearchBar.tsx              # Search & filter component
│   │   ├── AudioCard.tsx              # Individual shiur card
│   │   ├── AudioPlayer.tsx            # Audio playback player
│   │   ├── TimestampsList.tsx         # Clickable timestamps for audio
│   │   ├── TimestampPicker.tsx        # Timestamp selection for editing
│   │   ├── DiscourseWidget.tsx        # "Upcoming Shiur" info display
│   │   └── AdminForm.tsx              # Form for new shiur creation
│   ├── lib/
│   │   ├── types.ts                   # TypeScript interfaces
│   │   ├── supabaseClient.ts          # Supabase client init
│   │   ├── resendEmail.ts             # Resend email client
│   │   └── auth.ts                    # Authentication utilities
│   └── styles/
│       └── globals.css                # Global styles & CSS variables
├── public/
│   ├── logo.png                       # Site logo (logo-trns-inv.png)
│   └── [other assets]
├── migrations/
│   └── create_pages_table.sql         # SQL migration for pages table
├── seed.sql                           # Database seeding script
├── .env.local                         # Environment variables (local only)
├── package.json                       # Dependencies & scripts
├── tsconfig.json                      # TypeScript config
├── next.config.js                     # Next.js config
├── tailwind.config.ts                 # Tailwind config
├── postcss.config.js                  # PostCSS config
└── .npmrc                             # NPM config (legacy-peer-deps)
```

---

## Key Features

### User-Facing Features
1. **Search & Filter** - Search shiurim by title/description, filter by topic tags
2. **Audio Playback** - Built-in HTML5 audio player with progress scrubbing
3. **Timestamps** - Clickable timestamps that jump to specific moments in recordings
4. **Responsive Design** - Mobile-first design with Flexbox-only layout (no CSS Grid)
5. **Pagination** - 30 shiurim per page on homepage
6. **Custom Pages** - Admin can create custom landing pages (About, Seforim, etc.)
7. **Donate Button** - Links to charity donation portal
8. **Contact Form** - Send messages via Resend email service

### Admin Features
1. **Inline Editing** - Edit shiur details directly on the detail page (title, description, tags, audio file, image)
2. **Upload Management** - Upload or replace audio files and images
3. **Timestamp Management** - Add, edit, and delete timestamps with current playback time
4. **Page Builder** - Create custom pages with content, images, optional buttons
5. **Navigation Control** - Show/hide pages from main navigation
6. **Discourse Widget** - Edit "Upcoming Shiur" information inline
7. **Download Toggle** - Enable/disable download for each shiur

---

## Database Schema

### Tables

#### `shiurim`
```sql
id: BIGINT (Primary Key)
title: TEXT
description: TEXT
tags: TEXT[] (Array of topic tags)
audio_url: TEXT
image_url: TEXT
created_at: TIMESTAMP
updated_at: TIMESTAMP
allow_download: BOOLEAN
speaker: TEXT
date: DATE
timestamps: JSONB (Array of {time: number, label: string})
slug: TEXT (Unique URL-friendly identifier)
```

#### `pages`
```sql
id: UUID (Primary Key)
slug: TEXT (Unique)
title: TEXT
content: TEXT
image_url: TEXT
button_text: TEXT (Optional)
button_link: TEXT (Optional)
show_in_nav: BOOLEAN
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

#### `discourse`
```sql
id: BIGINT (Primary Key)
date: DATE
time: TEXT
location: TEXT
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

#### `topics`
```sql
id: BIGINT (Primary Key)
name: TEXT
slug: TEXT (Unique)
created_at: TIMESTAMP
```

---

## Environment Variables

Required `.env.local` variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx

# Cloudflare R2
NEXT_PUBLIC_CLOUDFLARE_R2_URL=https://pub-xxxxx.r2.dev
CLOUDFLARE_R2_BUCKET_NAME=your-bucket-name
CLOUDFLARE_R2_ACCESS_KEY_ID=xxxxx
CLOUDFLARE_R2_SECRET_ACCESS_KEY=xxxxx

# Resend Email
RESEND_API_KEY=xxxxx
ADMIN_EMAIL=admin@example.com

# Admin Credentials (local development)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=xxxxx
```

### Important Notes:
- **Cloudflare R2 URL**: Must be the **public dev URL** (e.g., `https://pub-xxxxx.r2.dev`), NOT the S3 API endpoint
- `.env.local` is used for local development and is **NOT committed to Git** (in `.gitignore`)
- Vercel environment variables must be set in the Vercel dashboard

---

## API Endpoints

### Upload
**POST `/api/upload`**
- Upload audio or image files to Cloudflare R2
- Max file size: 500MB
- Accepts: `multipart/form-data`
- Returns: `{ url: string }`

### Contact Form
**POST `/api/contact`**
- Send contact form submission via Resend email
- Body: `{ name, email, message, subject }`
- Returns: `{ success: boolean }`

### Pages
**GET `/api/pages`**
- Fetch all pages with `show_in_nav: true` for navbar
- Returns: `Page[]`

**GET `/api/pages/[slug]`**
- Fetch single page by slug
- Returns: `Page`

---

## Authentication

### Admin Login Flow
1. Admin navigates to `/admin`
2. Enters email & password (Supabase Auth)
3. Session stored in `localStorage` (via Supabase client)
4. Navbar shows "Logout" button and "Pages" admin link
5. Admin can edit inline on shiur pages and manage custom pages
6. Logout refreshes page and clears session

### Protected Actions
- All admin editing actions verify authentication via `supabase.auth.getSession()`
- Direct API manipulation requires checking admin status in middleware (currently client-side)

---

## Component Details

### Navbar
- **Desktop Layout**: Links (left) | Logo centered (h-16) | Discourse info + Buttons (right)
- **Mobile Layout**: Hamburger menu with logo centered
- **Admin UI**: Shows "Logout" button and "Pages" link when logged in
- **Dynamic Pages**: Fetches custom pages from `/api/pages` for top navigation

### AudioCard
- **Consistent Height**: Image (16:9 aspect ratio, min-h-48), content sections with minimum heights
- **Admin Features**: Show edit button, allow inline editing via parent component

### AudioPlayer
- **Features**: Play/pause, progress scrubbing, duration display, volume control
- **Controls**: Built with HTML5 audio element and custom scrubber

### SearchBar
- **Search**: Full-text search on title/description
- **Filter**: Dropdown to filter by topic tags
- **Layout**: Search field expands to fill available space, filters on right

### DiscourseWidget
- **Display**: Shows date, time, location of next shiur
- **Admin Edit**: Inline editing with save/cancel buttons

---

## Key Technical Decisions

### Architecture
1. **Server Components + Client Components Split**
   - Shiur detail page is a server component that fetches data
   - Detail content is a client component for interactive editing
   - Custom pages are client components with client-side fetching

2. **Flexbox-Only Layout**
   - No CSS Grid (per PRD requirements)
   - All layouts use Flexbox for consistency
   - Works well for responsive design

3. **R2 Upload with AWS SDK v3**
   - Handles S3 Signature Version 4 authentication automatically
   - Replaces manual signing approach (was using `aws4` package)
   - Simplifies header management

4. **Inline Editing**
   - No separate admin dashboard
   - Shiurim edited directly on detail pages
   - Custom pages edited via `/admin/pages` builder

### File Size Limits
- **Vercel**: 500MB body size limit (configured in `next.config.js`)
- **R2**: No hard limit, but recommended max 500MB for practical purposes
- **Client-side validation**: Warns users before uploading large files

### Caching
- Shiur data fetched on demand (not static generation)
- Custom pages cached on client side after fetch
- Search results computed client-side from full list

---

## Deployment

### Vercel Setup
1. Connect GitHub repo to Vercel
2. Set environment variables in Vercel dashboard (don't use `.env.local`)
3. Deploy on push to `main` branch

### Database Migrations
1. Create tables manually in Supabase dashboard
2. Or run SQL migrations: `create_pages_table.sql`, `seed.sql`

### Cloudflare R2 Setup
1. Create R2 bucket
2. Create API token (access key + secret key)
3. Set up public URL in bucket settings
4. Use public URL in `NEXT_PUBLIC_CLOUDFLARE_R2_URL`

### First Deploy Checklist
- [ ] `.env.local` created with all required variables
- [ ] Supabase tables created (run migrations)
- [ ] R2 bucket created with public URL configured
- [ ] Environment variables set in Vercel dashboard
- [ ] Run `npm install && npm run build` locally to verify build
- [ ] Push to GitHub and trigger Vercel deployment

---

## Known Issues & Solutions

### R2 Upload Authorization Error
**Problem**: `<Error><Code>InvalidArgument</Code><Message>Authorization</Message></Error>`

**Solution**: Ensure `NEXT_PUBLIC_CLOUDFLARE_R2_URL` is set to the **public dev URL** (e.g., `https://pub-xxxxx.r2.dev`), NOT the S3 API endpoint. The public URL is required for playback; internal URLs return authorization errors.

### Audio Playback NotSupportedError
**Problem**: Console shows `NotSupportedError: The element has no supported sources`

**Solution**: 
1. Verify the audio URL is publicly accessible
2. Check that the file was successfully uploaded to R2
3. Ensure the URL uses the public R2 domain, not the internal storage endpoint

### Next.js 15 Build Errors
**Problem**: `Type '{ params: { slug: string; }; }' does not satisfy the constraint 'PageProps'`

**Solution**: In Next.js 15, dynamic route `params` are Promises. Make pages `async` and `await` the params:
```typescript
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // ...
}
```

### "use client" Directive Errors
**Problem**: `The "use client" directive must be placed before other expressions`

**Solution**: `'use client'` must be the very first line in the file, before imports. Split files into server/client components if needed.

### Large File Uploads Fail
**Problem**: `413 Content Too Large`

**Solution**: 
1. Increase `api.bodyParser.sizeLimit` in `next.config.js` (set to '500mb')
2. Add client-side file size validation
3. Restart dev server after config changes

### Peer Dependency Conflicts
**Problem**: `npm error ERESOLVE unable to resolve dependency tree`

**Solution**: Add `.npmrc` file with:
```
legacy-peer-deps=true
```

---

## Development Workflow

### Local Development
```bash
npm install
npm run dev
# Visit http://localhost:3000
```

### Building
```bash
npm run build
npm run start
```

### Git Workflow
```bash
git add .
git commit -m "Descriptive message"
git push
# Vercel auto-deploys on push to main
```

---

## Maintenance & Future Enhancements

### Monitoring
- Monitor Vercel deployment logs for errors
- Check Supabase database health regularly
- Review Cloudflare R2 usage and costs

### Potential Improvements
1. Add static generation for popular pages (using `revalidateTag`)
2. Implement search indexing for better performance on large datasets
3. Add audio transcription/captions feature
4. Create RSS feed for shiurim
5. Add user accounts for personalized playlists/favorites
6. Implement advanced analytics

### Security Considerations
- Admin actions currently checked client-side only; should add server-side verification
- Implement rate limiting for API endpoints
- Add input validation on all form submissions
- Consider adding two-factor authentication for admin accounts

---

## Support & Troubleshooting

### Common Issues Checklist
- [ ] Environment variables correctly set?
- [ ] Database tables created in Supabase?
- [ ] R2 bucket exists with public URL?
- [ ] Audio file successfully uploaded to R2?
- [ ] Using public R2 URL, not internal endpoint?
- [ ] Admin session stored in localStorage?
- [ ] Build succeeds locally with `npm run build`?

### Getting Help
1. Check console logs (browser DevTools and terminal)
2. Verify environment variables in `.env.local`
3. Check Supabase dashboard for data integrity
4. Review Vercel deployment logs for build errors
5. Test Cloudflare R2 URL directly in browser

---

## Credits

- **Built with**: Next.js, React, TypeScript, TailwindCSS
- **Hosted on**: Vercel
- **Database**: Supabase (PostgreSQL)
- **Storage**: Cloudflare R2
- **Email**: Resend API
- **Design**: Custom TailwindCSS + Google Fonts (Castoro, Poppins)

---

**Last Updated**: November 17, 2025

For questions or issues, refer to the code comments and component docstrings throughout the project.

