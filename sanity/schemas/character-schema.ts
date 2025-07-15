import { Rule } from '@sanity/types';

const character = {
    name: 'character',
    title: 'Character',
    type: 'document',
    fields: [
        {name: 'letter_name', title: 'Letter Name', type: 'string'},
        {name: 'slug', title: 'Slug', type: 'slug',options: {source:'letter_name'}},
        {name: 'order_index', title:'Order Index', type:'number',},
        {
            name: 'char_color',
            title: 'Color',
            type: 'string',
            description: 'Hex color code like#fcd97d',
            validation: (Rule:Rule) => 
                Rule.regex(/^#([0-9a-fA-F]{3}){1,2}$/, {
                    name: 'hex color',
                    invert: false,
              }),
        },
        {
            name: 'modern_char',
            title: 'Modern Character',
            type: 'file',
            options: {
                accept:'.svg',
            },
        },
        {name: 'latin_char', title: 'Latin Characters', type: 'string'},
        {name: 'transliteral', title: 'Transliteral', type: 'string'},
        {
            name: 'extended_summary',
            title: 'Extended Summary',
            type: 'array',
            of: [{type: 'block'}]
        }
    ],
};

export default character;