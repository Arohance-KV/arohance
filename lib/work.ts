/**
 * Selected work, in grid order. The homepage's work grid and each project's
 * case study page (`app/case-study/[slug]`) render from this list, so a
 * project's copy lives in one place.
 *
 * Every image is a placeholder from the original design bundle until the
 * real project visuals exist; each `alt` names what belongs in that slot.
 */
export type Img = { src: string; width: number; height: number; alt: string };

type Pair = readonly [string, string];

/** One piece of a section's body, rendered in order. */
export type Block =
  | { p: string }
  | { h: string } // sub-heading
  | { list: readonly string[] }
  | { points: readonly Pair[] } // [name, short detail] rows
  | { flow: readonly string[] } // steps, joined by arrows
  | { table: readonly (readonly string[])[] } // first row is the header
  | { quote: string; by: string };

export type TextSection = {
  label: string;
  /** Lead statement: sentence case, or bold caps in a dark section. */
  heading?: string;
  /** Appended to the heading in the accent colour. */
  accent?: string;
  dark?: boolean;
  /** [figure, caption], full width under the heading. */
  stats?: readonly Pair[];
  /** Source line under the stats. */
  note?: string;
  blocks?: readonly Block[];
};

/** A row of images between sections. */
export type Section = TextSection | { images: readonly Img[] };

export type Work = {
  slug: string;
  client: string;
  /** No full stop: it is also the page title. */
  title: string;
  /** Homepage card line. */
  summary: string;
  tags: string;
  /** Homepage card and case study hero. */
  image: Img;
  /** Project snapshot, in the case study header. */
  facts: readonly Pair[];
  sections: readonly Section[];
  closing: string;
  cta?: { heading: string; body: string };
  seo?: { title: string; description: string };
};

export const workHref = (w: Work) => `/case-study/${w.slug}`;

// Placeholders, named for what they show.
const SITE = { src: '/images/f1d945b460.jpg', width: 1920, height: 1080 };
const PHONES = { src: '/images/8dc8938ce7.jpg', width: 1920, height: 1080 };
const APP = { src: '/images/17320eecd2.jpg', width: 1920, height: 1080 };
const CITY = { src: '/images/ff551cbd9d.png', width: 868, height: 488 };
const FEED = { src: '/images/3143905490.jpg', width: 900, height: 600 };
const LAPTOP = { src: '/images/df2ee54140.jpg', width: 950, height: 678 };
const BOOK = { src: '/images/b7afa59dc4.jpg', width: 950, height: 535 };

