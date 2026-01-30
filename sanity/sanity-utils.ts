import { Script } from "@/types/Script";
import { MapTreeNode } from "@/types/MapTreeNode";
import { createClient, groq } from "next-sanity";

export async function getAlephBeytData(): 
Promise<{
    scripts:Script[], 
    mapTreeNodes:MapTreeNode[]
}>{
    const client = createClient({
        projectId: "ae4t7yny",
        dataset: "production",
        apiVersion: "2025-06-27",
    });

    const scripts = await client.fetch(
        groq`*[_type == "script"] | order(order_index asc){
            _id,
            _createdAt,
            title,
            order_index,
            age_pos,
            points_to,
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
    );

    const mapTreeNodes = await client.fetch(
        groq`*[_type == "mapTreeNode"] | order(order_index asc){
            _id,
            _createdAt,
            title,
            order_index,
            age_pos,
            points_to,
        }`
    );


    return new Promise((resolve) => {
        setTimeout(() =>{
            const fetchedData = {
                scripts:scripts, 
                mapTreeNodes:mapTreeNodes
            };
            resolve(fetchedData);
        }, 1000);
    });
}