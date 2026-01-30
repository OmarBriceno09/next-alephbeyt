const mapTreeNode = {
    name: 'mapTreeNode',
    title: 'Map Tree Node',
    type: 'document',
    fields: [
        { name: 'title', title: 'Script Title', type: 'string' },
        { name: 'order_index', title:'Order Index', type:'number',},
        { name: 'age_pos', title:'Age Pos', type:'number',},
        { name: 'points_to', title:'Points To', type:'string', description: 'int sequence where script/node points to'},
    ],
    orderings: [
        {
            title: 'Order Index (Ascending)',
            name: 'orderIndexAsc',
            by: [
                {field: 'order_index', direction: 'asc'}
            ]
        },
        {
            title: 'Order Index (Descending)',
            name: 'orderIndexDesc',
            by: [
                {field: 'order_index', direction: 'desc'}
            ]
        },
    ]
};

export default mapTreeNode;