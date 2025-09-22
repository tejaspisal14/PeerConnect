// PeerConnect logo for homepage header
import Image from "next/image";

export default function PeerConnectLogo() {
    return (
        <Image
            src="/peerconnect-logo.png"
            alt="PeerConnect Logo"
            width={48}
            height={48}
            priority
            style={{ marginRight: 8 }}
        />
    );
}
