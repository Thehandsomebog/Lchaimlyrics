# L'Chaim Lyrics - Project TODO

## Phase 1: Website Development

### Setup
- [x] Create GitHub repository
- [x] Configure DNS (Squarespace → GitHub Pages)
- [x] Set up folder structure
- [x] Copy logo to assets

### HTML/CSS Development
- [ ] Create index.html with all sections
- [ ] Create CSS with brand styling (Navy #0A2463, Gold #D4AF37, Cream #FDFBF7)
- [ ] Add Google Fonts (Playfair Display, Lato)
- [ ] Build Hero section
- [ ] Build "Listen" section with audio player cards
- [ ] Build "How It Works" section with icons
- [ ] Build Pricing section (3 tiers: $99, $189, $299)
- [ ] Build Footer
- [ ] Add responsive design (mobile-friendly)
- [ ] Add smooth scroll behavior
- [ ] Create custom audio player styling

### Assets
- [ ] Add sample audio files to assets/audio/
- [ ] Optimize logo for web (if needed)
- [ ] Create favicon from logo

---

## Phase 2: External Services

### Stripe Setup
- [ ] Create Stripe account
- [ ] Add 3 products:
  - Essential ($99)
  - Simcha Special ($189)
  - L'Dor V'Dor ($299)
- [ ] Create Payment Links for each product
- [ ] Configure redirect to Tally form after payment

### Tally Form Setup
- [ ] Create Tally account
- [ ] Design intake form with brand colors
- [ ] Add questions:
  - Event type (Wedding, Bar/Bat Mitzvah, Birthday, Anniversary, Other)
  - Names of honorees
  - Event date
  - Story/memories to include
  - Music style preference
  - Any specific phrases or inside jokes
  - Delivery email
- [ ] Set up hidden fields for Stripe data passthrough
- [ ] Test form submission

---

## Phase 3: Automation (Make.com)

### Make.com Workflow
- [ ] Create Make.com account
- [ ] Set up Tally webhook trigger
- [ ] Create Scenario 1: Send notification email to owner
  - Subject: NEW ORDER - [Client Name] - [Package]
  - Body: All form responses
- [ ] Create Scenario 2: Send confirmation email to client
  - Subject: Mazel Tov! We've received your story.
  - Body: Confirmation + expected delivery date
- [ ] Test full workflow end-to-end

---

## Phase 4: Testing & Launch

### Pre-Launch Checklist
- [ ] Test all links (Stripe payment links)
- [ ] Test form submission → email flow
- [ ] Test on mobile devices
- [ ] Test audio players work correctly
- [ ] Verify HTTPS is enabled on domain
- [ ] Check page load speed
- [ ] Test smooth scrolling

### Launch
- [ ] Push final code to GitHub
- [ ] Verify site is live at lchaimlyrics.com
- [ ] Do a test purchase (refund yourself)
- [ ] Announce launch!

---

## Future Enhancements (Post-Launch)
- [ ] Add testimonials section
- [ ] Add FAQ section
- [ ] Add more sample songs
- [ ] Consider adding a blog
- [ ] SEO optimization
- [ ] Add Google Analytics
