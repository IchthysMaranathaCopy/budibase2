<script>
  import { ActionButton } from "@budibase/bbui"
  import { getContext } from "svelte"
  import { auth } from "stores/portal"
  import { sdk } from "@budibase/shared-core"

  export let value
  export let row

  $: isScim = row.scimInfo?.isSync
  $: disabled = !sdk.users.isAdmin($auth.user) || isScim
  $: tooltip = isScim && "User synced externally"

  const userContext = getContext("users")

  const onClick = e => {
    e.stopPropagation()
    userContext.removeUser(value)
  }
</script>

<ActionButton {disabled} size="S" on:click={onClick} {tooltip}
  >Remove</ActionButton
>
