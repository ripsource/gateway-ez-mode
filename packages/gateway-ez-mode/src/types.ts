export interface ResourceInfo {
    resourceAddress: string;
    name: string | null;
    description: string | null;
    symbol: string | null;
    iconUrl: string | null;
    infoUrl: string | null;
    tags: string[] | null;
}

export interface FungibleResourceBalance {
    resourceInfo: ResourceInfo;
    balance: string;
}

/** Represents the balances of one NFT resource */
export interface NftBalance {
    resourceInfo: ResourceInfo;
    nftBalance: NftInfo[];
}

/** Represents one NFT */
export interface NftInfo {
    name: string | null;
    description: string | null;
    keyImageUrl: string | null;
    id: string;
}
