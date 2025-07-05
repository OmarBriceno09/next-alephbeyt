import {defineConfig} from 'sanity';
import {deskTool} from 'sanity/desk';
import schemas from './sanity/schemas';

const config = defineConfig({
    projectId: "ae4t7yny",
    dataset: "production",
    title: "The AlephBeyt: Exploring the Genealogy of the Word",
    apiVersion: "2025-06-27",
    basePath: "/admin",
    plugins: [deskTool()],
    schema: {types: schemas}
})

export default config;