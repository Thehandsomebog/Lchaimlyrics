# L'Chaim Lyrics - Agent Instructions

## Project Type
Static website for a custom song creation business targeting Jewish celebrations.

## Primary Tasks

### When editing HTML/CSS:
- Maintain the brand color palette strictly:
  - Primary: #0A2463 (Deep Navy Blue)
  - Accent: #D4AF37 (Champagne Gold)
  - Background: #FDFBF7 (Off-White/Cream)
- Use Playfair Display for headings, Lato for body text
- Keep the design premium, clean, and celebration-focused
- Ensure all changes are mobile-responsive
- Maintain semantic HTML structure

### When adding content:
- Tone should be warm, celebratory, and professional
- Use Jewish celebration terminology appropriately (Simcha, Mazel Tov, L'Dor V'Dor)
- Keep copy concise and action-oriented

### When working with JavaScript:
- Keep it minimal - vanilla JS only, no frameworks
- Primary JS functionality is the custom audio player
- Ensure accessibility (keyboard navigation, ARIA labels)

## File Locations
- Main page: `index.html`
- Styles: `css/styles.css`
- Scripts: `js/main.js`
- Logo: `assets/images/logo.png`
- Audio samples: `assets/audio/` (MP3 format)

## Testing Checklist
Before committing changes:
1. Check all sections render correctly
2. Test audio player functionality
3. Verify responsive design on mobile widths
4. Confirm all links work (or are placeholder-marked)
5. Validate smooth scroll behavior

## External Services (Reference Only)
- Stripe: Payment processing (links added to Purchase buttons)
- Tally: Intake form (embedded or linked post-payment)
- Make.com: Email automation (webhook from Tally)

## Do Not:
- Add external JavaScript frameworks (React, Vue, etc.)
- Change the color palette without explicit instruction
- Remove or significantly alter the logo
- Add tracking scripts without permission
