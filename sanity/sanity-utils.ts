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
                transliteration,
                variants,
                exp_summary
            } | order(order_index asc),
            exp_summary
        }`
    )
}