import { CardSizeEnum } from "../components/Card";
import { getVideoData, YoutubeVideo } from "./youtube";
import { YoutubeEndpoint } from "./youtube";
import getClient from "./ssrGraphQlClient";
import { DocumentNode } from "@apollo/client";
import { GetServerSidePropsContext } from "next";
import { LikeDislikeState } from "./types";
import sectionsJson from "../data/sections.json";
import {
  GraphQLQueryInput,
  MyListQuery,
  MyListQueryInput,
  WatchedQuery,
  WatchedQueryInput,
} from "./graphql";
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
  id?: string;
  query?: string;
  endpoint: YoutubeEndpoint;
  cardSize: CardSizeEnum;
};

const getGraphQlData = async (
  context: GetServerSidePropsContext,
  query: DocumentNode,
  input: GraphQLQueryInput
) => {
  const ssrGraphQlClient = getClient(context);
  try {
    const { data } = await ssrGraphQlClient.query({
      query,
      variables: {
        input,
      },
    });
    return data.stats as Array<{
      id: string;
      watched?: boolean;
      likeDislike?: LikeDislikeState;
      videoId?: string;
    }>;
  } catch (error) {
    console.error(
      "There was an error in sections.ts/getGraphQlData",
      (error as Error).message
    );
    return [] as Array<{
      id: string;
      watched?: boolean;
      likeDislike?: LikeDislikeState;
      videoId?: string;
    }>;
  }
};

const fetchSectionMembersData = async (sectionQueries: SectionQuery[]) => {
  try {
    const sections = await Promise.all(
      sectionQueries.map(async ({ query, endpoint, title, cardSize, id }) => {
        return new Promise((resolve) => {
          getVideoData({ endpoint, query, id })
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

export const getMyListSections = async (context: GetServerSidePropsContext) => {
  const likedVideoStats = await getGraphQlData(
    context,
    MyListQuery,
    MyListQueryInput
  );
  const videoIds = likedVideoStats.map((x) => x.videoId);
  const sectionQueries: SectionQuery[] = [
    {
      title: "My List",
      endpoint: YoutubeEndpoint.byVideoIds,
      cardSize: CardSizeEnum.small,
      id: videoIds.join(`%2C`),
    },
  ];

  const sections = await fetchSectionMembersData(sectionQueries);
  return sections;
};

export const getHomeSections = async (context: GetServerSidePropsContext) => {
  if (process.env.DEVELOPMENT) {
    console.log("IN DEVELOPMENT: Returning sections from sections.json");
    return sectionsJson as Section[];
  }

  const sectionQueries: SectionQuery[] = [
    {
      title: "Disney",
      query: "disney trailer official",
      endpoint: YoutubeEndpoint.search,
      cardSize: CardSizeEnum.large,
    },
  ];
  const watchedVideoStats = await getGraphQlData(
    context,
    WatchedQuery,
    WatchedQueryInput
  );
  if (watchedVideoStats && watchedVideoStats.length > 0) {
    const videoIds = watchedVideoStats.map((x) => x.videoId);
    sectionQueries.push({
      title: "Watch it Again",
      endpoint: YoutubeEndpoint.byVideoIds,
      cardSize: CardSizeEnum.small,
      id: videoIds.join(`%2C`),
    });
  }

  [
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
      cardSize: CardSizeEnum.medium,
    },
    {
      title: "Popular Videos",
      endpoint: YoutubeEndpoint.popular,
      cardSize: CardSizeEnum.large,
    },
  ].forEach((q) => sectionQueries.push(q));

  try {
    const sections = await fetchSectionMembersData(sectionQueries);
    return sections;
  } catch (error) {
    console.error((error as Error).message);
    return sectionsJson as Section[];
  }
};
