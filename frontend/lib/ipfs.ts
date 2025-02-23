export async function uploadToIPFS(file: File) {
  try {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("https://api.web3.storage/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_IPFS_KEY}`,
      },
      body: formData,
    })

    const data = await response.json()
    return `ipfs://${data.cid}`
  } catch (error) {
    console.error("Error uploading to IPFS:", error)
    throw new Error("Failed to upload to IPFS")
  }
}

export async function uploadMetadataToIPFS(metadata: any) {
  try {
    const blob = new Blob([JSON.stringify(metadata)], { type: "application/json" })
    const file = new File([blob], "metadata.json")

    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("https://api.web3.storage/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_IPFS_KEY}`,
      },
      body: formData,
    })

    const data = await response.json()
    return `ipfs://${data.cid}`
  } catch (error) {
    console.error("Error uploading metadata to IPFS:", error)
    throw new Error("Failed to upload metadata to IPFS")
  }
}

