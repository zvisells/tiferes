# Logo Setup Guide

## Current Logo Status
The site currently uses a **text-based logo** ("Tiferes L'Moshe") in the navbar, which works perfectly fine.

## Adding an Image Logo

The `logo.pdf` file in the `/content` folder cannot be directly used as an HTML `<img>` tag because PDFs are not image formats.

### To add an image logo:

1. **Convert the PDF to an image format:**
   - Use an online converter or design tool to convert `logo.pdf` to:
     - `.png` (recommended - supports transparency)
     - `.svg` (vector format - scales perfectly)
     - `.jpg` (smaller file size)

2. **Place the converted file in `/public`:**
   - Example: `/public/logo.png`

3. **Update the navbar** (`src/components/Navbar.tsx`):
   ```jsx
   <Link href="/" className="flex flex-row items-center gap-2">
     <img 
       src="/logo.png" 
       alt="Tiferes L'Moshe Logo"
       className="h-10 w-auto"
     />
     <span className="text-white hidden sm:inline">Tiferes L'Moshe</span>
   </Link>
   ```

## Current Solution
The text logo is clean, professional, and accessible. No action needed unless you specifically want an image logo.

