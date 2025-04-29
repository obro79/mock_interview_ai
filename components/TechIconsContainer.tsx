import { getTechLogos } from "@/lib/utils";
import DisplayTechIcons from "./DisplayTechIcons";

interface TechIconsContainerProps {
    techStack: string[];
}

const TechIconsContainer = async ({ techStack }: TechIconsContainerProps) => {
    const techIcons = await getTechLogos(techStack);
    return <DisplayTechIcons techIcons={techIcons} />;
};

export default TechIconsContainer; 