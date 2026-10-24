import { interviewCovers } from "@/constants";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { getTechIconUrl } from "@/lib/tech";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const checkIconExists = async (url: string) => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok; // Returns true if the icon exists
  } catch {
    return false;
  }
};

export const getTechLogos = async (techArray: string[]) => {
  return Promise.all(
      techArray.map(async (tech) => {
        const url = getTechIconUrl(tech);
        return {
          tech,
          url: url && (await checkIconExists(url)) ? url : "/tech.svg",
        };
      })
  );
};

export const getRandomInterviewCover = () => {
  const randomIndex = Math.floor(Math.random() * interviewCovers.length);
  return `/covers${interviewCovers[randomIndex]}`;
};