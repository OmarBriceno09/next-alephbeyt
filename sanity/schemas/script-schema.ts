
const script = {
    name: 'script',
    title: 'Script',
    type: 'document',
    fields: [
        { name: 'title', title: 'Script Title', type: 'string' },
        { name: 'order_index', title:'Order Index', type:'number',},
        { name: 'font', title: 'Font', type: 'string' },
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