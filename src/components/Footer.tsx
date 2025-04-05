export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                <p className="footer-text">
                    © {new Date().getFullYear()} Financial Dashboard
                </p>
            </div>
        </footer>
    );
}
