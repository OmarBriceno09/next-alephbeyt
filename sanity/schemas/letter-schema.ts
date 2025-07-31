
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
        { name: 'note_val', title: 'Note Value', type: 'string'},
        { name: 'chord', title: 'Chord', type: 'string'},
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