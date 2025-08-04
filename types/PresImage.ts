import { PortableTextBlock } from "sanity";

interface SanityAsset {
    _id: string;
    url: string;
}

export type PresImage = {
    _id: string;
    _createdAt: Date;
    image: {
        asset?: SanityAsset;
    };
    description: PortableTextBlock[];
}