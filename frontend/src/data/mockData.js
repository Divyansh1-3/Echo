export const currentUser = {
  name: "Alex Chen",
  handle: "alexchen",
  avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDiYixwO6bzmQPOOz9yDAmMrCxaXtiQU9E6xn41ghIPrVNUXSVlF_rhU0GL-ZCNQgDS-IJOcd0x3HYxstWffGFMHy_0X0b8GmBlEkxjVkNSdWVA6CYHnrJWJya4P6q248nUQzIrMe_wmFunafEDTQIanmIqC7UVsvr2uzekg8a5sEOx03n-mLMvjYGUtDvRLYmFMBl3EF5qKwgo2AfSBaNUenYKKTgtwNChzQSTtFk",
  coverImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuDOn_PuFhHb_DAsgE1V1-zASP1L1DS8ZDAMfaAFxOzB_mZBBDh9-GpU71DJCOgPmYc5GR9FEdpBX-HwkEByKTLAwUIitvDV8aveW7cnVKMXZgOVReUpfy3oOSeyjqgMrViHx4D6fZp1F4HypcZ2T6bnbtXtXyxaAMpQiXvUtNVwQW9EdEM14my05bd3k7mWuWVpTZCBgTua8eYK4Dpd65ZbIYFwoSG8Jo2r72hs9Xs",
  pronouns: "he/him",
  bio: "Building the next gen of developer tools & UI systems @acmelabs 🚀 | Exploring AI workflows, WebGL & modern frontend architecture. Obsessed with craft & typography. ⚡️",
  location: "San Francisco, CA",
  website: "alexchen.dev",
  websiteUrl: "https://alexchen.dev",
  joined: "Joined September 2018",
  followingCount: "1,842",
  followersCount: "34.8K",
  postsCount: "1,428",
  mutuals: {
    avatars: ["SJ", "ER", "+42"],
    names: "Sarah Jenkins, Elena Rostova, and 42 others you follow"
  }
};

