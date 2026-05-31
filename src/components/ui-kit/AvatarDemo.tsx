import * as React from "react"

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar"

export function AvatarDemo() {
  return (
    <AvatarGroup>
      <Avatar>
        <AvatarImage src="/favicon.svg" alt="" />
        <AvatarFallback>TG</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>PB</AvatarFallback>
      </Avatar>
      <AvatarGroupCount>+3</AvatarGroupCount>
    </AvatarGroup>
  )
}
