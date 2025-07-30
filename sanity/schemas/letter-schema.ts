
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
        { name: 'name_pronounced', title: 'Name Pronounced', type: 'string' },
        { name: 'letter_pronounced', title: 'Letter Pronounced', type: 'string' },
        { name: 'transliteration', title: 'Transliteration', type: 'string' },
        { name: 'sounds_like_text', title: 'Sounds Like (text)', type: 'string'},
        { 
            name: 'sounds_like_audio', 
            title: 'Sounds Like (audio)', 
            type: 'file',
            options: {
                accept: 'audio/*'
            },
        },
        { name: 'num_val', title: 'Numerical Value', type: 'string'},
        { name: 'variants', title: 'Variants', type: 'string' },
        { name: 'classification', title: 'Classification', type: 'string'},
        { name: 'exp_summary', title: 'Expanded Summary', type: 'array', of: [{type: 'block'}]},
        // Add any other fields you need (e.g., SVG, audio, etc.)
    ],
};

export default letter;