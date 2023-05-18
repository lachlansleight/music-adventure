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

//type check for branch presentation
export const isBranchPresentation = (obj: any): obj is BranchPresentation => {
    return obj.options !== undefined;
};

export interface BaseLoadable<T, U> {
    baseData: T;
    loading: boolean;
    loadedData: U | null;
}

export interface Album {
    index: string;
    albumName: string;
    artistName: string;
    description: string;
    coverUrl: string;
}

export interface Direction {
    index: string;
    direction: string;
}

export const isAlbum = (obj: Album | Direction): obj is Album => {
    return (obj as Album).albumName !== undefined;
};
