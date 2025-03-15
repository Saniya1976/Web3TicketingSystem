import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";

const WalletConnect = ({ setSigner }: { setSigner: (signer: ethers.Signer) => void }) => {
    const [account, setAccount] = useState<string | null>(null);
    const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);

    useEffect(() => {
        const checkConnection = async () => {
            const web3Modal = new Web3Modal();
            if (web3Modal.cachedProvider) {
                await connectWallet();
            }
        };
        checkConnection();
    }, []);

    const connectWallet = async () => {
        try {
            const web3Modal = new Web3Modal({
                cacheProvider: true,
            });

            const connection = await web3Modal.connect();
            const web3Provider = new ethers.providers.Web3Provider(connection);
            
            if (!web3Provider) throw new Error("No provider found"); // Ensure provider exists
            
            setProvider(web3Provider);
            const signer = web3Provider.getSigner();
            const address = await signer.getAddress();

            setAccount(address);
            setSigner(signer);
        } catch (error) {
            console.error("Wallet connection failed:", error);
        }
    };

    return (
        <div className="p-4">
            {account ? (
                <p className="text-green-500">Connected: {account}</p>
            ) : (
                <button onClick={connectWallet} className="p-2 bg-blue-500 text-white rounded">
                    Connect Wallet
                </button>
            )}
        </div>
    );
};

export default WalletConnect;
