const letterStats = {
    name: 'letterStats',
    title: 'Letter Stats',
    type: 'object',
    fields: [
        { name: 'letter_name', title: 'Letter Name', type: 'string' },
        { name: 'name_pronounced', title: 'Name Pronounced', type: 'string' },
        { name: 'letter_pronounced', title: 'Letter Pronounced', type: 'string' },
        { name: 'transliteration', title: 'Transliteration', type: 'string' },
        { name: 'sounds_like_text', title: 'Sounds Like (text)', type: 'array', of: [{type: 'block'}]},
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
    ],
};

export default letterStats;