export const WORK: readonly Work[] = [
  {
    slug: 'daadis-on-screen-and-on-ground',
    client: 'Daadis',
    title: 'On screen and on ground',
    summary: 'Everything digital, rebuilt, then a college fest where Gen-Z swiped right on khakhra.',
    tags: 'Build · Social · Studios · Experience',
    image: { ...SITE, alt: 'A Daadis quick-commerce listing, before and after' },
    facts: [
      ['Client', 'Daadis'],
      ['Industry', 'Food & snacks'],
      ['Verticals', 'Build · Social · Studios · Experience'],
      ['Timeline', '3-month digital rebuild'],
      ['Scope', 'Website, quick-commerce visuals, catalogues, Instagram, a college-fest stall'],
      ['Platforms', 'Blinkit · Zepto · Swiggy Instamart · BigBasket'],
    ],
    sections: [
      {
        label: 'The challenge',
        heading: 'A great product, with its difference invisible.',
        blocks: [
          { p: 'Daadis makes snacks the right way: high-quality ingredients, no palm oil, roasted options, all prepared hygienically. The problem was that nobody could see it.' },
          { p: "The old website was slow and full of bugs. On quick-commerce apps, plain product shots sat next to competitors and gave shoppers no reason to choose Daadis. The brand's real strengths weren't visible anywhere a customer might look." },
          { p: "Arohance made the difference visible in two places: on screen, by rebuilding the brand's entire digital presence in three months, and on ground, at a college fest where Gen-Z got to swipe right on Daadis." },
        ],
      },
      {
        images: [
          { ...LAPTOP, alt: 'The new Daadis website, desktop and mobile' },
          { ...BOOK, alt: 'New Daadis product visuals across quick-commerce platforms' },
        ],
      },
      {
        label: 'On screen',
        dark: true,
        heading: 'Everything digital,',
        accent: 'rebuilt.',
        blocks: [
          {
            points: [
              ['New website', 'Built from scratch, fast and stable'],
              ['Quick-commerce listings', 'Some of the best-looking in the category'],
              ['Catalogues', 'The full range, clear and consistent'],
              ['Instagram', 'Built around why Daadis is the better choice'],
              ['One message', 'Better ingredients, better snacking'],
            ],
          },
        ],
      },
      { images: [{ ...FEED, alt: 'Daadis on Instagram' }] },
      {
        label: 'The result',
        heading: 'Shoppers finally saw the difference, and chose Daadis for it.',
        blocks: [
          {
            list: [
              'Better placement on quick-commerce platforms',
              'Growth in sales',
              'A clear differentiator in its segment',
              'Customers who understand why the brand is better',
            ],
          },
        ],
      },
      {
        label: 'On ground',
        heading: 'How do you make a traditional snack brand feel cool to Gen-Z? You let them date it.',
        blocks: [
          { p: "Traditional snacks don't usually excite a college crowd, so we borrowed its language. At a college fest at CMS College, Bengaluru, a standalone Daadis stall turned the brand's sweets and khakhras into a dating-app game." },
          { p: 'Students swiped right and left on Daadis products, just like on a dating app, and found their perfect match.' },
        ],
      },
      {
        images: [
          { ...PHONES, alt: 'Students playing the Daadis swipe game at CMS College' },
          { ...CITY, alt: 'The Daadis stall at the fest' },
        ],
      },
      {
        label: 'The game',
        dark: true,
        heading: 'Swipe right',
        accent: 'on khakhra.',
        blocks: [
          {
            points: [
              ['Swipe right, swipe left', 'A dating-app game, with sweets and khakhras as the matches'],
              ['Earn your freebie', 'Spin the wheel, answer questions, follow Daadis or mention it on a story'],
              ['Doing, not just seeing', 'People remember the brand behind a product they earned'],
              ['Content from the ground', "The event, filmed for Daadis's channels"],
            ],
          },
        ],
      },
      {
        label: 'The turnout',
        heading: 'Tradition, swiped right.',
        stats: [
          ['1,000+', 'footfall at a small college fest'],
          ['100s', 'of samples in the hands of the target audience'],
          ['4', 'content pieces, ready to reuse as ads'],
        ],
        blocks: [{ p: "Students didn't just taste Daadis, they posted about it: multiple story mentions, and strong activity from unique viewers online." }],
      },
    ],
    closing: 'The quality was always there. Now people can see it.',
  },
  {
    slug: 'supreme-global-corporate-gifting-platform',
    client: 'Supreme Global',
    title: 'Systems that run the business',
    summary: 'Systems that run the business: one connected platform in place of hours of manual work per enquiry.',
    tags: 'Build',
    image: { ...APP, alt: 'The Supreme Global gifting platform' },
    facts: [
      ['Client', 'Supreme Global'],
      ['Industry', 'Corporate gifting'],
      ['Verticals', 'Build'],
      ['Project type', 'Digital transformation, custom software'],
      ['Primary users', 'Corporate buyers, employees, sales, marketing, admins, vendors'],
      ["Arohance's role", 'Strategy, UX, interface design, development, workflow automation'],
    ],
    sections: [
      {
        label: 'The challenge',
        heading: "Supreme Global is one of South India's leading corporate gifting companies, with more than 10,000 products and a growing list of enterprise clients. Every enquiry used to mean hours of manual work.",
        blocks: [
          { p: 'Also known as Supreme International, it serves major Indian enterprises, multinational corporations and organisations running large employee-gifting programmes. As its range and client base grew, the manual processes behind them began to limit how efficiently the business could grow.' },
          { h: 'A large catalogue had become a manual workload' },
          { p: 'Supreme Global manages 10,000+ gifting products across categories, materials, brands, prices and customisation options. A request as simple as “show us bottles below ₹500” could take hours.' },
          { p: "The team had to search hundreds of relevant products, collect photographs, verify prices, review specifications, confirm quantities and check which branding methods each item allowed. Customisation isn't universal: one bottle takes laser engraving but not sublimation printing, another allows a logo in only one position or size. Every recommendation needed product knowledge and careful manual checks." },
          { p: 'The options then went into a PDF catalogue for the client. A request for different materials, a new budget, other customisation or alternative products meant repeating much of the process. The business had the inventory and the expertise. The challenge was making both accessible at scale.' },
          { h: 'Quotation revisions created friction' },
          { p: 'Every revision to quantities, customisation or pricing could mean another document to prepare, review, correct, approve and send, with information moving back and forth between employees, managers, directors and customers. That made it hard to keep:' },
          {
            list: [
              'A consistent quotation process',
              'Clear ownership of each request',
              'Reliable approval records',
              'Fast turnaround times',
              'Accurate, current product information',
              'Visibility across departments',
            ],
          },
          { h: 'Growth meant equal growth in overhead' },
          { p: "Serving considerably more customers under the old model would have needed a substantial increase in staff: more enquiries meant more manual searches, catalogues, quotations, revisions and approvals. Supreme Global didn't need another corporate website. It needed a system that could support the next stage of the business." },
        ],
      },
      {
        label: 'The objective',
        heading: 'Serve more customers without multiplying the repetitive work.',
        blocks: [
          { p: 'Arohance was asked to rethink how Supreme Global could use technology to:' },
          {
            list: [
              'Make a very large product range easier to discover',
              'Reduce the chance of relevant products being overlooked',
              'Generate tailored catalogues faster',
              'Simplify quotation creation and revision',
              'Establish clear approval processes',
              'Give each department the right level of control',
              'Create a more professional, differentiated customer experience',
              'Introduce new corporate-gifting models',
              'Build a foundation for future product and vendor growth',
            ],
          },
          { p: 'The solution had to improve both sides of the experience: what customers saw, and how Supreme Global operated behind it.' },
        ],
      },
      {
        label: 'The strategic shift',
        heading: 'From assembling options by hand to guided discovery.',
        blocks: [
          { p: "Instead of asking Supreme Global's team to rebuild the sales journey for every enquiry, we gave customers and employees the tools to begin that journey themselves, turning fragmented manual tasks into connected digital workflows across three experiences:" },
          {
            list: [
              'A product discovery, catalogue and quotation platform',
              'A points-based employee-gifting portal',
              'A B2B vendor and catalogue-expansion system',
            ],
          },
          { p: 'Together, they turned the website from a digital showcase into an operational platform.' },
          { h: 'Core capabilities' },
          {
            list: [
              'Intelligent product discovery',
              'Custom catalogue generation',
              'Online quotation requests',
              'Internal quotation creation',
              'Multi-level approval workflows',
              'Corporate employee-gifting portals',
              'Points-based product redemption',
              'Additional online payments',
              'Vendor and product management',
              'Role-based administrative panels',
            ],
          },
        ],
      },
      {
        images: [
          { ...LAPTOP, alt: 'Filter-based product discovery on the Supreme Global platform' },
          { ...SITE, alt: 'A custom catalogue, generated in one click' },
        ],
      },
      {
        label: 'Discovery and catalogues',
        dark: true,
        heading: 'Customers start',
        accent: 'the search themselves.',
        blocks: [
          { h: 'Intelligent product discovery' },
          { p: "Instead of waiting for a manually prepared list, customers explore Supreme Global's range directly on the website, filtering by:" },
          {
            list: [
              'Product category',
              'Material',
              'Brand',
              'Price range',
              'Customisation compatibility',
              'Other product attributes',
            ],
          },
          { p: "A buyer looking for glass bottles from a particular brand below ₹600 can apply those requirements and narrow the selection immediately. Nobody waits for the team to search thousands of products first, and visitors who are only exploring get a practical way to understand the range before they're ready to order." },
          { h: 'One-click custom catalogues' },
          { p: 'Corporate gifting decisions are rarely made by one person: department heads, procurement teams and management often review the options. After filtering and selecting products, a user can create a focused catalogue of only the relevant options and share it internally, without anyone collecting photographs and building a new PDF by hand. Customers can:' },
          {
            list: [
              'Create requirement-specific product selections',
              'Share consistent product information with decision-makers',
              'Cut down irrelevant choices',
              'Revisit shortlisted products',
              'Move from discovery to enquiry faster',
            ],
          },
          { p: 'For Supreme Global, it means less repetitive catalogue-building and a lower risk of a suitable product being missed in a manual search.' },
        ],
      },
      {
        label: 'Quotations and approvals',
        heading: 'From shortlist to quotation, with control built in.',
        blocks: [
          { h: 'A connected quotation journey' },
          { p: "Once products are shortlisted, customers add them to a request with quantities, branding requirements and other expectations. The request moves into Supreme Global's internal workflow, where the right team reviews it, prepares pricing and issues a quotation. Revisions stay inside one organised process instead of scattered documents and conversations." },
          { flow: ['Discovery', 'Shortlist', 'Catalogue', 'Requirements', 'Quotation', 'Follow-up'] },
          { p: "The point wasn't to remove the sales team from the relationship. It was to remove the repetitive admin, so the team can spend more time advising clients, solving customisation challenges and closing opportunities." },
          { h: 'Role-based internal operations' },
          { p: "Behind the customer experience sit internal panels built around how Supreme Global's teams actually work, each with its own level of access:" },
          { list: ['Sales', 'Marketing', 'Super admin', 'Backend team', 'Company panel, client-side', 'Vendor portal'] },
          { p: "Team members prepare updates, add information or start actions within their permissions, but sensitive changes don't go live automatically. The relevant department lead is notified and approves or rejects them, and only approved changes reach the live system. That covers product information, website content, visual and theme updates, quotations, commercial approvals and other controlled actions." },
          { h: 'Governance for a growing organisation' },
          { p: 'Unrestricted access for everyone introduces risk; limiting every change to a few senior people creates bottlenecks. Role-based permissions and structured approvals solve both: contributors keep work moving, and authorised leads keep final control.' },
          { flow: ['Contributors prepare', 'Department heads review', 'Approved changes go live'] },
        ],
      },
      {
        label: 'Employee gifting',
        dark: true,
        heading: 'Gift value.',
        accent: 'Let employees choose.',
        blocks: [
          { p: 'Traditional corporate gifting gives every employee the same product: easy to run, but not always useful to the person receiving it. So we asked a different question: what if a company could gift value, and let every employee choose how to use it?' },
          { h: 'A personalised gifting portal' },
          { p: 'Supreme Global can set up a dedicated portal for each organisation on a company-specific subdomain, with email and password or Google sign-in. The organisation buys gifting points for its workforce, and each employee redeems an allocated balance against a curated collection approved for that company.' },
          {
            points: [
              ['Allocation', '1,000 points per employee'],
              ['Value', '1 point = ₹1'],
              ['Chosen', 'Products worth 900 points'],
              ['Balance', "Stays available, within the programme's rules"],
            ],
          },
          { h: 'Flexible spending beyond the balance' },
          { p: 'An employee with 1,000 points who picks products worth ₹1,100 has the first ₹1,000 covered by the company-funded balance, and pays the remaining ₹100 by UPI or card. Employees get more freedom and can choose higher-value products, without the employer raising the original gifting budget.' },
          { h: 'Gifting that lasts beyond one occasion' },
          { p: "The portal isn't limited to a single distribution day. Depending on each company's programme, balances can stay valid for a set period, even supporting year-round redemption, and whether unused points carry forward is configurable per company. The model adapts to:" },
          {
            list: [
              'Diwali gifting',
              'Employee recognition',
              'Joining benefits',
              'Performance rewards',
              'Work anniversaries',
              'Milestone celebrations',
              'Wellness initiatives',
              'Annual employee-benefit programmes',
            ],
          },
        ],
      },
      {
        label: 'Vendor ecosystem',
        heading: 'A catalogue that grows without growing the admin.',
        blocks: [
          { p: 'A gifting platform becomes more valuable as its catalogue grows, but sourcing, documenting and maintaining every product by hand is its own scaling problem. So we designed a B2B vendor system where approved sellers add and manage their own products inside the ecosystem.' },
          { p: 'Customers keep dealing with Supreme Global through one consistent discovery and quotation experience, while vendor relationships and base pricing are managed internally. The vendor portal is live today, with approved sellers already adding and managing products. It lets Supreme Global:' },
          {
            list: [
              'Onboard more vendors',
              'Expand its product range',
              'Capture supplier pricing',
              'Set margins per vendor or category',
              'Route enquiries through one process',
              'Keep control of the customer relationship',
              'Grow the catalogue without proportionally more admin',
            ],
          },
          { p: 'What began as a gifting website can grow into a connected B2B marketplace.' },
        ],
      },
      {
        label: 'The transformation',
        dark: true,
        heading: 'From a manual cycle',
        accent: 'to a digital journey.',
        blocks: [
          {
            table: [
              ['Before', 'After'],
              ['Manual product searching', 'Filter-based product discovery'],
              ['A catalogue assembled for every enquiry', 'Requirement-specific catalogue generation'],
              ['Relevant products could be overlooked', 'A wider catalogue, searched systematically'],
              ['Quotations prepared and circulated by hand', 'Connected quotation requests and internal workflows'],
              ['Approvals in scattered conversations', 'Role-based review and approval'],
              ['The same gift for every employee', 'Personal product choice'],
              ['A fixed, company-funded gifting value', 'Points, with optional online top-ups'],
              ['Catalogue growth managed internally', 'Vendor-assisted product expansion'],
              ['More clients meant much more coordination', 'A platform designed to scale'],
            ],
          },
        ],
      },
      {
        label: 'The result',
        heading: 'The foundation to operate differently.',
        stats: [
          ['10×+', 'faster catalogue and quotation turnaround than the manual process'],
          ['10,000+', 'products available on the platform'],
        ],
        blocks: [
          { p: 'The platform was designed to:' },
          {
            list: [
              'Reduce repetitive catalogue preparation',
              'Shorten the journey from product search to quotation request',
              "Open up the company's full product range",
              'Reduce dependence on individual employees for routine coordination',
              'Create clearer internal responsibilities',
              'Provide controlled approval processes',
              'Help sales teams concentrate on customer relationships',
              'Offer corporate clients a more modern gifting experience',
              'Enable employee choice within employer budgets',
              'Support catalogue growth through a wider vendor network',
              'Make growth less dependent on proportional team expansion',
            ],
          },
        ],
      },
      {
        label: 'More than a website',
        heading: 'This project was never about putting a catalogue online.',
        blocks: [
          { p: 'It was about understanding the operational friction behind corporate gifting, and designing a system around the way buyers, employees, sales teams, managers and vendors actually work.' },
          { p: 'The result connects customer convenience with internal control. Customers discover more, employees choose better, teams work with more clarity, and Supreme Global can prepare for growth without letting manual processes set its limits.' },
        ],
      },
    ],
    closing: 'From displaying products to helping run the business.',
    cta: {
      heading: 'Is operational complexity holding back your growth?',
      body: "Arohance designs platforms that simplify workflows, connect teams and turn demanding business processes into experiences people use with confidence. Let's build the system your next stage of growth needs.",
    },
    seo: {
      title: 'Supreme Global Corporate Gifting Platform Case Study',
      description: "See how Arohance transformed Supreme Global's manual gifting workflows into a scalable platform for catalogues, quotations, approvals, and employee choice.",
    },
  },
  {
    slug: 'kria-sports-platform',
    client: 'Kria',
    title: 'A sports platform, built from zero',
    summary: 'A sports platform, built from zero. Our own app, from player registration to live leaderboards.',
    tags: 'Build · Social · An Arohance product',
    image: { ...CITY, alt: 'Kria, the app and the brand' },
    facts: [
      ['Type', "Arohance's own product"],
      ['Industry', 'Sports tech'],
      ['Verticals', 'Build · Social'],
      ['Scope', 'Naming, logo, brand identity, website, app'],
    ],
    sections: [
      {
        label: 'The idea',
        heading: 'Kria means action, and in sports, everything is about action.',
        blocks: [
          { p: "Kria is Arohance's own sports tournament platform. It manages everything from player registration to auctions, match-day scoring and leaderboards, for local tournaments and large-scale leagues alike." },
          { p: 'Running a tournament usually means spreadsheets, WhatsApp groups and manual scorecards. Kria brings the whole tournament into one app, from the first registration to the final leaderboard.' },
        ],
      },
      {
        images: [
          { ...PHONES, alt: 'Kria match-day scoring' },
          { ...APP, alt: 'A Kria player profile' },
        ],
      },
      {
        label: 'What we built',
        dark: true,
        heading: 'The whole tournament,',
        accent: 'in one app.',
        blocks: [
          {
            points: [
              ['Brand identity', 'The name, meaning action, and a running-human logo'],
              ['The app', 'Tournaments, registrations, auctions, scoring, live leaderboards'],
              ['Player profiles', 'Stats that grow with every match'],
              ['Automation at its core', 'So organisers can focus on the game'],
              ['The website', 'Shows what Kria does and invites organisers in'],
            ],
          },
          { p: 'Underneath it runs some of the most advanced automation in sports tournament management.' },
        ],
      },
      {
        label: 'Why it matters',
        heading: 'Kria is proof of how Arohance works.',
        blocks: [
          { p: 'We build our own products with the same process we use for clients: from name to logo to live app, all under one roof.' },
        ],
      },
    ],
    closing: 'Built for the game. Built by us.',
  },
  {
    slug: 'samyak-group-social-media-growth',
    client: 'Samyak Group',
    title: 'From a stagnant page to 1,200+ new followers in 90 days',
    summary: "From a stagnant page to 1,200+ new followers in 90 days, in one of Bengaluru's smallest communities.",
    tags: 'Social',
    image: { ...FEED, alt: 'Samyak Group on Instagram' },
    facts: [
      ['Client', 'Samyak Group, Bengaluru'],
      ['Audience', 'Jain families in Bengaluru'],
      ['Verticals', 'Social'],
      ['Timeline', '90 days'],
      ['What we did', 'Content strategy · Reels · Posts · Carousels · Stories'],
    ],
    sections: [
      {
        label: 'The challenge',
        heading: 'A page that had stopped growing.',
        blocks: [
          { p: "Samyak Group runs Pathshalas and community activities for Jain families in Bengaluru. Its social media page had gone quiet: posts weren't reaching new people, and the follower count had stopped moving." },
          { p: "The problem wasn't effort. It was focus. Samyak Group doesn't need to reach everyone in Bengaluru. It needs to reach a very specific set of families, and its content wasn't built for them." },
        ],
      },
      {
        label: 'The audience',
        heading: 'A small community. A precise target.',
        stats: [
          ['0.37%', "of India's population is Jain"],
          ['83,090', 'Jains in Bengaluru Urban district'],
          ['0.86%', "of Bengaluru's population"],
        ],
        note: 'Source: Census of India 2011.',
        blocks: [
          { p: 'With an audience this small, broad content gets lost. Every piece had to speak directly to the families Samyak Group exists for.' },
        ],
      },
      {
        images: [
          { ...BOOK, alt: 'A Samyak Group Pathshala reel' },
          { ...PHONES, alt: 'Samyak Group community posts' },
        ],
      },
      {
        label: 'What we did',
        dark: true,
        heading: 'Content built around',
        accent: 'one audience.',
        blocks: [
          { p: "We built the page's content around the people most likely to connect with Samyak Group's purpose: Jain families in Bengaluru." },
          {
            points: [
              ['Reels, posts, carousels, stories', 'Pathshalas and community life, easy to discover, watch and share'],
              ['Community-first storytelling', 'The values and everyday life of the audience, so people saw themselves'],
              ['Admission-focused content', 'A clear reason for families to get involved'],
            ],
          },
        ],
      },
      {
        label: 'The results',
        heading: '90 days later.',
        stats: [
          ['1,200+', 'new followers'],
          ['2,57,409', 'views'],
          ['6,455', 'interactions'],
          ['4,400+', 'profile visits'],
        ],
        note: "From Samyak Group's Instagram Insights over a 90-day period.",
        blocks: [
          {
            list: [
              "Almost all of the campaign's videos are now among the most-viewed on Samyak Group's channel",
              '1,200+ new followers is about 1 in every 70 Jains in Bengaluru',
              '2.5 lakh+ views, for a community of around 83,000 people in the city',
            ],
          },
        ],
      },
      {
        label: 'What the client said',
        heading: 'Growth people could feel.',
        blocks: [
          { p: "The response went beyond the numbers. Samyak Group's members told us they were very happy with the work and with how the page had grown, and called the follower growth amazing. Most importantly, people had started showing interest in joining them." },
          {
            quote: "On behalf of Team Samyak, thank you for your outstanding efforts in managing our social media. The reach and engagement we've seen over the past 5 days have been truly incredible. This success is a reflection of your creativity, consistency, quality content, and hard work. Every post and every effort has made a visible impact. Your dedication is paying off, and we're excited to achieve many more milestones together.",
            by: 'Manoj Bhai, Team Samyak',
          },
        ],
      },
      {
        label: 'Why it worked',
        heading: 'Reach the right people, not the most people.',
        blocks: [
          { p: 'Samyak Group serves a focused community. By creating content for the people most likely to connect with its purpose, Arohance turned a stagnant page into an active place for Jain families in Bengaluru to discover the group.' },
          { p: 'Content made for a specific community gets watched, shared and acted on by that community.' },
        ],
      },
    ],
    closing: 'When the audience is small, precision beats volume.',
    cta: {
      heading: 'Serving a specific community?',
      body: 'Arohance builds social media content for the exact people your organisation exists for, however small or specific that audience is.',
    },
  },
];
