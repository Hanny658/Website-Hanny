// src/cmsConfig.ts

export type FieldDef = {
    /** The exact field name as it is in Prisma model */
    name: string
    /** The label for form display */
    label?: string
    /** Type of each field */
    type: 'string' | 'int' | 'float' | 'datetime' | 'image-url' | 'enum'
    /** Whether trigger file-uploader */
    isFile?: boolean
    /** Does not render to update or add new */
    isReadOnly?: boolean
    /** mark a field that is optional, which will make it not checked when submit new ones */
    isOptional?: boolean 
    /** mark a field to be enum, which make the input as selection */
    enumOptions?: string[]
}


/**
 * CMSConfig：Stres all models that supported by CMS,
 * Make sure the key shall be first line of each model
 */
export const CMSConfig: Record<string, FieldDef[]> = {
    User: [
        { name: 'id', type: 'string', label: 'Id', isReadOnly: true },
        { name: 'name', type: 'string', label: 'User Name' },
        { name: 'email', type: 'string', label: 'Email' },
        { name: 'password', type: 'string', label: 'Password' },
        { name: 'createdAt', type: 'datetime', label: 'Created At', isReadOnly: true },
    ],
    Place: [
        { name: 'identifier', type: 'string', label: 'Identifier' },
        { name: 'name', type: 'string', label: 'Name' },
        { name: 'lng', type: 'float', label: 'Longitude' },
        { name: 'lat', type: 'float', label: 'Latitude' },
    ],
    Cheapie: [
        { name: 'id', type: 'int', label: 'ID', isReadOnly: true },
        { name: 'name', type: 'string', label: 'Name' },
        { name: 'store', type: 'string', label: 'Store Identifier' },
        { name: 'quantity', type: 'int', label: 'Quantity' },
        { name: 'price', type: 'float', label: 'Price' },
        { name: 'exp', type: 'datetime', label: 'Expiration Date', isOptional: true },
        {
            name: 'image',
            type: 'image-url',
            label: 'Image',
            isFile: true, // in forms: <input type="file" />
            isOptional: true
        },
        {
            name: 'stock',
            type: 'enum',
            label: 'Stock Level',
            enumOptions: ['plenty', 'mid', 'low', 'gone'],
        },
        {
            name: 'createdAt',
            type: 'datetime',
            label: 'Created At',
            isReadOnly: true,
        },
    ],
}
