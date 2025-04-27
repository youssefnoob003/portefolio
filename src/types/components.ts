/**
 * Common interfaces for components
 */

// Base layout props
export interface BaseLayoutProps {
  title?: string;
  description?: string;
  bodyClass?: string;
  image?: string;
}

// Project layout props
export interface ProjectLayoutProps extends BaseLayoutProps {
  project: {
    title: string;
    date: string;
    description?: string;
    technologies: string[];
    github?: string;
    live?: string;
  };
}

// CTF layout props
export interface CTFLayoutProps extends BaseLayoutProps {
  ctfEvent: {
    title: string;
    date: string;
    description?: string;
    tasks?: string[];
  };
}

// Section props
export interface SectionProps {
  id?: string;
  title?: string;
  className?: string;
} 