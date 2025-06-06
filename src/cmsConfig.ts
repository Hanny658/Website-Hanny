// src/cmsConfig.ts

export type FieldDef = {
    /** The exact field name as it is in Prisma model */
    name: string
    /** The label for form display */
    label?: string
    /** Type of each field */
    type: 'string' | 'int' | 'float' | 'datetime' | 'image-url'
    /** Whether trigger file-uploader */
    isFile?: boolean
    /** Does not render to update or add new */
    isReadOnly?: boolean
}

/**
 * CMSConfig：Stres all models that supported by CMS,
 * Make sure the key shall be first line of each model
 */
export const CMSConfig: Record<string, FieldDef[]> = {
    Place: [
        { name: 'identifier', type: 'string', label: 'Identifier' },
        { name: 'name', type: 'string', label: 'Name' },
        { name: 'lng', type: 'float', label: 'Longitude' },
        { name: 'lat', type: 'float', label: 'Latitude' },
    ],
    Cheapie: [
        { name: 'id', type: 'int', label: 'ID',  isReadOnly: true },
        { name: 'name', type: 'string', label: 'Name' },
        { name: 'store', type: 'string', label: 'Store Identifier' },
        { name: 'quantity', type: 'int', label: 'Quantity' },
        { name: 'price', type: 'float', label: 'Price' },
        { name: 'exp', type: 'datetime', label: 'Expiration Date' },
        {
            name: 'image',
            type: 'image-url',
            label: 'Image',
            isFile: true, // in forms: <input type="file" />
        },
    ],
}
