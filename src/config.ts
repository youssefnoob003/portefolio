export const SITE_INFO = {
  TITLE: "Network & Security Portfolio",
  DESCRIPTION: "Network Engineering & Cybersecurity Portfolio"
};

export const ROUTES = {
  HOME: "/",
  PROJECTS: "/projects",
  LABS: "/labs",
  CTF_EVENTS: "/ctf-events",
  CONTACT: "/#contact"
};

export const DATE_CONFIG = {
  LOCALE: "en-US",
  DEFAULT_FORMAT: {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  } as const
};

export const FORM_CONFIG = {
  ENDPOINT: 'https://formsubmit.co/youssef.charfeddine@insat.ucar.tn',
  SUCCESS_TIMEOUT: 5000
};