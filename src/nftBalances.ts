import {
    GatewayApiClient,
    ResourceAggregationLevel,
} from '@radixdlt/babylon-gateway-api-sdk';
import { NftBalance, ResourceInfo } from './types';
import {
    extractStringArrayMetadata,
    extractStringMetadata,
    extractUrlMetadata,
} from './data_extractors/metadata';
import { extractStringNftData } from './data_extractors/nftData';

export async function getNonFungibleBalancesForAccount(
    gatewayApi: GatewayApiClient,
    address: string
): Promise<NftBalance[]> {
    // Define request for non-fungible resources
    const request = {
        address: address,
        aggregation_level: ResourceAggregationLevel.Vault,
        opt_ins: {
            non_fungible_include_nfids: true,
        },
    };

    // Fetch first page of non-fungible resources
    const nonFungibles =
        await gatewayApi.state.innerClient.entityNonFungiblesPage({
            stateEntityNonFungiblesPageRequest: request,
        });

    // Fetch additional pages if they exist
    let next_cursor_non_fungibles = nonFungibles.next_cursor;
    while (next_cursor_non_fungibles) {
        const nextBalances =
            await gatewayApi.state.innerClient.entityNonFungiblesPage({
                stateEntityNonFungiblesPageRequest: {
                    ...request,
                    cursor: next_cursor_non_fungibles,
                    at_ledger_state: {
                        state_version: nonFungibles.ledger_state.state_version,
                    },
                },
            });
        next_cursor_non_fungibles = nextBalances.next_cursor;
        nonFungibles.items.push(...nextBalances.items);
    }

    // Get token addresses and fetch token details
    const tokenAddresses = nonFungibles.items.map(
        (item) => item.resource_address
    );
    const tokenInfoItems =
        await gatewayApi.state.getEntityDetailsVaultAggregated(tokenAddresses);

    // Process non-fungible results
    const nonFungibleResults = nonFungibles.items.flatMap((item) => {
        if (item.aggregation_level !== ResourceAggregationLevel.Vault)
            throw new Error('Unexpected aggregation level');

        const tokenInfoItem = tokenInfoItems.find(
            (tokenInfo) => tokenInfo.address == item.resource_address
        );
        if (!tokenInfoItem) return [];
        if (tokenInfoItem?.details?.type != 'NonFungibleResource') return [];

        const tokenName = extractStringMetadata(tokenInfoItem.metadata, 'name');
        const tokenDescription = extractStringMetadata(
            tokenInfoItem.metadata,
            'description'
        );
        const tokenSymbol = extractStringMetadata(
            tokenInfoItem.metadata,
            'symbol'
        );
        const iconUrl = extractUrlMetadata(tokenInfoItem.metadata, 'icon_url');
        const infoUrl = extractUrlMetadata(tokenInfoItem.metadata, 'info_url');
        const tags = extractStringArrayMetadata(tokenInfoItem.metadata, 'tags');

        const nonFungibleIds = item.vaults.items.flatMap(
            (item) => item.items || []
        );
        const resourceInfo: ResourceInfo = {
            resourceAddress: item.resource_address,
            name: tokenName,
            description: tokenDescription,
            symbol: tokenSymbol,
            iconUrl: iconUrl,
            infoUrl: infoUrl,
            tags,
        };
        return (async (): Promise<NftBalance> => {
            if (nonFungibleIds.length == 0) {
                return {
                    resourceInfo,
                    nftBalance: [],
                };
            }
            const nftData = await gatewayApi.state.innerClient.nonFungibleData({
                stateNonFungibleDataRequest: {
                    non_fungible_ids: nonFungibleIds,
                    resource_address: item.resource_address,
                    at_ledger_state: {
                        state_version: nonFungibles.ledger_state.state_version,
                    },
                },
            });

            const parsed = nftData.non_fungible_ids.map((item) => {
                const keyImageUrl = extractStringNftData(item, 'key_image_url');
                const name = extractStringNftData(item, 'name');
                const description = extractStringNftData(item, 'description');
                return {
                    id: item.non_fungible_id,
                    keyImageUrl,
                    name,
                    description,
                };
            });

            return {
                resourceInfo,
                nftBalance: parsed,
            } as NftBalance;
        })();
    });

    return Promise.all(nonFungibleResults);
}
