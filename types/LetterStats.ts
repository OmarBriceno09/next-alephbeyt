import { PortableTextBlock } from "sanity";

interface SanityAsset {
    _id: string;
    url: string;
}

export type LetterStats = {
    _id: string;
    _createdAt: Date;
    letter_name: string;
    name_pronounced: string;
    display: string;
    letter_pronounced: string;
    transliteration: string;
    sounds_like_text: PortableTextBlock[];
    sounds_like_audio: {
        asset?: SanityAsset;
    }
    num_val: string;
    variants: string;
    classification: string;
    note_val: string;
    chord: string;
}