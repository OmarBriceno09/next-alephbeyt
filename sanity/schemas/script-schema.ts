
const script = {
    name: 'script',
    title: 'Script',
    type: 'document',
    fields: [
        { name: 'title', title: 'Script Title', type: 'string' },
        { name: 'order_index', title:'Order Index', type:'number',},
        { name: 'font', title: 'Font', type: 'string' },
        { name: 'left_to_right', title: 'Left to Right?', type: 'boolean'},
        { name: 'array_setup', title: 'Array Setup', type: 'string', description: 'int sequence of letters per row denoted by "," (i.e: "7,3,7")', initialValue:'7,3,7'},
        {
            name: 'letters',
            title: 'Letters',
            type: 'array',
            of:[{type: 'letter'}],
        },
        { name: 'exp_summary', title: 'Expanded Summary', type: 'array', of: [{type: 'block'}]},
    ],
};

export default script;