"use client"

import NetInfo from "@react-native-community/netinfo"
import { useState, useEffect } from "react"

export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected)
    })

    // Check connection immediately
    NetInfo.fetch().then((state) => {
      setIsConnected(state.isConnected)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  return isConnected
}

// Function to check if network is available before making an API call
export const checkNetworkBeforeCall = async (): Promise<boolean> => {
  const state = await NetInfo.fetch()
  return state.isConnected === true
}

