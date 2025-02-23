"use client"

import type React from "react"

import { useState } from "react"
import { useContract, useContractWrite, Web3Button } from "@thirdweb-dev/react"
import { parseEther } from "viem"
import { CalendarIcon, ImagePlus, Loader2 } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { uploadToIPFS, uploadMetadataToIPFS } from "@/lib/ipfs"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { FormControl, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string

export function MintTicketForm() {
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string>("")
  const [formData, setFormData] = useState({
    eventName: "",
    venue: "",
    section: "",
    seat: "",
    price: "",
    eventDate: new Date(),
    image: null as File | null,
    additionalDetails: "",
  })

  const { contract } = useContract(CONTRACT_ADDRESS)
  const { mutateAsync: mintTicket, isLoading } = useContractWrite(contract, "mintTicket")

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, image: file })
      setPreviewImage(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsUploading(true)

      // Upload image to IPFS
      let imageURI = ""
      if (formData.image) {
        imageURI = await uploadToIPFS(formData.image)
      }

      // Create and upload metadata
      const metadata = {
        eventName: formData.eventName,
        venue: formData.venue,
        section: formData.section,
        seat: formData.seat,
        imageURI,
        additionalDetails: formData.additionalDetails,
      }

      const metadataCID = await uploadMetadataToIPFS(metadata)

      // Convert date to Unix timestamp
      const eventUnixTime = Math.floor(formData.eventDate.getTime() / 1000)

      // Mint ticket
      await mintTicket({
        args: [
          "0x0000000000000000000000000000000000000000", // To address (will be set by contract)
          0, // Event ID
          parseEther(formData.price),
          eventUnixTime,
          metadataCID,
          metadata,
        ],
      })

      toast({
        title: "Success",
        description: "Ticket minted successfully!",
      })

      // Reset form
      setFormData({
        eventName: "",
        venue: "",
        section: "",
        seat: "",
        price: "",
        eventDate: new Date(),
        image: null,
        additionalDetails: "",
      })
      setPreviewImage("")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Mint New Ticket</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormItem>
            <FormLabel>Event Name</FormLabel>
            <FormControl>
              <Input
                required
                value={formData.eventName}
                onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
              />
            </FormControl>
          </FormItem>

          <FormItem>
            <FormLabel>Venue</FormLabel>
            <FormControl>
              <Input
                required
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              />
            </FormControl>
          </FormItem>

          <div className="grid grid-cols-2 gap-4">
            <FormItem>
              <FormLabel>Section</FormLabel>
              <FormControl>
                <Input
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Seat</FormLabel>
              <FormControl>
                <Input value={formData.seat} onChange={(e) => setFormData({ ...formData, seat: e.target.value })} />
              </FormControl>
            </FormItem>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormItem>
              <FormLabel>Price (ETH)</FormLabel>
              <FormControl>
                <Input
                  required
                  type="number"
                  step="0.000001"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Event Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !formData.eventDate && "text-muted-foreground",
                      )}
                    >
                      {formData.eventDate ? format(formData.eventDate, "PPP") : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.eventDate}
                    onSelect={(date) => date && setFormData({ ...formData, eventDate: date })}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </FormItem>
          </div>

          <FormItem>
            <FormLabel>Event Image</FormLabel>
            <FormControl>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("image-upload")?.click()}
                  className="gap-2"
                >
                  <ImagePlus className="h-4 w-4" />
                  Upload Image
                </Button>
                <Input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                {previewImage && (
                  <img
                    src={previewImage || "/placeholder.svg"}
                    alt="Preview"
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                )}
              </div>
            </FormControl>
          </FormItem>

          <FormItem>
            <FormLabel>Additional Details</FormLabel>
            <FormControl>
              <Textarea
                value={formData.additionalDetails}
                onChange={(e) => setFormData({ ...formData, additionalDetails: e.target.value })}
                rows={4}
              />
            </FormControl>
          </FormItem>

          <Web3Button
            contractAddress={CONTRACT_ADDRESS}
            action={handleSubmit}
            isDisabled={isUploading || isLoading}
            className="w-full"
          >
            {isUploading || isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isUploading ? "Uploading..." : "Minting..."}
              </>
            ) : (
              "Mint Ticket"
            )}
          </Web3Button>
        </form>
      </CardContent>
    </Card>
  )
}

