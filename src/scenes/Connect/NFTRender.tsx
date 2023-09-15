import { ThirdwebNftMedia, useContract, useNFT } from "@thirdweb-dev/react";

export default function NFT() {
  // Connect to your NFT contract
  const { contract } = useContract("0xc36442b4a4522e871399cd717abdd847ab11fe88");
  // Load the NFT metadata from the contract using a hook
  const { data: nft, isLoading, error } = useNFT(contract, "0");

  // Render the NFT onto the UI
  if (isLoading) return <div>Loading...</div>;
  if (error || !nft) return <div>NFT not found</div>;

  return <ThirdwebNftMedia metadata={nft.metadata} />;
}
