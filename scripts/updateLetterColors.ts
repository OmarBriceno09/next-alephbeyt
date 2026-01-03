import fs from "fs";

import {parse} from "csv-parse/sync";
import { createClient, groq } from "next-sanity";

// 1. create client, same as the one in sanity-utils.ts. This will not run when the site is launched
const client = createClient({
    projectId: "ae4t7yny",
    dataset: "production",
    token: process.env.SANITY_WRITE_TOKEN,
    apiVersion: "2025-06-27",
    useCdn: false
});

// 2. Read + parse CSV
type LetterColorRow = {
    order_index: string;
    color: string;
};

type LetterNameDisplay = {
    order_index: number;
    letter_name: string;
    char: string;
}

type ScriptLettersMap = Record<string, LetterNameDisplay[]>;

type LetterNameDisplayRow = {
    letter_name: string;
    script_title: string;
    char: string;
}

function loadColorMap(csvPath: string): Map<number, string> {
  const csvText = fs.readFileSync(csvPath, "utf8");

  const records = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as LetterColorRow[];

  const map = new Map<number, string>();

  for (const row of records) {
    const index = Number(row.order_index);
    const color = row.color;

    if (!Number.isNaN(index) && color) {
      map.set(index, color);
    }
  }

  return map;
}

function loadScriptMap(csvPath: string): ScriptLettersMap {
    const csvText = fs.readFileSync(csvPath, "utf8");

    const records = parse(csvText, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
    }) as LetterNameDisplayRow[];

    const scriptsMap: ScriptLettersMap = {}

    for (const row of records) {
        const script = row.script_title

        if (!scriptsMap[script]) {
            scriptsMap[script] = []
        }

        const order_index = scriptsMap[script].length

        scriptsMap[script].push({
            //_key: `${script}-${row.letter_name}`.toLowerCase().replace(/\s+/g, "-"),
            letter_name: row.letter_name,
            char: row.char,
            order_index
        })
    }

  return scriptsMap;
}



// 3. Fetch all scripts
async function updateScripts() {
    const colorMap = loadColorMap("./public/data/LettersShared.csv");
    
    const scripts = await client.fetch(groq`
        *[_type == "script"] | order(order_index asc){
            _id,
            _createdAt,
            title,
            letters[]{
                _key,
                letter_name,
                order_index,
                display,
                letter_color
            } | order(order_index asc)
        }
    `);

    for (const script of scripts) {
        let didChange = false;

        console.log(script.title);

        const updatedLetters = script.letters.map((letter: {
            letter_name:string,
            order_index:number, 
            display:string,
            letter_color:string
        }) => {
            const newColor = colorMap.get(letter.order_index);

            if (!newColor || letter.letter_color === newColor) {
                return letter;
            }

            didChange = true;
            return {
                ...letter,
                letter_color: newColor,
            };
        });

        if (!didChange) continue;
        //console.log(updatedLetters);

        /*await client
        .patch(script._id)
        .set({ letters: updatedLetters })
        .commit();

        console.log(`✅ Updated ${script._id}`);*/
  }
}

//updateScripts().catch(console.error);
async function updateTitlesChars() {
    const ScriptMap = loadScriptMap("./public/data/AlephBeytDatabase.csv");

    const scripts = await client.fetch(groq`
        *[_type == "script"] | order(order_index asc){
            _id,
            _createdAt,
            title,
            letters[]{
                _key,
                letter_name,
                order_index,
                display,
                letter_color
            } | order(order_index asc)
        }
    `);

    /*for (const [scriptTitle, letters] of Object.entries(scriptMap)) {
        console.log(scriptTitle, letters[0]);
    }*/

    for (const script of scripts) {
        let didChange = false;

        const letterDisplayList = ScriptMap[script.title];
        if (!letterDisplayList) continue;

        const updatedLetters = script.letters.map((letter: {
            _key: string,
            letter_name:string,
            order_index:number, 
            display:string,
        }) => {
            const newName = letterDisplayList[letter.order_index].letter_name;
            const newDisplay = letterDisplayList[letter.order_index].char;
            const newKey = `${script.title}-${newName}`.toLowerCase().replace(/\([^)]*\)/g, "")   // remove parentheses + content
                                                                    .replace(/[^a-z0-9]+/g, "-") // non-alphanumeric → dash
                                                                    .replace(/^-+|-+$/g, "")     // trim dashes

            if (letter.letter_name != null) {
                //console.log("script: "+script.title+", name: "+letter.letter_name + ", _key: " + letter._key);
                return letter;
            }
            //console.log(newKey);
            didChange = true;
            return {
                ...letter,
                _key: newKey,
                letter_name: newName,
                display: newDisplay,
            };
        });

        if (!didChange) continue;
        console.log(script.title);
        //console.log(updatedLetters);

        await client
        .patch(script._id)
        .set({ letters: updatedLetters })
        .commit();

        console.log(`✅ Updated ${script._id}`);
    }

   // console.log(lettersByScript.get("Ge'ez"));
    /*try {
        const res = await client.fetch(`*[_type == "script"][0]._id`);
        console.log("Token works. Found doc: ", res);
    } catch (err) {
        console.error("Token failed: ", err);
    }*/
}

updateTitlesChars();