# Tiferes L'Moshe - Audio Discourse Archive

A modern, fast, searchable database of audio shiurim (discourses) with admin upload capabilities, timestamped topics, and a clean, accessible interface.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account and API credentials
- Cloudflare R2 account (for file storage)
- Resend API key (for email)

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env.local` file with the following:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # Cloudflare R2
   NEXT_PUBLIC_CLOUDFLARE_R2_URL=your_r2_public_url
   CLOUDFLARE_ACCOUNT_ID=your_account_id
   CLOUDFLARE_ACCESS_KEY_ID=your_access_key
   CLOUDFLARE_SECRET_ACCESS_KEY=your_secret_key
   CLOUDFLARE_BUCKET_NAME=your_bucket_name

   # Resend Email
   RESEND_API_KEY=your_resend_api_key

   # Admin Email
   NEXT_PUBLIC_ADMIN_EMAIL=admin@tifereslmoshe.org
   ```

3. **Seed the database:**
   - Copy the SQL from `seed.sql`
   - Run it in your Supabase SQL editor
   - This will create the tables and insert sample data

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Homepage
│   ├── shiur/[slug]/page.tsx # Shiur detail page
│   ├── about/page.tsx        # About page
│   ├── contact/page.tsx      # Contact form
│   ├── donate/page.tsx       # Donation page
│   ├── book/page.tsx         # Book sales page
│   ├── admin/
│   │   ├── page.tsx          # Admin login
│   │   └── dashboard/page.tsx # Admin dashboard
│   ├── api/
│   │   ├── contact/route.ts  # Contact form endpoint
│   │   └── upload/route.ts   # File upload endpoint
│   └── layout.tsx            # Root layout
├── components/
│   ├── Navbar.tsx            # Navigation bar
│   ├── SearchBar.tsx         # Search & filter bar
│   ├── AudioCard.tsx         # Shiur card component
│   ├── AudioPlayer.tsx       # Audio player
│   ├── TimestampsList.tsx    # Timestamps & topics
│   ├── DiscourseWidget.tsx   # Next discourse info
│   └── AdminForm.tsx         # Upload form
├── lib/
│   ├── types.ts              # TypeScript interfaces
│   ├── supabaseClient.ts     # Supabase initialization
│   ├── cloudflareUpload.ts   # File upload utility
│   ├── resendEmail.ts        # Email utility
│   └── auth.ts               # Authentication
└── styles/
    └── globals.css           # Global styles & CSS variables
```

## 🎨 Design System

The project uses TailwindCSS with global CSS variables for theming:

```css
:root {
  --color-bg: #ffffff;
  --color-text: #000000;
  --color-accent: #001f3f; /* deep navy */
  --color-hover: rgba(0, 0, 0, 0.08);
  --font-main: 'Inter', sans-serif;
}
```

All layouts use **Flexbox** exclusively. No CSS Grid is used.

## 🔑 Key Features

- **🔍 Full-Text Search** - Search across titles, descriptions, tags, and topics
- **🎙️ Audio Player** - Built-in player with timestamp navigation
- **⏱️ Timestamped Topics** - Jump to specific sections within discourses
- **👤 Admin Panel** - Upload and manage shiurim with ease
- **📱 Responsive Design** - Mobile-first, works on all devices
- **🔐 Secure Authentication** - Email/password auth via Supabase
- **📧 Contact Forms** - Email integration via Resend API
- **☁️ Cloud Storage** - Files stored in Cloudflare R2

## 🚢 Deployment to Vercel

1. Push your code to GitHub
2. Connect your repo to Vercel
3. Add environment variables in Vercel settings
4. Deploy!

```bash
git push origin main
```

Vercel will automatically build and deploy.

## 📝 Database Schema

### shiurim
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| slug | text | URL slug |
| title | text | Discourse title |
| description | text | Full description |
| tags | text[] | Search/filter tags |
| image_url | text | Cover image |
| audio_url | text | MP3 URL from Cloudflare |
| timestamps | jsonb | Array of `{topic, time}` |
| allow_download | boolean | Enable download button |
| transcript | text | Optional transcript |
| created_at | timestamptz | Creation timestamp |

### discourse_schedule
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| weekday | text | E.g., "Monday" |
| time | text | E.g., "8:00 PM" |
| location | text | Location info |
| next_occurrence | timestamptz | Next scheduled date |

## 🔗 API Endpoints

### POST `/api/contact`
Send a contact form email
```json
{
  "name": "string",
  "email": "string",
  "message": "string"
}
```

### POST `/api/upload`
Upload a file to Cloudflare R2
```
Form Data:
- file: File
- fileType: "audio" | "image"
```

## 🎯 Development Tips

- **Add new shiurim:** Use the admin dashboard at `/admin`
- **Customize colors:** Edit `src/styles/globals.css`
- **Add components:** Follow the existing pattern in `src/components/`
- **Update database schema:** Use Supabase SQL editor

## 📞 Support

For issues or questions, please contact the development team.

## 📄 License

All rights reserved © 2024 Tiferes L'Moshe

