
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
        { name: 'stats', title: 'Basic Stats', type: 'letterStats'},
        { name: 'ftu_torah', title: 'First Time Used in Torah', type: 'array', of: [{type: 'block'}]},
        { name: 'ftu_word', title: 'First Time Used at beginning of a word', type: 'array', of: [{type: 'block'}]},
        { name: 'definition', title: 'Definitions', type: 'array', of: [{type: 'block'}]},
        { name: 'sym_associations', title: 'Symbolic Associations', type: 'array', of: [{type: 'block'}]},
        { name: 'psalms119', title: 'Psalms 119', type: 'array', of: [{type: 'block'}]},
        { name: 'exp_summary', title: 'General Summary', type: 'array', of: [{type: 'block'}]},
        {
            name: 'imagePresentation',
            title: 'Image Presentation',
            type: 'array',
            of:[{type: 'presImage'}],
        },
    ],
};

export default letter;