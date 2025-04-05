interface Props {
    status: string;
}

export default function StatusBanner({ status }: Props) {
    return <p className="app-status">{status}</p>;
}
