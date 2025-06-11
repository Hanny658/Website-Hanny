// components/AddContactButton.tsx
"use client"
import React, { FC } from "react";

export interface AddContactButtonProps {
    fullName: string;
    phone: string;
    email?: string;
    fileName?: string;
    className?: string;
    children?: React.ReactNode;
}

/**
 * AddContactButton
 *
 * Click -> trigger a download of the contact .vcf file download for user to save to contact
 * - Export a .vcf in the standard of vCard 3.0 
 */
export const AddContactButton: FC<AddContactButtonProps> = ({
    fullName,
    phone,
    email,
    fileName = "contact",
    className,
    children = "Add to Contact",
}) => {
    const handleClick = () => {
        const lines = [
            "BEGIN:VCARD",
            "VERSION:3.0",
            `FN:${fullName}`,
            `TEL;TYPE=CELL:${phone}`,
        ];
        if (email) {
            lines.push(`EMAIL;TYPE=INTERNET:${email}`);
        }
        lines.push("END:VCARD");
        const vcardText = lines.join("\r\n");

        const blob = new Blob([vcardText], { type: "text/vcard;charset=utf-8" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `${fileName}.vcf`;
        document.body.appendChild(a);
        a.click();

        // clean up
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className={className}
        >
            {children}
        </button>
    );
};

export default AddContactButton;
