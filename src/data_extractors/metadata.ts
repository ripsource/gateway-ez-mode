import { EntityMetadataCollection } from '@radixdlt/babylon-gateway-api-sdk';

export function extractStringMetadata(
    metadataItems: EntityMetadataCollection,
    key: string
): string | null {
    const item = metadataItems.items.find((item) => item.key == key);
    if (!item) return null;
    if (item.value.typed.type !== 'String') return null;
    return item.value.typed.value;
}

export function extractUrlMetadata(
    metadataItems: EntityMetadataCollection,
    key: string
): string | null {
    const item = metadataItems.items.find((item) => item.key == key);
    if (!item) return null;
    if (item.value.typed.type !== 'Url') return null;
    return item.value.typed.value;
}

export function extractStringArrayMetadata(
    metadataItems: EntityMetadataCollection,
    key: string
): string[] | null {
    const item = metadataItems.items.find((item) => item.key == key);
    if (!item) return null;
    if (item.value.typed.type !== 'StringArray') return null;
    return item.value.typed.values;
}
