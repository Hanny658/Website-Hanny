// components/mail-to-link.tsx
"use client"
import React, { FC } from "react";

export interface MailtoLinkProps {
    email: string;
    subject?: string;
    body?: string;
    className?: string;
    children: React.ReactNode;
}

/**
 * MailtoLink with string encoding
 */
export const MailtoLink: FC<MailtoLinkProps> = ({
    email,
    subject = "",
    body = "",
    className,
    children,
}) => {
    const params: string[] = [];

    if (subject) {
        params.push(`subject=${encodeURIComponent(subject)}`);
    }
    if (body) {
        params.push(`body=${encodeURIComponent(body)}`);
    }

    const href = `mailto:${email}${params.length ? `?${params.join("&")}` : ""}`;

    return (
        <a
            href={href}
            className={className}
            rel="noopener noreferrer"
        >
            {children}
        </a>
    );
};

export default MailtoLink;
