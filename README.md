# Alephbeyt

Alephbeyt is an interactive linguistic resource that allows users to explore and compare characters across multiple historical scripts through a dynamic interface. Made in association with ***Learning Inspired***, this is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app), the content is managed through the [Sanity.io](https://www.sanity.io/) CMS , and deployed using the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js. [8-13-2025]

## User-end

Go to [https://www.alephbeyt.org/](https://www.alephbeyt.org/) to view the site. Switching the script will play a short die animation that will change the faces presenting the characters or of the script's respective alphabet. Each character is classified as labeled: Aleph, Beyt, Gimel, etc... Clicking on the die will open a modal that presents information on the character, including the etymology, definitions, and symbolic associations. This is just one of the available functions of the site; soon I will implement a map modal that shows the origins of the selected script, and other modals that enhance the interactive learning experience.

## Structure

**Saniti.io Schemas:**

- **script** - contains language/script information, and an array of **letter**s that represents the characters of the  script's alphabet.

- **letter** - contains a **letterStats**, summaries, definitions, and an image presentation composed of an array of **presImage**s

- **letterStats** - this schema contains all linguistic stats of it's respective letter.

- **presImage** - this schema stores and image url and a description to be rendered along with it.

**Front End:**

- All of the mentioned schemas have a front-end type object counterpart that is sourced from *next-alephbeyt/types/*

- *next-alephbeyt/sanity/sanity-utils.ts* is responsible for fetching the structured information from the schemas and constructing the types where information will be sourced from.

- *next-alephbeyt/app/admin/* contains the page where devs can upload/edit the content of the site. 

- *next-alephbeyt/app/components/* is where the magic happens. The dice are rendered and given functionality and animations responsive to user interaction.

- *next-alephbeyt/public/* contains the static assets that the site uses. This is information that we don't need to have stored in Sanity.io, like fonts, and data structures that define unchanging features of the site like associated character colors, etc.