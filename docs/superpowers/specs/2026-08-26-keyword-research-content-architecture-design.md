# Keyword Research and Content Architecture Design

**Goal:** Grow qualified organic visibility for Sorouh’s real contracting services in the Eastern Province without creating duplicate, doorway, or unsupported service pages.

## Decision

Use Google Ads Keyword Planner data, not a fixed service list, to decide which existing pages are improved and which narrowly scoped service-by-city pages are created. A page exists only when all three conditions are true:

1. The company already offers the service.
2. The phrase has measurable demand in the Eastern Province research set.
3. Its search intent is distinct from the page that would otherwise own it.

Every target has exactly one canonical owner URL. Existing owners are upgraded; no duplicate URL is created solely because a city or wording variant exists.

## Research Method

- Source: Google Ads API KeywordPlanIdeaService using the client’s active contracting account.
- Date: 2026-08-26.
- Language: Arabic (`languageConstants/1019`).
- Primary geography: Eastern Province, Saudi Arabia (`geoTargetConstants/20989`).
- City validation: Dammam (`9051475`) and Al Khobar (`9051476`) plus a service-by-city historical-metrics scan for Dammam, Khobar, Dhahran, Qatif, Jubail, Al Ahsa, Saihat, Ras Tanura, and Abqaiq.
- Network: Google Search. Values are Google’s historical average monthly searches, not forecasts or guaranteed traffic.

The scan covered 126 service-by-city phrases. Forty-nine had non-zero measured demand. Zero-demand combinations are not content targets at this stage.

## Confirmed Service Inventory

The site already publishes core pages for: general contracting, building contractor, home and villa renovation, finishes, painting, gypsum board, tile and porcelain installation, plumbing, electrical work, plastering, annex construction, demolition, concrete cutting, core drilling, helicopter screed/levelling, roof insulation, and water-leak detection and treatment.

The expansion must stay within this inventory unless the owner explicitly confirms a new operational service.

## Demand Findings

### Province-wide commercial clusters

| Cluster | Representative phrase | Avg. monthly searches | Direction |
|---|---:|---:|---|
| General contracting | شركة مقاولات | 2,900 | Strengthen existing hub |
| Renovation | مقاول ترميم | 2,900 | Strengthen existing hub and local owners |
| Painting | صباغ | 3,600 | Strengthen service hub and local owners |
| Roof insulation | عزل اسطح | 5,400 | Strengthen existing hub and Dammam owner |
| Leak detection | كشف تسربات المياه | 2,400 | Strengthen existing hub and Dammam owner |
| Gypsum board | جبس بورد | 2,400 | Strengthen existing hub and Dammam owner |
| Tile installation | تركيب سيراميك | 590 | Strengthen existing hub; selective local owner |
| Home electrician | كهربائي منازل | 480 | Strengthen existing hub and Dammam owner |
| Annex construction | بناء ملاحق | 390 | Strengthen existing hub and local owners |
| Demolition contractor | مقاول هدم | 320 | Strengthen existing hub and Dammam owner |

Broad phrases such as `للمقاولات`, company-profile queries, equipment, material sales, jobs, supplier searches, and outdated decorative-image searches are excluded even when their search volume is large. They do not represent Sorouh’s desired lead intent.

### Highest-priority local clusters

| Cluster | Valid phrase | Avg. monthly searches | Existing-page action |
|---|---|---:|---|
| Painting, Dammam | صباغ الدمام | 3,600 | Improve existing local owner |
| Insulation, Dammam | عزل اسطح الدمام | 2,400 | Create one dedicated local owner |
| Renovation, Dammam | مقاول ترميم الدمام | 1,600 | Improve existing local owner |
| Plumbing, Dammam | سباك بالدمام | 1,900 | Create one dedicated local owner |
| Electrical, Dammam | كهربائي منازل بالدمام | 1,300 | Create one dedicated local owner |
| Painting, Khobar | صباغ الخبر | 880 | Create one dedicated local owner |
| Painting, Al Ahsa | صباغ الاحساء | 880 | Create one dedicated local owner |
| Renovation, Khobar | مقاول ترميم الخبر | 590 | Improve existing local owner |
| Gypsum board, Dammam | جبس بورد الدمام | 590 | Create one dedicated local owner |
| Annex construction, Dammam | بناء ملاحق الدمام | 480 | Improve existing local owner |
| Painting, Jubail | صباغ الجبيل | 390 | Create one dedicated local owner |
| Demolition, Dammam | مقاول هدم بالدمام | 390 | Create one dedicated local owner |
| Plumbing, Khobar | سباك الخبر | 320 | Create one dedicated local owner |
| Painting, Qatif | صباغ القطيف | 320 | Create one dedicated local owner |
| Building contractor, Dammam | مقاول بناء الدمام | 320 | Create one dedicated local owner |

