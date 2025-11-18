import { getPermalink, getBlogPermalink, getAsset } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'Home',
      href: getPermalink('/'),
      /*links: [
        {
          text: 'SaaS',
          href: getPermalink('/homes/saas'),
        },
        {
          text: 'Startup',
          href: getPermalink('/homes/startup'),
        },
        {
          text: 'Mobile App',
          href: getPermalink('/homes/mobile-app'),
        },
        {
          text: 'Personal',
          href: getPermalink('/homes/personal'),
        },
      ],*/
    },
    {
      text: 'Workshop',
      links: [
        {
          text: 'Organizing Committee',
          href: getPermalink('/workshop/committee'),
        },
        {
          text: 'Previous IWAENCs',
          href: 'https://www.iwaenc.org/proceedings.html',
        },
      ],
    },
    {
      text: 'Calls and Submissions',
      links: [
        {
          text: 'Call for Papers',
          href: getPermalink('/landing/cfp'),
        },
        {
          text: 'Call for Special Sessions',
          href: getPermalink('/landing/cfss'),
        },
      ],
    },
    {
      text: 'Local Information',
      links: [
        {
          text: 'Accommodation',
          href: getPermalink('/localinfo/accommodation'),
        },
        {
          text: 'About Cremona',
          href: getPermalink('/localinfo/aboutcr'),
        },
        {
          text: 'Travel Information',
          href: getPermalink('/localinfo/travel'),
        },
      ],
    },
    /*{
      text: 'Blog',
      links: [
        {
          text: 'Blog List',
          href: getBlogPermalink(),
        },
        {
          text: 'Article',
          href: getPermalink('get-started-website-with-astro-tailwind-css', 'post'),
        },
        {
          text: 'Article (with MDX)',
          href: getPermalink('markdown-elements-demo-post', 'post'),
        },
        {
          text: 'Category Page',
          href: getPermalink('tutorials', 'category'),
        },
        {
          text: 'Tag Page',
          href: getPermalink('astro', 'tag'),
        },
      ],
    },
    {
      text: 'Local Information',
      href: getPermalink('localinfo', 'local'),
    },*/
  ],
  // actions: [{ text: 'Download', href: 'https://github.com/onwidget/astrowind', target: '_blank' }],
};

export const footerData = {
  links: [
    {
      title: 'Workshop',
      links: [
        { text: 'Organizing Committee', href: '/workshop/committee' },
        { text: 'Previous IWAENCs', href: 'https://www.iwaenc.org/proceedings.html' },
      ],
    },
    {
      title: 'Calls and Submissions',
      links: [
        { text: 'Call for Papers', href: '/landing/cfp' },
        { text: 'Call for Special Sessions', href: '/landing/cfss' },
      ],
    },
    {
      title: 'Local Information',
      links: [
        { text: 'Accommodation', href: '/localinfo/accommodation' },
        { text: 'About Cremona', href: '/localinfo/aboutcr' },
        { text: 'Travel Information', href: '/localinfo/travel' },
      ],
    },
  ],
  secondaryLinks: [
    /*{ text: 'Terms', href: getPermalink('/terms') },
    { text: 'Privacy Policy', href: getPermalink('/privacy') },*/
  ],
  socialLinks: [
    { ariaLabel: 'X', icon: 'tabler:brand-x', href: '#' },
    { ariaLabel: 'Instagram', icon: 'tabler:brand-instagram', href: '#' },
    { ariaLabel: 'LinkedIn', icon: 'tabler:brand-linkedin', href: '#' },
    // { ariaLabel: 'Facebook', icon: 'tabler:brand-facebook', href: '#' },
    // { ariaLabel: 'RSS', icon: 'tabler:rss', href: getAsset('/rss.xml') },
    // { ariaLabel: 'Github', icon: 'tabler:brand-github', href: 'https://github.com/onwidget/astrowind' },
  ],
  footNote: `
    <span class="w-5 h-5 md:w-6 md:h-6 md:-mt-0.5 bg-cover mr-1.5 rtl:mr-0 rtl:ml-1.5 float-left rtl:float-right rounded-sm bg-[url(~/assets/favicons/favicon-ispl.ico)]"></span>
    Made by <a class="text-blue-600 underline dark:text-muted" href="https://ispl.deib.polimi.it"> IWAENC 2026 - Polimi ISPL</a> · All rights reserved.
  `,
};
