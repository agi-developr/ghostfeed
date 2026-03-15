import type { NicheConfig } from "../types.js";
import type { KnowledgeContext } from "../agents/educator.js";

export const gutHealthNiche: NicheConfig = {
  name: "gut health & SIBO",
  keywords: [
    "SIBO",
    "IMO",
    "gut health",
    "bloating",
    "IBS",
    "motility",
    "microbiome",
    "small intestinal bacterial overgrowth",
  ],
  tone: "knowledgeable, empathetic, slightly frustrated with mainstream medicine — like a friend who's been through it and actually understands the science",
  aesthetic:
    "medical illustration style, clean whites and soft blues, anatomical cross-sections, gentle microscopic views, educational diagrams as art, 9:16 vertical",
  avoidTopics: [
    "specific dosage recommendations",
    "diagnosing viewers",
    "anti-doctor rhetoric",
    "miracle cures",
  ],
};

export const gutHealthTopics: {
  topic: string;
  structure: "problem-mechanism-action" | "myth-bust" | "patient-journey";
  knowledge: KnowledgeContext;
}[] = [
  {
    topic: "Why your bloating isn't just IBS — the SIBO connection",
    structure: "patient-journey",
    knowledge: {
      topic: "SIBO misdiagnosis",
      facts: [
        "Up to 78% of IBS patients test positive for SIBO (Pimentel et al.)",
        "SIBO = bacterial overgrowth in the small intestine, where bacteria shouldn't be in large numbers",
        "The small intestine should be relatively sterile compared to the colon",
        "Standard IBS diagnosis is a diagnosis of exclusion — doctors rule out other things, then label it IBS",
        "Lactulose breath test can detect hydrogen and methane-producing bacteria in the small intestine",
        "Many patients go 5-10 years before getting a SIBO diagnosis",
      ],
      commonMyths: [
        "IBS is just stress-related",
        "Bloating after meals is normal",
        "You just need more fiber",
        "Probiotics fix everything",
      ],
      sources: [
        "Pimentel et al. — American Journal of Gastroenterology",
        "Rezaie et al. — North American Consensus on breath testing (2017)",
      ],
    },
  },
  {
    topic: "Why antibiotics keep failing for SIBO",
    structure: "problem-mechanism-action",
    knowledge: {
      topic: "SIBO treatment failure",
      facts: [
        "SIBO recurrence rate is up to 44% within 9 months after successful antibiotic treatment",
        "Rifaximin is the gold-standard antibiotic but doesn't address root cause",
        "Root causes include: impaired migrating motor complex (MMC), ileocecal valve dysfunction, adhesions, low stomach acid",
        "The MMC is a 'cleaning wave' that sweeps bacteria out of the small intestine every 90 minutes during fasting",
        "Anti-vinculin antibodies (from food poisoning) can damage the nerves controlling the MMC",
        "Biofilms — protective shields bacteria build — can block antibiotics from reaching the bacteria",
        "Without fixing motility, SIBO returns because the underlying cause persists",
      ],
      commonMyths: [
        "Just take Rifaximin and you're cured",
        "SIBO is caused by eating the wrong foods",
        "You need longer antibiotic courses",
        "Herbal antibiotics are always gentler than pharmaceuticals",
      ],
      sources: [
        "Pimentel — IBS-Smart anti-vinculin/anti-CdtB testing",
        "Siebecker & Sandberg-Lewis — SIBO treatment protocols",
        "Quigley — World Journal of Gastroenterology (2006)",
      ],
    },
  },
  {
    topic:
      "The migrating motor complex — why your gut's cleaning system is broken",
    structure: "problem-mechanism-action",
    knowledge: {
      topic: "MMC and gut motility",
      facts: [
        "The MMC is a cyclical wave of muscle contractions that sweeps through the small intestine every 90-120 minutes during fasting",
        "It's often called the 'housekeeper wave' — it clears debris, bacteria, and undigested food from the small intestine",
        "Eating stops the MMC — this is why meal spacing (4-5 hours between meals) matters for SIBO patients",
        "Snacking constantly keeps the MMC from ever activating",
        "Food poisoning can trigger anti-vinculin antibodies that damage the nerve cells (ICC) controlling the MMC",
        "Prokinetics (like prucalopride, low-dose erythromycin) can help stimulate the MMC",
        "The vagus nerve plays a key role in MMC function — vagus nerve damage impairs gut motility",
      ],
      commonMyths: [
        "Eating small frequent meals is healthier for everyone",
        "Meal timing doesn't affect gut bacteria",
        "Food poisoning effects are temporary",
        "Motility issues are just constipation",
      ],
      sources: [
        "Deloose et al. — Neurogastroenterology & Motility (2012)",
        "Pimentel — Vinculin autoimmunity and the MMC",
        "Takahashi — Interstitial Cells of Cajal research",
      ],
    },
  },
  {
    topic:
      "Anti-vinculin antibodies — the blood test that explains chronic SIBO",
    structure: "myth-bust",
    knowledge: {
      topic: "Anti-vinculin and post-infectious IBS",
      facts: [
        "CdtB toxin from food poisoning bacteria (Campylobacter, Salmonella, E.coli) can trigger an autoimmune response",
        "The immune system attacks CdtB but also cross-reacts with vinculin — a protein in gut nerve cells",
        "This molecular mimicry damages the interstitial cells of Cajal (ICC) that control gut motility",
        "Anti-vinculin antibodies above 1.68 strongly predict post-infectious IBS/SIBO",
        "This means: one bad case of food poisoning can cause YEARS of gut problems",
        "The IBS-Smart test measures anti-vinculin and anti-CdtB antibodies",
        "38% of scleroderma patients also have elevated anti-vinculin — showing it's a systemic autoimmune issue",
        "Currently there is no way to lower anti-vinculin antibodies — treatment focuses on managing symptoms and supporting motility",
      ],
      commonMyths: [
        "Food poisoning is a 48-hour thing",
        "IBS is psychosomatic or caused by anxiety",
        "There's no objective test for IBS",
        "If antibiotics clear SIBO, you're cured",
      ],
      sources: [
        "Pimentel et al. — Anti-vinculin antibodies in IBS (2015)",
        "IBS-Smart diagnostic test by Gemelli Biotech",
        "Rezaie et al. — Molecular mimicry in IBS pathogenesis",
      ],
    },
  },
  {
    topic:
      "Helminth therapy — the controversial SIBO treatment your doctor won't mention",
    structure: "problem-mechanism-action",
    knowledge: {
      topic: "Helminth therapy for autoimmune gut conditions",
      facts: [
        "Helminth therapy uses controlled infection with hookworms (Necator americanus) to modulate the immune system",
        "The 'old friends hypothesis' suggests our immune systems co-evolved with helminths — their absence may contribute to autoimmune diseases",
        "Helminths suppress Th1/Th17 responses and promote regulatory T cells (Tregs)",
        "Small clinical studies show improvements in IBD, celiac disease, and allergies",
        "Helminth therapy is NOT FDA-approved — it's experimental and accessed through clinical research or self-treatment",
        "Typical protocol: 10-35 hookworm larvae applied to the skin, which migrate to the small intestine",
        "Effects take 3-6 months to develop as the immune modulation builds",
        "Side effects can include temporary GI symptoms, skin irritation at application site",
      ],
      commonMyths: [
        "Parasites are always harmful",
        "The immune system works better when it's 'stronger'",
        "Autoimmune conditions can only be managed with immunosuppressants",
        "Alternative treatments are always pseudoscience",
      ],
      sources: [
        "Croese et al. — Hookworm therapy for celiac disease (2015)",
        "Helminth Therapy Wiki — community research database",
        "Maizels — Immunological Reviews: Helminth immunomodulation",
      ],
    },
  },
  {
    topic: "Brain fog from SIBO — it's not in your head",
    structure: "problem-mechanism-action",
    knowledge: {
      topic: "SIBO and neurological symptoms",
      facts: [
        "The gut-brain axis is a bidirectional communication network between the GI tract and the central nervous system",
        "SIBO bacteria produce D-lactic acid and other metabolites that can cross the blood-brain barrier",
        "Excess hydrogen and methane gas production affects nutrient absorption — B12, iron, and fat-soluble vitamin deficiencies cause cognitive symptoms",
        "Histamine-producing bacteria in SIBO can cause brain fog, fatigue, and anxiety",
        "One study found 77% of SIBO patients reported brain fog as a symptom",
        "Probiotic use in SIBO patients sometimes WORSENS brain fog (D-lactic acidosis from Lactobacillus)",
        "Treating the underlying SIBO often improves cognitive symptoms within weeks",
        "The vagus nerve carries information from gut bacteria directly to the brain",
      ],
      commonMyths: [
        "Brain fog is just stress or poor sleep",
        "Gut problems don't affect the brain",
        "Probiotics are always beneficial",
        "Brain fog isn't a real medical symptom",
      ],
      sources: [
        "Rao et al. — Brain fogginess, gas and bloating: D-lactic acidosis (2018)",
        "Mayer — The Mind-Gut Connection (2016)",
        "Quigley — Gut-brain axis and neuropsychiatric symptoms",
      ],
    },
  },
];