### Selective second wave

These terms have demand but follow the high-priority set: painting in Dhahran and Saihat; plumbing in Al Ahsa, Jubail, Qatif, Saihat, and Dhahran; electrical work in Jubail, Al Ahsa, Qatif, Saihat, and Khobar; building contractor in Khobar; gypsum board in Al Ahsa, Khobar, Jubail, and Qatif; tile installation in Dammam; concrete cutting in Dammam; and leak detection in Dammam.

Abqaiq and Ras Tanura stay covered by the existing service-area pages and core service pages until a new measured commercial query justifies a dedicated owner page.

## Page Ownership Model

### Layer 1: Core commercial service pages

Existing service hubs own non-city commercial queries and all close variants that do not need a geographic landing page. Each hub must answer the buyer’s scope, suitable project types, workflow, dependencies with adjacent trades, quality checks, and next contact action.

Examples:

- `/الخدمات/ترميم-منازل-وفلل/` owns `مقاول ترميم`, `ترميم منازل`, and `ترميم وتشطيب`.
- `/الخدمات/دهانات-داخلية-وخارجية/` owns `صباغ`, `دهانات منازل`, and `معلم دهان`.
- `/الخدمات/عزل-الاسطح/` owns `عزل اسطح`, `عزل مائي`, and `عزل حراري`.
- `/الخدمات/كشف-ومعالجة-تسربات-المياه/` owns leak-detection and treatment variants.

### Layer 2: Verified local commercial pages

A local page owns one service and one city. It must contain city-specific execution context—not just a city word in the heading—and link back to its core service hub and the city’s service-area hub. It must not compete with a different local page for the same primary phrase.

The first implementation wave is Dammam-led, then Khobar, Al Ahsa, Jubail, and Qatif according to the table above.

### Layer 3: Decision-support guides

Create only guides that solve a pre-contact decision and link to one or more service owners. Initial guide candidates:

- Scope and cost drivers for a full home or villa renovation.
- How to select a roof-insulation system after inspecting the surface.
- How to distinguish leak symptoms, diagnosis, and repair scope.
- Electrical and plumbing inspection before closing walls, ceilings, tiles, or gypsum board.
- When concrete cutting is appropriate versus a core opening.
- A practical checklist before painting or tiling work begins.

These guides are not substitutes for commercial landing pages and must not fabricate pricing, guarantees, projects, certifications, or response-time claims.

## Quality and Anti-Duplication Rules

- Do not produce city-page permutations from a template.
- Reuse shared factual service information only where necessary; each local page needs a distinct decision path, area context, FAQ set, and related-work selection.
- Preserve an explicit keyword ownership record before publishing any new page.
- If a published URL already owns the query, update its copy, schema, internal links, imagery, or FAQ instead of adding another page.
- Do not target phrases for selling materials, hiring labour, software, business setup, generic company profiles, brand-navigation searches, or unrelated tools.
- Do not claim guarantees, years of experience, approvals, projects, prices, or availability that cannot be evidenced by the owner.

## Competitive SERP Implications

Current local results are dominated by broad, repetitive contractor pages that combine many services and cities. Sorouh should compete through better intent matching: a focused service scope, concrete pre-execution questions, clear handoffs between trades, local project context when available, and direct contact options. The strategy does not require copying competitors’ exaggerated claims or city-template scale.

## Measurement and Release Rules

- Keep the published GTM `contact_click` event on every contact action.
- Track each new owner URL in the keyword record with its primary phrase, variants, geography, intent, rationale, and status.
- Validate unique title, canonical, H1, FAQ, internal links, schema, sitemap inclusion, and production response before release.
- Review Search Console impressions, clicks, indexed URLs, and GA4 contact events after crawl and data collection; measured results determine the second wave.

## Out of Scope

- Pages for unsupported services.
- A page for every Eastern Province city.
- Low-intent material-sales, employment, directory, software, or business-setup keywords.
- Paid-ad campaign creation or budget changes.