export const initialFeedPosts = [
  {
    id: "feed-1",
    author: {
      name: "Sarah Jenkins",
      handle: "sarahcodes",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDVxVbNO9-U-6wpiFe4Y61SARm8C4DWaEY8Xb8D-wHY4PVgIjiW0PT0bWT2OI4CGepOPIRmz9k3_LfJLpkFixyhlFMdKPNA1KtmSWJl8L9seyAbR7SLzwGSKInKGN7OvPareXyfmDSYpnOobS-lQRL-Pw_5F9lww2mygYv1TogFT6f2B6rYGzRz0vcHHAyViVUAqCjwimZ7Q9AWi6E_hSqbhXV-GsolhHOrOSEAczs",
      verified: true
    },
    time: "2h",
    content: "Just shipped v2.0 of our open-source vector search library! 🚀 3x lower latency and zero config embeddings. Couldn't have done it without the incredible community contributors.",
    hashtags: "#OpenSource #VectorDB #AIInfrastructure",
    embedType: "code",
    codeData: {
      fileName: "vector_bench.ts",
      meta: "128-dim embed · latency -68%",
      code: `import { VectorEngine } from "@arch/vector-v2";\n\nconst db = await VectorEngine.connect({ dimensions: 1536 });\nconst results = await db.query(tensor, { topK: 10, efSearch: 64 });\n// P99 latency: 1.42ms [3.2x speedup]`
    },
    stats: {
      replies: 42,
      retweets: 128,
      likes: 1400,
      likesFormatted: "1.4K",
      views: "89K",
      isLiked: true,
      isRetweeted: false,
      isBookmarked: false
    }
  },
  {
    id: "feed-2",
    author: {
      name: "Marcus Vance",
      handle: "marcus_vance",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAPAf5n2ILKDo8oDAxR8_-6G0DJQb_Ka6WzHxxNzAD8IPWxWQXTimS74d-2CUVOic2I8dtEF7wRMQZyJxfyJ7_dKGQnx6I_Fi5PPlifnlME4k0cynZ-kLJNf34a0NNamRX3kiMCbOtbifsxWAF4_UbSZt-x0u9MQBXl4AsEZsNjIRTqPnA7gCo9QpdV7GqYAlsZCpwvcnL6MjLSvWDimcPSDKxFw1WspOtb-yR5reI",
      verified: false
    },
    time: "4h",
    content: "Hot take: The best design systems aren't the ones with the most components, they're the ones your engineers actually enjoy using without having to ask questions in Slack.",
    embedType: "metrics",
    metricsData: [
      {
        label: "Dev Adoption Rate",
        value: "94.2%",
        change: "+18% YoY",
        valueColor: "text-primary",
        changeColor: "text-secondary-fixed"
      },
      {
        label: "Design Debt Tickets",
        value: "-41%",
        change: "Quarterly delta",
        valueColor: "text-tertiary",
        changeColor: "text-outline"
      }
    ],
    stats: {
      replies: 89,
      retweets: 310,
      likes: 3800,
      likesFormatted: "3.8K",
      views: "140K",
      isLiked: false,
      isRetweeted: false,
      isBookmarked: false
    }
  },
  {
    id: "feed-3",
    author: {
      name: "Elena Rostova",
      handle: "elena_ux",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDashephwnxYXqN2SDJQGz5g9DMrs8KBoPdiy2DbaDPKGB2CeGJXg_k4SSYdkVl2oiMQlcsGxkhOVh69X6gt5O1b7u3l8XcKxotwGbBx2O-2_v_niYMCqtsmK7gkRrsjrlWOKlEShhTYQcnnthfAIOlB4n3awD0_tcTN67NL7mTNF538DDa62G5Y90RdjIZ19BgUaGqC8zcEY2gdL6Hx4wVTfhERncWNdqQaBy87Cw",
      verified: true
    },
    time: "6h",
    content: "Late night prototyping with new micro-interactions. Dark mode feels so clean when the borders are 1px and subtle enough to let typography breathe. What do you think of this layout?",
    embedType: "image",
    imageData: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuADVkBZTlrq29q4_1OXpKw003XXdLOA5_YccpuK9r_ktyAGNU1dLLn3Zxc8-iCeQqp6yd8StoWxBiaoWW40cgZemLdp2aSSz2LNNnyb8tyVcQG6uYnqQ6NhyVhIhBa_lV6MtEDYcPgjq8wf6he12OUJTXwwPL1dvyikIqTzB7_HYXIC4NP32onuM7r3RHHdlKjdgNWzQxnc3mI8kSSowPz0WmbEoTgciAH0va2nkcM",
      alt: "Dark mode futuristic dashboard mockup",
      badgeIcon: "brush",
      badgeText: "Figma Community Concept"
    },
    stats: {
      replies: 19,
      retweets: 54,
      likes: 892,
      likesFormatted: "892",
      views: "31.4K",
      isLiked: false,
      isRetweeted: false,
      isBookmarked: false
    }
  },
  {
    id: "feed-4",
    author: {
      name: "DevDigest",
      handle: "devdigest",
      initials: "DD",
      verified: true
    },
    time: "8h",
    content: "BREAKING: Anthropic and OpenAI announce breakthrough benchmarks in autonomous code architecture validation. Swe-Bench Pro achieves 81.3% resolution on end-to-end multi-repo refactoring tasks.",
    embedType: "link",
    linkData: {
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAeq3xK0cxG3rBmsJhPZvNGZMbnIoxA4A5j_4IVDQcBWe1ujUqZDiZuVu7wbceBGte7TRQDnSnK_QdUNhTFkf3cLRr8wijab631rbHpmC-DIZztOE7ZabIyG94GCSH9K1qwiFcgeY9EfRzQVrTqdd21o4IX6HwyrnBk-jz1tejDorDhWfGP-2gMsYEWnrCQAfWwQXogUq0wCNVV7CTztxBNLXZXbgdPVWBsctTVGtc",
      url: "research.devdigest.io",
      title: "Autonomous Multi-Agent Architecture Validation Report 2025",
      description: "Examine how state-of-the-art inference engines perform deep distributed systems migrations without regression."
    },
    stats: {
      replies: 156,
      retweets: 640,
      likes: 5100,
      likesFormatted: "5.1K",
      views: "210K",
      isLiked: false,
      isRetweeted: false,
      isBookmarked: false
    }
  }
];

