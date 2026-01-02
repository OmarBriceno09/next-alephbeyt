import fs from "fs";
import {parse} from "csv-parse/sync";
import sanityClient from "@sanity/client";

//Get sanity client:
const client = sanityClient({
    projectId: "MY_ID",
    dataset: "production",
    token: process.env.SANITY_WRITE_TOKEN,
    apiVersion: "2024-01-01",
    useCdn: false,
});