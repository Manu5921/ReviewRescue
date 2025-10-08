# Feature Specification: ReviewRescue AI - Review Response Automation

**Feature Branch**: `main` (MVP)
**Created**: 2025-10-07
**Status**: Ready for Planning
**Constitution**: [.specify/memory/constitution.md](.specify/memory/constitution.md)

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Restaurant Owner Onboarding (Priority: P1)

Marie owns "Bistrot des Halles" in Paris. She spends 2-3 hours every Sunday morning responding to Google reviews manually. She wants to try ReviewRescue AI to reduce this time to 15 minutes per week while maintaining her authentic, friendly tone.

**Why this priority**: This is the activation loop - without successful onboarding, users cannot access any other features. This story delivers immediate value by showing 3 AI-generated sample responses matching the owner's tone within 5 minutes of signup.

**Independent Test**: A restaurant owner can create an account, connect their Google Business Profile (via OAuth or copy-paste mode), configure their restaurant context (menu highlights, tone preference), see 3 sample AI responses, and validate the tone matches their expectations - all in under 5 minutes.

**Acceptance Scenarios**:

1. **Given** a restaurant owner with a Google Business Profile account, **When** they sign up with email and password, **Then** their account is created in under 2 minutes and they receive a welcome email
2. **Given** a new user on the onboarding flow, **When** they click "Connect Google Business Profile", **Then** OAuth flow launches and completes successfully OR fallback to manual Place ID entry if OAuth fails
3. **Given** a user has connected their Google account, **When** they fill out the restaurant context form (name, menu highlights, chef name, operating hours), **Then** all data is saved to their profile
4. **Given** a user has configured their restaurant profile, **When** they select a tone preference (Friendly/Formal/Casual), **Then** the system generates 3 sample responses matching that tone within 5 seconds
5. **Given** a user sees the 3 sample responses, **When** they approve the tone quality, **Then** they proceed to the main dashboard and onboarding is marked complete

---

### User Story 2 - Review Sync & Discovery (Priority: P1)

Marie wants to see all her Google reviews in one place without manually checking the Google Business Profile app multiple times per day. She especially wants to be notified immediately when negative reviews (≤3 stars) arrive so she can respond quickly.

**Why this priority**: Without review sync, there's no data to generate responses for. This is the data foundation layer. Automatic sync every 4 hours ensures fresh data without manual effort.

**Independent Test**: System can fetch reviews from Google Business Profile API every 4 hours, store only new reviews (no duplicates), flag negative reviews prominently in the UI, and send an email notification for reviews ≤3 stars.

**Acceptance Scenarios**:

1. **Given** a restaurant has 50 existing reviews on Google, **When** the sync job runs for the first time, **Then** all 50 reviews are imported to the database with author name, rating, comment, and date
2. **Given** the initial sync is complete, **When** 3 new reviews are posted on Google, **Then** the next sync job (4 hours later) fetches only the 3 new reviews without duplicating existing ones
3. **Given** a new review has a rating of 2 stars, **When** the sync job processes it, **Then** the review is flagged with a red badge in the dashboard and marked as "negative"
4. **Given** a negative review (≤3 stars) is synced, **When** the user logs into the dashboard, **Then** they see a notification badge showing "1 new negative review requires attention"
5. **Given** the sync job encounters a Google API error (rate limit or access revoked), **When** the job fails, **Then** the system logs the error, retries 3 times with exponential backoff, and sends an admin alert if all retries fail

---

### User Story 3 - AI Response Generation with Human Approval (Priority: P1)

Marie wants to click a button next to each review and instantly get a personalized AI-generated response that references specific details from the review (dish name, service experience) while matching her restaurant's friendly tone. She must be able to edit the response before publishing because she values authenticity and legal compliance.

**Why this priority**: This is the core value proposition - AI saves time while human approval maintains quality and trust. The approval queue workflow (non-negotiable per constitution P1: Human-in-the-Loop) ensures no response is published without owner validation.

