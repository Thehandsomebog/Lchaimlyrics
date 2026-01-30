# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static website for L'Chaim Lyrics, a custom song creation business for Jewish celebrations. Hosted on GitHub Pages at lchaimlyrics.com.

## Tech Stack

- **Code**: Plain HTML5, CSS3, Vanilla JavaScript (no frameworks)
- **Hosting**: GitHub Pages
- **Payments**: Stripe Payment Links
- **Forms**: Tally.so

## Development Commands

No build process required. To develop locally:
```bash
# Using Python
python -m http.server 8000

# Using Node
npx serve
```

Then open `http://localhost:8000`

## Architecture

- `index.html` - Main homepage
- `custom-wedding-song.html`, `bar-mitzvah-song.html`, `bat-mitzvah-song.html` - SEO landing pages
- `css/styles.css` - All styling using CSS custom properties
- `js/main.js` - Audio player functionality and smooth scroll

### CSS Variables (in `:root`)
| Variable | Value | Purpose |
|----------|-------|---------|
| `--color-primary` | #0A2463 | Deep Navy Blue - headings, trust |
| `--color-accent` | #D4AF37 | Champagne Gold - CTAs, celebration |
| `--color-background` | #FDFBF7 | Off-White/Cream - premium feel |
| `--font-heading` | Playfair Display | Elegant, invitation-like |
| `--font-body` | Lato | Clean, readable |

### Audio Player (`js/main.js`)
Custom audio player with:
- Play/pause toggle with SVG icons
- Progress bar with click-to-seek
- Time display formatting
- Single audio playing at a time (pauses others)

## Coding Guidelines

- Maintain vanilla JS - no React, Vue, or other frameworks
- Use the CSS custom properties for all colors/fonts
- Ensure mobile responsiveness (breakpoints at 768px and 480px)
- Keep tone warm and celebratory; use Jewish terminology (Simcha, Mazel Tov, L'Dor V'Dor)

## External Service Integration

- Stripe Payment Links are embedded in pricing cards (href on Purchase buttons)
- Stripe redirects to Tally form after payment
- Make.com handles email automation via Tally webhooks
