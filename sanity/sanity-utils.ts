import { Character } from "@/types/Character";
import { createClient, groq } from "next-sanity";

export async function getCharacters(): Promise<Character[]>{
    const client = createClient({
        projectId: "ae4t7yny",
        dataset: "production",
        apiVersion: "2025-06-27",
    });

    return client.fetch(
        groq`*[_type == "character"] | order(order_index asc){
            _id,
            _createdAt,
            letter_name,
            "slug": slug.current,
            order_index,
            modern_char {
                asset->{
                    _id,
                    url
                }
            },
            char_color,
            latin_char,
            transliteral,
            extended_summary
        }`
    ) 
}