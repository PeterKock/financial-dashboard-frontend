// src/layout/Layout.tsx
import Header from '../components/Header';
import Footer from '../components/Footer';
import React from "react";

interface Props {
    children: React.ReactNode;
}

export default function Layout({ children }: Props) {
    return (
        <div className="app-root">
            <Header />
            <main className="app-container flex-1">{children}</main>
            <Footer />
        </div>
    );
}