import { PortableTextBlock } from "sanity";

interface SanityAsset {
    _id: string;
    url: string;
}

export type LetterIllustration = {
    //sanity variables
    _id: string;
    _createdAt: Date;
    illustration_name: string;
    order_index: number;
    foreground_img: {
        asset?: SanityAsset;
    };
}