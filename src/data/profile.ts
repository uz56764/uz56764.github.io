// Content for the About Me page and the printable CV (public/jinu-kim-cv.pdf).

import type { Currency } from '../lib/site';

export interface TimelineEntry {
  period: string;
  title: string;
  organization: string;
  summary?: string;
}

/** A bounty in USD, or null while the amount is not set (shown as $-). */
export type Reward = number | null;

export interface Finding {
  title: string;
  /** Separate reports of the same kind. Defaults to the number of links. */
  count?: number;
  /** Shown in front of the title. */
  cves?: string[];
  /** Public tracker entries. */
  links?: string[];
  /** How it was submitted, e.g. 'kvmCTF Full VM Escape'. Shown after the links. */
  program?: string;
  reward?: Reward;
  /** Headline result: marked and set larger. */
  highlight?: boolean;
}

export interface ResearchTarget {
  name: string;
  /** Combined bounty for the reports listed under it. */
  reward?: Reward;
  findings: Finding[];
  /** More reports exist than are listed. */
  more?: boolean;
}

export interface Project {
  title: string;
  summary: string;
}

export interface Award {
  /** '1st', '2nd' and '3rd' are set in medal colours. */
  place: string;
  event: string;
  international?: boolean;
  /** Prize money in the currency it was paid in. */
  prize?: { amount: number; currency: Currency };
}

