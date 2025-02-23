"use client"

import { ConnectWallet } from "@thirdweb-dev/react"

export function ConnectWalletButton() {
  return (
    <ConnectWallet
      theme="light"
      btnTitle="Connect Wallet"
      className="!bg-primary !text-white hover:!bg-primary/90"
      style={{
        backgroundColor: "#2563EB",
        color: "white",
        borderRadius: "0.5rem",
        padding: "0.5rem 1rem",
      }}
    />
  )
}

