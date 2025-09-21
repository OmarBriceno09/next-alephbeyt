import { Script } from "@/types/Script";
import { createClient, groq } from "next-sanity";

export async function getScripts(): Promise<Script[]>{
    const client = createClient({
        projectId: "ae4t7yny",
        dataset: "production",
        apiVersion: "2025-06-27",
    });

    return client.fetch(
        groq`*[_type == "script"] | order(order_index asc){
            _id,
            _createdAt,
            title,
            order_index,
            font,
            left_to_right,
            array_setup,
            letters[]{
                letter_name,
                order_index,
                display,
                display_image{
                    asset->{
                        _id,
                        url
                    }
                },
                letter_color,
                stats{
                    letter_name,
                    name_pronounced,
                    letter_pronounced,
                    transliteration,
                    sounds_like_text,
                    sounds_like_audio{
                        asset->{
                            _id,
                            url
                        }
                    },
                    num_val,
                    variants,
                    classification,
                    note_val,
                    chord,
                },
                exp_summary,
                ftu_torah,
                ftu_word,
                definition,
                sym_associations,
                psalms119,
                gramMorph,
                imagePresentation[]{
                    image{
                        asset->{
                            _id,
                            url
                        }
                    },
                    description
                }
            } | order(order_index asc),
            exp_summary
        }`
    )
}