export const profilePosts = [
  {
    id: "profile-1",
    author: currentUser,
    time: "Oct 14",
    isPinned: true,
    content: "Reflecting on 3 years of building component frameworks: The secret to high-velocity adoption isn't stricter rules—it's eliminating cognitive friction. Here are the 5 core patterns we shipped that dropped design debt by 40%:",
    embedType: "code",
    codeData: {
      fileName: "tokens.config.ts",
      meta: "v3.4 Production",
      codeTokens: true
    },
    stats: {
      replies: 84,
      retweets: 312,
      likes: 2100,
      likesFormatted: "2.1K",
      views: "188K",
      isLiked: false,
      isRetweeted: false,
      isBookmarked: false
    }
  },
  {
    id: "profile-2",
    author: currentUser,
    time: "2d",
    isPinned: false,
    content: "Obsessed with the frame rate bump after decoupling React state updates from layout measurements in large tables. Steady 120fps during aggressive rapid sorting. Benchmark comparison below:",
    embedType: "chart",
    chartData: {
      title: "Rendering Frame Times (ms)",
      badge: "-72% latency",
      baseline: "Baseline Virtualization",
      optimized: "Off-main-thread Scheduler"
    },
    stats: {
      replies: 29,
      retweets: 54,
      likes: 742,
      likesFormatted: "742",
      views: "45.2K",
      isLiked: false,
      isRetweeted: false,
      isBookmarked: false
    }
  },
  {
    id: "profile-3",
    author: currentUser,
    time: "May 3",
    isPinned: false,
    content: "First pass at spatial node editing right in the canvas. The glass refraction shader is completely reactive to cursor velocity. Pure WebGL + GLSL magic.",
    embedType: "image",
    imageData: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAdeXN3H670NgE9-STq8mbzRRMcrhj7FYiQzcXsdd8T95gKBt7xMBA66Rjb3XMoIiSBerHEGnjxp9QWG6YkrMK1IMermumM3epTzYri-ovcHtYCYs5nczwVoRwdu0Atf9zcbx3xWc_eLChRa7Fb-wmRCPNdSCvoSXoYQb8MG2Sfwn4mmBJGh1z0C-7tHH2lSeA_2Z3yNzLsNn5OVNDk_rdtARQVK9--NYXijDyjRaA",
      alt: "Dark-themed high-tech dashboard interface showcasing WebGL spatial node editing",
      badgeIcon: "pulse",
      badgeText: "Interactive Canvas Node"
    },
    stats: {
      replies: 62,
      retweets: 119,
      likes: 1400,
      likesFormatted: "1.4K",
      views: "82.9K",
      isLiked: false,
      isRetweeted: false,
      isBookmarked: false
    }
  }
];

export const trendingTopics = [
  {
    category: "Technology · Trending",
    title: "#ArtificialIntelligence",
    posts: "142.5K posts"
  },
  {
    category: "Design Systems · Trending",
    title: "TailwindCSS v4",
    posts: "38.1K posts"
  },
  {
    category: "Web Development · Trending",
    title: "#BuildInPublic",
    posts: "89.4K posts"
  }
];

export const whoToFollowUsers = [
  {
    id: "follow-1",
    name: "Sarah Dev",
    handle: "sarah_codes",
    initials: "SD",
    color: "text-secondary"
  },
  {
    id: "follow-2",
    name: "UX Collective",
    handle: "uxcollective",
    initials: "UX",
    color: "text-primary"
  }
];
