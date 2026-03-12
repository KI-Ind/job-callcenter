export interface Education {
  degree: string;
  institution: string;
  startYear: string;
  endYear?: string;
  description?: string;
}

export interface Experience {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description?: string;
  current?: boolean;
}

export interface Language {
  name: string;
  level: string;
}

export interface Address {
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

export interface Resume {
  _id?: string;
  filename: string;
  fileType?: string;
  fileSize?: number;
  uploadDate: string;
  url: string;
  key?: string;
}

export interface ProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address: Address; // Make address required but with optional fields
  city?: string;
  postalCode?: string;
  summary?: string;
  resumeUrl?: string;
  education: Education[];
  experience: Experience[];
  skills: string[];
  languages: Language[];
  title?: string;
  resume?: Resume | null;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    website?: string;
  };
  [key: string]: any; // Index signature to allow dynamic access
}
