import { CardSizeEnum } from "../components/Card";
import { getVideoData, YoutubeVideo } from "./youtube";
import { YoutubeEndpoint } from "./youtube";
import sectionsJson from "../data/sections.json";
// import fs from "fs";

export type Section = {
  title: string;
  cardSize: CardSizeEnum;
  list: YoutubeVideo[];
  error: {
    code: number;
    message: string;
    domain: string;
    reason: string;
  };
};

type SectionQuery = {
  title: string;
  query?: string;
  endpoint: YoutubeEndpoint;
  cardSize: CardSizeEnum;
};

export const getSections = async () => {
  if (process.env.DEVELOPMENT) {
    console.log("IN DEVELOPMENT: Returning sections from sections.json");
    return sectionsJson as Section[];
  }

  const sectionQueries: SectionQuery[] = [
    {
      title: "Disney",
      query: "disney trailer official",
      endpoint: YoutubeEndpoint.search,
      cardSize: CardSizeEnum.small,
    },
    {
      title: "Programming",
      query: "programming",
      endpoint: YoutubeEndpoint.search,
      cardSize: CardSizeEnum.small,
    },
    {
      title: "Music Production",
      query: "music production",
      endpoint: YoutubeEndpoint.search,
      cardSize: CardSizeEnum.small,
    },
    {
      title: "Popular Videos",
      endpoint: YoutubeEndpoint.popular,
      cardSize: CardSizeEnum.small,
    },
  ];

  try {
    const sections = await Promise.all(
      sectionQueries.map(async ({ query, endpoint, title, cardSize }) => {
        return new Promise((resolve) => {
          getVideoData({ endpoint, query })
            .then((list) => {
              resolve({ title, cardSize, list });
            })
            .catch((error) => {
              resolve({
                title,
                cardSize,
                list: [],
                error: {
                  code: error?.code || null,
                  message: (error as Error).message,
                  reason: error?.reason || null,
                },
              });
            });
        });
      })
    );

    // fs.writeFile(
    //   "./my-sections.json",
    //   JSON.stringify(sections),
    //   "utf8",
    //   (err) => {
    //     console.log({ err });
    //   }
    // );

    return sections as Section[];
  } catch (error) {
    console.error(
      "There was an error in getSections: ",
      (error as Error).message
    );
    throw error;
  }
};
