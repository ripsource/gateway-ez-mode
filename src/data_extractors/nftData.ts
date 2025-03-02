import { StateNonFungibleDetailsResponseItem } from '@radixdlt/babylon-gateway-api-sdk';

export function extractStringNftData(
    nftDataItem: StateNonFungibleDetailsResponseItem,
    fieldname: string
): string | null {
    if (!nftDataItem.data) return null;
    if (nftDataItem.data.programmatic_json.kind !== 'Tuple') return null;
    const field = nftDataItem.data.programmatic_json.fields.find(
        (field) => field.field_name == fieldname
    );
    if (!field) return null;
    if (field.kind !== 'String') return null;
    return field.value;
}