**Independent Test**: User can click "Generate Response" on any review, receive an AI response within 5 seconds, edit the text directly in the UI, approve or reject the response, and see approved responses move to the publish queue - all without auto-publishing.

**Acceptance Scenarios**:

1. **Given** a review states "The coq au vin was amazing, but service was slow", **When** the user clicks "Generate Response", **Then** the AI generates a 50-150 word response that thanks the customer by name, references the coq au vin specifically, acknowledges the service issue, and invites them back
2. **Given** the restaurant tone is set to "Friendly", **When** AI generates a response, **Then** the text uses casual language like "Hey [Name]! 🙏 Thanks so much..." and avoids formal phrasing like "Dear [Name], We appreciate..."
3. **Given** the restaurant tone is set to "Formal", **When** AI generates a response, **Then** the text uses professional language like "Dear [Name], Thank you for taking the time..." and avoids casual emojis
4. **Given** an AI-generated response appears in the approval queue, **When** the user edits the text (adds a sentence, removes a word), **Then** the changes are auto-saved after 1 second debounce
5. **Given** a response has been edited and approved, **When** the user clicks "Approve", **Then** the response status changes to "approved" and moves to the publish queue with a green checkmark
6. **Given** a response doesn't match expectations, **When** the user clicks "Reject", **Then** a confirmation modal appears, and upon confirmation the response is deleted (user can regenerate a new one)
7. **Given** the Claude API fails (500 error), **When** the generation request is made, **Then** the system retries 3 times, and if all fail, displays an error message "Unable to generate response, please try again in a few minutes"

---

### User Story 4 - Publish Responses (API & Copy-Paste Modes) (Priority: P1)

Marie has approved 5 responses and wants to publish them to Google with 1 click. If Google API access works, responses should post automatically. If API access is revoked (constitution P4: API Independence), she needs a fallback copy-paste mode that still allows her to mark responses as published manually.

**Why this priority**: Without publishing capability, the product is a "response generator" not a "response automation tool". Dual-mode publishing (API Write preferred, Copy-Paste fallback) ensures product remains viable even if Google blocks API access.

**Independent Test**: User can publish approved responses either via automatic API posting (Mode 1) or manual copy-paste workflow (Mode 2), and the system correctly marks responses as published with timestamp in both modes.

**Acceptance Scenarios**:

1. **Given** a user has API Write mode enabled (OAuth completed), **When** they click "Publish" on an approved response, **Then** the system calls Google Business Profile API, posts the response, and marks status as "published" with timestamp
2. **Given** API Write mode successfully publishes a response, **When** the operation completes, **Then** the user sees a green success toast notification "Response published to Google!" and the response shows a green checkmark badge
3. **Given** the Google API returns a 403 Forbidden error (access revoked), **When** the publish request fails, **Then** the system automatically switches to Copy-Paste mode and shows a modal with the response text and "Copy to Clipboard" button
4. **Given** a user is in Copy-Paste mode (API unavailable), **When** they click "Publish" on an approved response, **Then** a modal displays the response text with a "Copy to Clipboard" button and instructions "Open Google Business Profile app, paste this response, then click 'Mark as Published'"
5. **Given** the user has manually pasted the response in Google and clicked "Mark as Published", **When** they confirm in the modal, **Then** the response status changes to "published" with timestamp and the modal closes
6. **Given** a restaurant profile is in Copy-Paste mode, **When** the user views the dashboard, **Then** an orange badge displays "Manual Mode" next to the restaurant name (vs green "API Mode" badge)

---

### User Story 5 - Analytics Dashboard & Problem Detection (Priority: P2)

Marie wants to see trends in her reviews over time - are ratings improving? What are customers complaining about most frequently? She wants a simple dashboard that shows response stats (pending, published this week), problem categorization (food quality, service speed), and rating trends without needing to manually read every review.

