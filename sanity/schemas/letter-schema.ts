
const letter = {
    name: 'letter',
    title: 'Letter',
    type: 'object',
    fields: [
        { name: 'letter_name', title: 'Letter Name', type: 'string' },
        { name: 'order_index', title:'Order Index', type:'number',},
        { name: 'display', title: 'Display Character (Text)', type: 'string' },
        {
            name:'display_image',
            title: 'Display Image',
            type: 'file',
            options: {
                accept:'.png'
            },
        },
        { name: 'transliteration', title: 'Transliteration', type: 'string' },
        { name: 'variants', title: 'Variants', type: 'string' },
        { name: 'exp_summary', title: 'Expanded Summary', type: 'array', of: [{type: 'block'}]},
        // Add any other fields you need (e.g., SVG, audio, etc.)
    ],
};

export default letter;