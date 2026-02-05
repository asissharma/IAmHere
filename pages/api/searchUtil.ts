import Fuse from 'fuse.js';

export const performSearch = (nodes: any[], query: string) => {
    if (!query) return [];

    // Flatten the tree for search
    const flatten = (list: any[]): any[] => {
        return list.reduce((acc, node) => {
            const children = node.children ? flatten(node.children) : [];
            return [...acc, { ...node, children: [] }, ...children];
        }, []);
    };

    const flatNodes = flatten(nodes);

    const options = {
        keys: ['title', 'content', 'tags'],
        threshold: 0.3,
        distance: 100
    };

    const fuse = new Fuse(flatNodes, options);
    return fuse.search(query).map(result => result.item);
};