**Why this priority**: This delivers intelligence opérationnelle (constitution P3), differentiating ReviewRescue from commodity AI response tools. Problem categorization reveals actionable insights (e.g., "5 mentions of 'cold food' this month" → kitchen issue).

**Independent Test**: Dashboard displays real-time stats (pending responses count, avg response time), automatically categorizes problems from negative reviews using AI, shows rating trends over 3 months, and extracts top keywords mentioned in reviews - all without manual tagging.

**Acceptance Scenarios**:

1. **Given** a restaurant has 3 pending responses, 12 published responses this week, and average response time of 24 hours, **When** the owner loads the dashboard, **Then** these stats are displayed in cards at the top of the page
2. **Given** 5 negative reviews mention "food was cold" and 2 mention "bland taste", **When** the system analyzes negative reviews (≤3 stars), **Then** the dashboard shows "Food Quality: 7 mentions" with breakdown "Cold food (5), Bland taste (2)"
3. **Given** 8 negative reviews mention slow service, **When** problem categorization runs, **Then** "Service Speed: 8 mentions" appears in the Problems section
4. **Given** a restaurant has reviews over the last 3 months, **When** the dashboard loads, **Then** a line chart displays average rating by month (e.g., Jan: 4.2, Feb: 4.4, Mar: 4.6)
5. **Given** reviews contain words like "coq au vin" (10x), "service" (15x), "atmosphere" (8x), **When** keyword extraction runs, **Then** a word cloud or list displays the top 10 most mentioned words (excluding stopwords like "the", "and", "was")
6. **Given** a review mentions "The waitress was rude", **When** AI categorizes the problem, **Then** it's classified as "Staff Behavior" severity "moderate" and stored in the problems table

---

### User Story 6 - Tone Customization (Priority: P2)

Marie initially selected "Friendly" tone during onboarding, but after seeing 10 AI responses, she realizes she wants slightly less casual language (fewer emojis). She wants to adjust her tone preference or upload 3-5 examples of her own past responses so future AI generations match her exact style.

**Why this priority**: Tone personalization is critical for brand consistency and user satisfaction. Default presets (Friendly/Formal/Casual) work for 70% of users, but power users need fine-tuning to feel ownership over responses.

**Independent Test**: User can navigate to Settings → Tone, select a different preset tone OR paste 3-5 custom example responses, save changes, and verify that new AI-generated responses match the updated tone.

**Acceptance Scenarios**:

1. **Given** a user is on Settings → Tone page, **When** they view the page, **Then** they see 3 preset tone options (Friendly, Formal, Casual) each with a sample response example
2. **Given** a user clicks "Formal" tone, **When** they save changes, **Then** the `restaurants.tone` field updates to "formal" and future AI responses use formal language patterns
3. **Given** a user wants custom tone, **When** they click "Custom Examples" and paste 3 example responses into a textarea, **Then** the examples are saved to `restaurants.context.tone_examples` as a JSON array
4. **Given** custom tone examples are saved, **When** AI generates a new response, **Then** the Claude API prompt includes the custom examples as few-shot learning samples
5. **Given** a user switches from "Friendly" to "Formal" tone, **When** they regenerate a previously generated response, **Then** the new response uses formal language instead of friendly language

---

### User Story 7 - Email Magic Link Authentication (Priority: P3)

Marie wants to log in quickly from her phone without typing a password. She wants to enter her email address, receive a magic link, click the link, and be logged in automatically - similar to Notion or Slack.

**Why this priority**: Improves mobile UX (critical for on-the-go restaurant owners) and reduces password reset support tickets. Lower priority than P1-P2 because email/password auth already works for MVP.

**Independent Test**: User can request a magic link by entering their email, receive the link via email within 30 seconds, click the link on any device, and be logged in without entering a password.

**Acceptance Scenarios**:

