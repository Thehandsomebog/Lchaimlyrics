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

- Public CTAs and pricing cards route directly to the Tally song brief
- Package buttons pass `plan` and `package` URL parameters to Tally when applicable
- Tally handles the pre-payment song brief and package choice, then redirects to Stripe checkout; Make.com handles email automation via Tally webhooks

## Learned Rules (Don't Repeat These Mistakes)

- Never remove Google Analytics tracking (G-ND48VMKB6V) when editing HTML pages
- Always include `loading="lazy"` on images below the fold
- Stripe Payment Links must never be modified without explicit approval
- All new pages need: meta description, OG tags, canonical URL, structured data (JSON-LD)
- Keep the same nav structure across all pages (Listen, How It Works, Pricing, Blog)
- Footer must include all celebration type links (Weddings, Bar Mitzvahs, Bat Mitzvahs, Anniversaries, Birthdays, Engagements, Henna Parties)
- Copyright year in footer is 2025
- Use Jewish terminology consistently: Simcha, Mazel Tov, L'Dor V'Dor, Chuppah
- Testimonials on site are real — don't fabricate new ones without approval
- Price tiers are $199 / $289 / $389 — don't change without explicit approval

## Notes Directory

Project notes are maintained in `.claude/notes/` for context that persists across sessions. Update notes after completing significant work.
