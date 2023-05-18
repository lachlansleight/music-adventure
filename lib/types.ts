export interface Album {
    albumName: string;
    artistName: string;
    description?: string;
}

export interface AdventureSetup {
    startingAlbum: Album;
    criteria: string[];
}

export interface BranchPresentation extends Album {
    options: {
        index: string;
        description: string;
    }[];
}

export interface OptionsPresentation {
    albums: (Album & { index: string })[];
}

export interface DiscogsAlbum {
    country: string;
    year: string;
    format: string[];
    label: string[];
    genre: string[];
    style: string[];
    id: number;
    barcode: string[];
    master_id: number;
    master_url: string;
    uri: string;
    catno: string;
    title: string;
    thumb: string;
    cover_image: string;
    resource_url: string;
    formats: {
        name: string;
        descriptions: string[];
    }[];
}
