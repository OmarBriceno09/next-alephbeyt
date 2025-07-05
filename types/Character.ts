import { PortableTextBlock } from "sanity";

interface SanityAsset {
    _id: string;
    url: string;
}

export type Character = {
    _id: string;
    _createdAt: Date;
    letter_name: string;
    slug: string;
    order_index: Int16Array;
    char_color: string;
    modern_char: {
        asset?: SanityAsset;
    };
    latin_char: string;
    transliteral: string;
    extended_summary: PortableTextBlock[];
}