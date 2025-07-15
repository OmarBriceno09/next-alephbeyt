import { PortableTextBlock } from "sanity";

interface SanityAsset {
    _id: string;
    url: string;
}

export type Letter = {
    _id: string;
    _createdAt: Date;
    letter_name: string;
    order_index: Int16Array;
    display: string;
    display_image: {
        asset?: SanityAsset;
    };
    transliteration: string;
    variants: string;
    exp_summary: PortableTextBlock[];
}