export type EventItem = {
  id: string;
  title: string;
  slug: string;
  date: string;
  time: string;
  location: string;
  url?: string;
  description?: string;
  image: string;
};

export const events: EventItem[] = [
  {
    id: "nextjs-conf-2025",
    title: "Next.js Conf",
    slug: "nextjs-conf-2025",
    date: "2025-10-15",
    time: "09:00 PDT",
    location: "Online / San Francisco, CA",
    url: "https://nextjs.org/conf",
    description:
      "Official Next.js conference — talks, workshops, and previews of the Next.js roadmap.",
    image: "/images/event-full.png",
  },
  {
    id: "react-summit-2026",
    title: "React Summit",
    slug: "react-summit-2026",
    date: "2026-03-12",
    time: "10:00 CET",
    location: "Amsterdam, Netherlands",
    url: "https://reactsummit.com/",
    description:
      "Large community conference focused on React, React Native and the broader ecosystem.",
    image: "/images/event1.png",
  },
  {
    id: "kubecon-2026",
    title: "KubeCon + CloudNativeCon",
    slug: "kubecon-2026",
    date: "2026-05-04",
    time: "09:30 PDT",
    location: "San Diego, CA",
    url: "https://www.cncf.io/kubecon-cloudnativecon/",
    description:
      "The flagship cloud-native conference covering Kubernetes, CNCF projects, and best practices.",
    image: "/images/event2.png",
  },
  {
    id: "jsconf-eu-2026",
    title: "JSConf EU",
    slug: "jsconf-eu-2026",
    date: "2026-04-20",
    time: "09:00 CEST",
    location: "Berlin, Germany",
    url: "https://jsconf.eu/",
    description:
      "Independent JavaScript conference with a focus on community-driven talks and workshops.",
    image: "/images/event3.png",
  },
  {
    id: "aws-reinvent-2025",
    title: "AWS re:Invent",
    slug: "aws-reinvent-2025",
    date: "2025-11-26",
    time: "08:00 PST",
    location: "Las Vegas, NV",
    url: "https://reinvent.awsevents.com/",
    description:
      "AWS's annual conference showcasing cloud innovations, training, and partner exhibitions.",
    image: "/images/event4.png",
  },
  {
    id: "hackmit-2026",
    title: "HackMIT",
    slug: "hackmit-2026",
    date: "2026-01-10",
    time: "18:00 EST",
    location: "Cambridge, MA",
    url: "https://hackmit.org/",
    description:
      "One of the largest student-run hackathons — beginner friendly with strong mentorship.",
    image: "/images/event5.png",
  },
  {
    id: "ethglobal-2026",
    title: "ETHGlobal (Hackathon)",
    slug: "ethglobal-2026",
    date: "2026-02-14",
    time: "12:00 GMT",
    location: "London, UK",
    url: "https://ethglobal.co/",
    description:
      "Global series of blockchain hackathons and workshops for builders in the Web3 space.",
    image: "/images/event6.png",
  },
];

export default events;
