import { PortableTextBlock } from "sanity";

export type Character = {
    _id: string;
    _createdAt: Date;
    letter_name: string;
    slug: string;
    order_index: Int16Array;
    modern_char: string;
    latin_char: string;
    transliteral: string;
    extended_summary: PortableTextBlock[];
}