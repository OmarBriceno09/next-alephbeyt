const presImage = {
    name: 'presImage',
    title: 'Presentation Image',
    type: 'object',
    fields: [
        { 
            name:'image',
            title: 'Image',
            type: 'file',
            options: {
                accept:'.png .jpg .jpeg'
            },
        },
        { 
            name: 'description', 
            title: 'Description', 
            type: 'array', 
            of: [{type: 'block'}]},
    ],
};

export default presImage;