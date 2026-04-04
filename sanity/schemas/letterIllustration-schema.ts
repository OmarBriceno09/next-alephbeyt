const letterIllustration = {
    name: 'letterIllustration',
    title: 'Letter Illustration',
    type: 'object',
    fields: [
        { name: 'illustration_name', title: 'Illustration Name', type: 'string' },
        { name: 'order_index', title:'Order Index', type:'number',},
        { name: 'foreground_img', title: 'Foreground Image', type: 'file',
            options: {
                accept:'.webp'
            },
        }
    ],
};

export default letterIllustration;