1. **Given** a user on the login page, **When** they enter their email and click "Send Magic Link", **Then** a magic link is sent to their email within 30 seconds
2. **Given** a user receives the magic link email, **When** they click the link, **Then** they are redirected to the app dashboard and logged in automatically (session created)
3. **Given** a magic link is 10 minutes old, **When** the user clicks it, **Then** an error message displays "This link has expired, please request a new one"
4. **Given** a user clicks a magic link that was already used, **When** they try to use it again, **Then** an error message displays "This link has already been used"

---

### Edge Cases

- **What happens when Google API rate limit is reached (429 error)?** System waits 60 seconds and retries. If rate limit persists after 3 retries, fallback to Copy-Paste mode for that restaurant until rate limit resets.
- **What happens when a restaurant has 0 reviews?** Dashboard displays "No reviews yet" message with instructions to encourage customers to leave reviews (e.g., QR code generator).
- **What happens when a user connects the wrong Google Business Profile?** Settings page allows disconnecting and reconnecting a different account (requires re-OAuth).
- **What happens when AI generates a response in the wrong language?** System detects review language via Google API metadata (`review.language`) and passes language code to Claude API prompt to ensure response matches.
- **What happens when a restaurant changes ownership mid-subscription?** New owner must create a new account and reconnect Google Business Profile (data is not transferable for privacy/legal reasons).
- **What happens when a review is deleted on Google after being synced?** Next sync job detects deletion (review no longer exists in API response) and soft-deletes the review in our database (marks as deleted, doesn't remove from DB for audit trail).

---

## Requirements *(mandatory)*

### Functional Requirements

**Authentication & Onboarding**
- **FR-001**: System MUST allow users to create accounts via email/password authentication
- **FR-002**: System MUST allow users to log in via magic link (passwordless) sent to their email
- **FR-003**: System MUST validate email addresses using standard regex pattern (RFC 5322 compliant)
- **FR-004**: System MUST connect to Google Business Profile via OAuth 2.0 flow
- **FR-005**: System MUST provide fallback manual entry mode for Google Place ID if OAuth fails
- **FR-006**: Users MUST be able to configure restaurant context (name, address, menu highlights, chef name, operating hours, tone preference)
- **FR-007**: System MUST generate 3 sample AI responses during onboarding to validate tone quality

**Review Sync**
- **FR-008**: System MUST sync reviews from Google Business Profile API every 4 hours via cron job
- **FR-009**: System MUST store reviews with fields: google_review_id (unique), author_name, rating, comment, created_at, synced_at
- **FR-010**: System MUST detect and skip duplicate reviews using google_review_id uniqueness constraint
- **FR-011**: System MUST flag reviews with rating ≤3 stars as "negative" with visual indicator (red badge)
- **FR-012**: System MUST handle pagination when Google API returns >50 reviews (iterate until all reviews fetched)
- **FR-013**: System MUST retry failed sync jobs 3 times with exponential backoff (1s, 2s, 4s) before alerting admin

**AI Response Generation**
- **FR-014**: System MUST generate personalized responses using Claude 3.5 Sonnet API within 5 seconds
- **FR-015**: AI responses MUST be 50-150 words in length
- **FR-016**: AI responses MUST reference specific details from review (dish names, service mentions, customer name)
- **FR-017**: AI responses MUST match selected tone (Friendly/Formal/Casual) based on restaurant tone preference
- **FR-018**: System MUST include restaurant context in AI prompt (menu highlights, chef name, hours, tone examples)
- **FR-019**: System MUST detect review language from Google API metadata and generate response in same language
- **FR-020**: System MUST handle Claude API failures with 3 retry attempts before displaying error message to user

**Human-in-the-Loop Approval Queue**
- **FR-021**: System MUST store generated responses in "pending" status by default (no auto-publish)
- **FR-022**: Users MUST be able to edit response text directly in UI with auto-save after 1 second debounce
- **FR-023**: Users MUST be able to approve responses (changes status to "approved", moves to publish queue)
- **FR-024**: Users MUST be able to reject responses (displays confirmation modal, deletes response upon confirmation)
- **FR-025**: System MUST allow filtering responses by status (All/Pending/Approved/Published/Rejected)
- **FR-026**: System MUST display review context alongside response (author name, rating, comment, date) in approval queue UI

**Dual-Mode Publishing**
- **FR-027**: System MUST publish approved responses to Google via API Write mode (Google Business Profile API) if OAuth access is valid
- **FR-028**: System MUST display success toast notification upon successful API publish
- **FR-029**: System MUST automatically fallback to Copy-Paste mode if Google API returns 403 Forbidden error (access revoked)
- **FR-030**: System MUST display Copy-Paste modal with response text and "Copy to Clipboard" button in Copy-Paste mode
- **FR-031**: Users MUST be able to mark responses as "published" manually after pasting in Google app (Copy-Paste mode)
- **FR-032**: System MUST display mode indicator badge (green "API Mode" or orange "Manual Mode") in dashboard

**Analytics Dashboard**
- **FR-033**: Dashboard MUST display real-time response stats (pending count, published this week, avg response time)
- **FR-034**: System MUST categorize problems from negative reviews (≤3 stars) using AI classification
- **FR-035**: Problem categories MUST include: food_cold, slow_service, rude_staff, pricing, noise, other
- **FR-036**: Dashboard MUST display problem breakdown with mention counts (e.g., "Food Quality: 7 mentions (Cold food: 5, Bland taste: 2)")
- **FR-037**: Dashboard MUST display rating trends over last 3 months as line chart (average rating per month)
- **FR-038**: System MUST extract top 10 keywords from reviews (excluding stopwords) and display as list or word cloud

**Tone Customization**
- **FR-039**: Users MUST be able to select preset tone (Friendly/Formal/Casual) from Settings page
- **FR-040**: Users MUST be able to provide 3-5 custom response examples via textarea for fine-tuned tone matching
- **FR-041**: System MUST store custom tone examples in restaurants.context.tone_examples field (JSONB array)
- **FR-042**: System MUST include custom tone examples in Claude API prompt as few-shot learning samples
- **FR-043**: System MUST update tone preference immediately upon save (affects all future response generations)

**Data & Security**
- **FR-044**: System MUST enforce Row Level Security (RLS) on all Supabase tables (users can only access their own data)
- **FR-045**: System MUST store API keys (Claude, Google OAuth credentials) in Vercel environment variables (never in code)
- **FR-046**: System MUST enforce HTTPS for all connections (Vercel default)
- **FR-047**: System MUST implement rate limiting (10 requests/min per user) to prevent abuse
- **FR-048**: System MUST soft-delete reviews when deleted on Google (mark deleted=true, retain for audit trail)

---

### Key Entities

**Accounts** (managed by Supabase Auth)
- Represents authenticated users (restaurant owners)
- Attributes: id (UUID), email, created_at
- Relationships: 1 Account → N Restaurants

**Restaurants**
- Represents a single restaurant location (MVP: 1 restaurant per account, multi-location in Phase 2)
- Attributes: id, account_id (FK), name, google_place_id, google_account_email, address, tone (friendly/formal/casual), context (JSONB: menu_highlights, chef_name, hours, tone_examples), api_mode (api_write/copy_paste), created_at
- Relationships: N Reviews, 1 Account

**Reviews**
- Represents Google Business Profile reviews synced from API
- Attributes: id, restaurant_id (FK), google_review_id (unique), author_name, rating (1-5), comment, created_at (Google timestamp), synced_at (our sync job timestamp)
- Relationships: 1 Restaurant, 1-N Responses, 0-N Problems

**Responses**
- Represents AI-generated responses pending approval or published
- Attributes: id, review_id (FK), generated_text, edited_text (nullable), status (pending/approved/published/rejected), published_at (nullable), created_at
- Relationships: 1 Review

**Problems**
- Represents automatically categorized issues from negative reviews (operational intelligence)
- Attributes: id, review_id (FK), category (food_cold/slow_service/rude_staff/pricing/noise/other), severity (minor/moderate/critical), auto_detected (boolean), created_at
- Relationships: 1 Review

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

**Activation & Onboarding**
- **SC-001**: Users can complete account creation and onboarding (connect Google, configure context, see 3 sample responses) in under 5 minutes
- **SC-002**: 80% of users who start onboarding complete all steps (no drop-off)
- **SC-003**: 90% of users successfully connect Google Business Profile (OAuth or manual mode) on first attempt

**Engagement & Retention**
- **SC-004**: Users log in at least 2 times per week during trial period (14 days)
- **SC-005**: Users approve and publish at least 5 responses per week on average
- **SC-006**: Average session duration is 10-15 minutes (time spent in approval queue)
- **SC-007**: Week 4 retention rate is ≥60% (users still active after trial ends)

**Response Quality**
- **SC-008**: Users edit AI-generated responses in <30% of cases (indicates high AI quality)
- **SC-009**: Users reject AI-generated responses in <10% of cases (indicates tone matching works)
- **SC-010**: 90% of generated responses reference specific review details (dish names, service mentions) verified by manual sampling

**Time Savings & ROI**
- **SC-011**: Users report saving 2-4 hours per week responding to reviews (validated via post-trial survey)
- **SC-012**: Average time from review arrival to published response is <24 hours (vs industry avg 3-5 days)
- **SC-013**: ROI calculation: 400€ labor saved per month vs 69€ subscription = 5.8x return

**Technical Reliability**
- **SC-014**: System uptime is ≥99% (Vercel SLA)
- **SC-015**: AI response generation completes within 5 seconds in 95% of cases
- **SC-016**: Google API sync success rate is ≥95% (excluding rate limits outside our control)
- **SC-017**: Zero data loss incidents (all responses, reviews, and user data persisted reliably)

**Business Metrics (6 months post-launch)**
- **SC-018**: 50 paying customers at 69€/month = 3,450€ MRR
- **SC-019**: Monthly churn rate <5% (indicates product-market fit)
- **SC-020**: Net Promoter Score (NPS) ≥50 (more promoters than detractors)
- **SC-021**: Support tickets <2 per customer per month (product is intuitive)

**Intelligence Opérationnelle (Dashboard Usage)**
- **SC-022**: 70% of users view analytics dashboard at least once per week
- **SC-023**: Problem categorization accuracy ≥85% (validated by manual review of AI classifications)
- **SC-024**: Users who view dashboard report finding at least 1 actionable insight per month (survey question)

---

## Assumptions

1. **Google API Stability**: We assume Google Business Profile API will remain available with current pricing (free tier: 1,500 requests/day per project). If Google restricts access or introduces pricing, we will pivot to Copy-Paste mode as primary workflow.

2. **Claude API Pricing**: We assume Claude 3.5 Sonnet pricing remains stable (~$3 per million input tokens, $15 per million output tokens). With avg 500 tokens input + 150 tokens output per response, cost per response ≈ $0.003. At 30 responses/month per restaurant, AI cost = $0.09/month per customer (sustainable at 69€ pricing).

3. **Review Volume**: We assume average restaurant receives 20-40 Google reviews per month. Restaurants with >100 reviews/month may hit rate limits (requires upgrade to higher Google API quota or staggered sync).

4. **Language Support**: MVP assumes French language (restaurant owners + reviews). Multi-language support (English, Spanish, Italian) deferred to Phase 2 based on user requests.

5. **Single Location**: MVP assumes 1 restaurant per account. Multi-location support (chains with 3-10 locations) deferred to Phase 2 (6 months post-launch).

6. **Mobile Usage**: We assume 40% of users will access dashboard via mobile (iPhone/Android browsers). Responsive design mandatory (Tailwind CSS breakpoints), but native mobile app deferred to Phase 3.

7. **Payment Processing**: We assume Stripe Checkout integration for subscription billing. 14-day free trial requires no credit card (to reduce friction). Stripe handles PCI compliance, recurring billing, invoice generation.

8. **Legal Compliance**: We assume RGPD compliance via standard Terms of Service + Privacy Policy (template from Supabase/Vercel best practices). AI disclosure: "Response generated by AI, reviewed by owner" added as footer to each published response.

9. **User Technical Skills**: We assume restaurant owners have basic tech skills (can use email, Google Business Profile app, copy-paste text). No coding knowledge required.

10. **Review Sync Frequency**: We assume 4-hour sync interval is sufficient (reviews arrive gradually, not real-time). Real-time sync via Google Pub/Sub webhooks deferred to Phase 2 (requires webhook endpoint + verification).

---

## Dependencies

**External Services:**
- Google Business Profile API (OAuth 2.0 + REST API)
- Claude 3.5 Sonnet API (Anthropic)
- Supabase (PostgreSQL database + Auth + Row Level Security)
- Vercel (Next.js hosting + Serverless Functions + Cron Jobs)
- Stripe (payment processing, post-MVP)

**Technical Prerequisites:**
- Node.js 18+ runtime
- Next.js 14 (App Router)
- TypeScript (strict mode)
- Tailwind CSS + shadcn/ui components

**Compliance Requirements:**
- RGPD compliance (Terms of Service + Privacy Policy)
- AI transparency disclosure (footer in responses)

---

## Out of Scope (Explicit Exclusions)

**MVP Exclusions:**
1. Multi-platform support (Tripadvisor, Yelp, Facebook reviews) - Phase 2
2. Auto-publish mode (bypass approval queue) - Never (violates constitution P1)
3. Multi-location dashboard - Phase 2 (6 months post-launch)
4. Proactive social media posts from 5-star reviews - Phase 2
5. Competitor benchmarking - Phase 2
6. Real-time review sync (webhooks) - Phase 2
7. Native mobile app - Phase 3
8. White-label/agency reselling - Phase 3
9. Zapier/Make integration - Phase 3
10. Sentiment analysis beyond 1-5 star rating - Phase 2

**Rationale:** MVP focuses on core value loop (sync → generate → approve → publish) with mandatory human approval for French restaurants on Google Reviews only. Additional features added based on user feedback and market demand post-launch.

---

## Constitution Compliance Check

This specification adheres to the project constitution principles:

- ✅ **P1: Human-in-the-Loop (NON-NEGOTIABLE)** - FR-021: Default status is "pending", no auto-publish. Approval queue mandatory.
- ✅ **P2: Niche-First Strategy** - Scope limited to restaurants only (not hotels). Google Reviews only (not multi-platform).
- ✅ **P3: Intelligence Opérationnelle > Communication** - FR-033 to FR-038: Dashboard with problem categorization, trends, insights (not just response generation).
- ✅ **P4: API Independence (Plan B Obligatory)** - FR-027 to FR-032: Dual-mode publishing (API Write preferred, Copy-Paste fallback if API blocked).
- ✅ **P5: Proactif > Défensif** - Analytics dashboard (P2 priority) enables proactive problem detection vs reactive response-only mindset.

---

**Specification Status**: ✅ COMPLETE - Ready for `/speckit.plan`

**Next Steps**:
1. Run `/speckit.plan` to generate technical architecture plan
2. Run `/speckit.tasks` to break down into actionable tasks (T001-T078)
3. Validate Google Business Profile API access (create GCP project, enable APIs)
4. Run `/speckit.implement` to begin development

**Estimated MVP Timeline**: 3-4 weeks (hybrid workflow, 3-4h/day)

---

*This specification is technology-agnostic and focuses on user value. Implementation details (API contracts, database schemas, UI mockups) will be defined in the plan phase.*