export const profile = {
  summary:
    'I research vulnerabilities in system software and large-scale infrastructure — browsers, kernels, hypervisors, cloud platforms, and databases.',
  introduction: [
    'I research vulnerabilities in system software such as browsers and hypervisors. In Google Chrome, I have reported two full-chain exploits that include a browser sandbox escape, one of which earned a $250,000 bug bounty. In Linux KVM, I found a guest-to-host VM escape (CVE-2026-99082) and submitted it to kvmCTF. I have also found multiple remote code execution bugs in Cloudflare Workers and MongoDB, and ranked #1 on the 2026 HackerOne Korea leaderboard.',
    'I started with CTFs in high school and have reached the DEF CON CTF finals three times. I am currently studying at the KAIST School of Computing. I am interested in both AI for security research and the security of AI systems.',
  ],
  experience: [
    {
      period: 'Sep 2026 — Present',
      title: 'Team Lead, Security Engineer',
      organization: 'EUCLIDSOFT',
      summary: 'Vulnerability analysis and development of AI security products.',
    },
    {
      period: 'Jul 2026 — Aug 2026',
      title: 'Independent Vulnerability Researcher & Bug Bounty Hunter',
      organization: 'Independent',
      summary:
        'Vulnerability research across browsers, kernels, cloud infrastructure, and databases, including open-source research and exploit development. Ranked #1 on the 2026 HackerOne Korea leaderboard.',
    },
    {
      period: 'Dec 2024 — Jun 2026',
      title: 'Cyber Operations Specialist',
      organization: 'Cyber Operations Brigade, Republic of Korea Army',
      summary: 'Analyzed web and software vulnerabilities and validated real-world attack scenarios on red team missions.',
    },
  ] satisfies TimelineEntry[],
  research: [
    {
      name: 'Google Chrome',
      findings: [
        { title: 'Full Chain Exploit #1', reward: 250_000, highlight: true },
        { title: 'Full Chain Exploit #2', highlight: true },
        {
          title: 'Browser Sandbox Escape',
          links: [
            'https://issuetracker.google.com/issues/559115426',
            'https://issuetracker.google.com/issues/572401251',
            'https://issuetracker.google.com/issues/573174984',
          ],
        },
        {
          title: 'V8 Heap Sandbox Escape',
          links: ['https://issuetracker.google.com/issues/488927521', 'https://issuetracker.google.com/issues/560771373'],
        },
        { title: 'Blink', program: 'v8CTF 0day submission', links: ['https://issuetracker.google.com/issues/573335176'] },
      ],
      more: true,
    },
    {
      name: 'Linux KVM',
      findings: [
        { title: 'VM Escape', program: 'kvmCTF Full VM Escape', cves: ['CVE-2026-99082'], reward: null, highlight: true },
        { title: 'Guest to Host Panic', program: 'kvmCTF Host Panic', cves: ['CVE-2026-98164'], reward: null },
      ],
    },
    {
      name: 'Cloudflare',
      reward: 40_000,
      findings: [
        { title: 'Workers Remote Code Execution', count: 2 },
        { title: 'cloudflare/workerd Remote Code Execution', count: 6 },
      ],
      more: true,
    },
    {
      name: 'MongoDB',
      reward: 30_000,
      findings: [{ title: 'Remote Code Execution', count: 7 }],
      more: true,
    },
    {
      name: 'MariaDB',
      findings: [{ title: 'Remote Code Execution' }],
    },
    {
      name: 'Envoy Proxy',
      findings: [{ title: 'Unauthenticated Remote DoS', cves: ['CVE-2026-73550'] }],
    },
    {
      name: 'Chia Blockchain Network',
      findings: [{ title: 'Vulnerability Reports' }],
    },
  ] satisfies ResearchTarget[],
  projects: [
    {
      title: 'LLM orchestration for vulnerability analysis',
      summary: 'An LLM-orchestrated analysis workflow that identified a memory disclosure bug in zlib.',
    },
    {
      title: 'LLM orchestration for CTF challenges',
      summary:
        'Before general-purpose coding agents were common, a main/sub-agent system on LangChain and LangGraph that combined tool calls, web search, and brainstorming-style reasoning to solve CTF challenges.',
    },
  ] satisfies Project[],
  awards: [
    {
      year: 2026,
      entries: [
        { place: '1st', event: 'CCE 2026 Final, Overall', prize: { amount: 40_000_000, currency: 'KRW' } },
        { place: '1st', event: 'Dreamhack Invitational 2026 Qualifier', international: true },
        { place: '1st', event: 'CCE 2026 Qualifier, General Division' },
        { place: '3rd', event: 'Codegate CTF 2026', prize: { amount: 5_000_000, currency: 'KRW' } },
        { place: 'Finalist', event: 'DEF CON CTF 2026', international: true },
      ],
    },
    {
      year: 2025,
      entries: [
        { place: '1st', event: 'CyKor CTF 2025', international: true, prize: { amount: 3_000, currency: 'USD' } },
        { place: '1st', event: 'FIESTA 2025 Financial Security Threat Analysis', prize: { amount: 4_000_000, currency: 'KRW' } },
        { place: '1st', event: 'CCE 2025 Qualifier, Public Sector' },
        { place: '1st', event: 'WhiteHat Contest 2025 Qualifier, Soldier Track' },
        { place: '1st', event: 'ACDC 2025 Qualifier, Student Division' },
        { place: '1st', event: 'KoS CTF 2025' },
        { place: '2nd', event: 'CCE 2025 Final, Public Sector', prize: { amount: 6_000_000, currency: 'KRW' } },
        { place: '2nd', event: 'WhiteHat Contest 2025 Final, Soldier Track', prize: { amount: 3_000_000, currency: 'KRW' } },
        {
          place: '3rd',
          event: 'HackTheon Sejong 2025, Advanced Division',
          international: true,
          prize: { amount: 5_000_000, currency: 'KRW' },
        },
        { place: '3rd', event: 'corCTF 2025', international: true, prize: { amount: 1_337, currency: 'USD' } },
        { place: '4th', event: 'LG U+ Security Hackathon 2025', prize: { amount: 3_000_000, currency: 'KRW' } },
      ],
    },
    {
      year: 2024,
      entries: [
        { place: '1st', event: 'LG U+ Security Hackathon 2024', prize: { amount: 10_000_000, currency: 'KRW' } },
        { place: '1st', event: 'Chungcheong Regional Cybersecurity Competition 2024', prize: { amount: 3_000_000, currency: 'KRW' } },
        { place: '4th', event: 'DEF CON CTF 2024 Final', international: true },
      ],
    },
    {
      year: 2023,
      entries: [
        { place: '1st', event: 'WhiteHat Contest 2023 Junior Final', prize: { amount: 6_000_000, currency: 'KRW' } },
        { place: '1st', event: 'WhiteHat Contest 2023 Junior Qualifier' },
        { place: '1st', event: 'WACON 2023 Junior Qualifier' },
        { place: '2nd', event: 'WACON 2023 Junior Final', prize: { amount: 3_000_000, currency: 'KRW' } },
        { place: '2nd', event: 'CCE 2023 Final', prize: { amount: 2_000_000, currency: 'KRW' } },
        { place: '7th', event: 'DEF CON CTF 2023 Final', international: true },
      ],
    },
    {
      year: 2022,
      entries: [
        { place: '2nd', event: 'WhiteHat Contest 2022 Final', prize: { amount: 4_000_000, currency: 'KRW' } },
        { place: '2nd', event: 'JBU CTF 2022' },
        { place: 'Finalist', event: 'Codegate CTF 2022 Junior' },
      ],
    },
  ] satisfies { year: number; entries: Award[] }[],
  education: [
    {
      period: 'Feb 2024 — Present',
      title: 'School of Computing',
      organization: 'KAIST',
    },
    {
      period: 'Jun 2022 — Mar 2023',
      title: 'Best of the Best, 11th cohort',
      organization: 'KITRI',
      summary: 'National training program for next-generation security specialists.',
    },
  ] satisfies TimelineEntry[],
  cv: 'jinu-kim-cv.pdf',
};
