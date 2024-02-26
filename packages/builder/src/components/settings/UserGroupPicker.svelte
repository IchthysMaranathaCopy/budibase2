<script>
  import { Icon, Search, Layout } from "@budibase/bbui"
  import { createEventDispatcher } from "svelte"

  export let searchTerm = ""
  export let selected
  export let list = []
  export let labelKey
  export let iconComponent = null
  export let extractIconProps = x => x

  const dispatch = createEventDispatcher()

  $: enrichedList = enrich(list, selected)
  $: sortedList = sort(enrichedList)

  const enrich = (list, selected) => {
    return list.map(item => {
      return {
        ...item,
        selected: selected?.find(x => x === item._id) != null,
        isScim: item.scimInfo?.isSync,
      }
    })
  }

  const sort = list => {
    let sortedList = list.slice()
    sortedList.sort((a, b) => {
      if (a.selected === b.selected) {
        return a[labelKey] < b[labelKey] ? -1 : 1
      } else if (a.selected) {
        return -1
      } else if (b.selected) {
        return 1
      }
      return 0
    })
    return sortedList
  }

  function onClick(item) {
    if (item.isScim) {
      return
    }
    dispatch(item.selected ? "deselect" : "select", item._id)
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="container">
  <Layout gap="S">
    <div class="header">
      <Search placeholder="Search" bind:value={searchTerm} />
    </div>
    <div class="items">
      {#each sortedList as item}
        <div
          on:click={() => onClick(item)}
          class="item"
          class:disabled={item.isScim}
          title={item.isScim && "weffrew"}
        >
          {#if iconComponent}
            <svelte:component
              this={iconComponent}
              {...extractIconProps(item)}
            />
          {/if}
          <div class="text">
            {item[labelKey]}
          </div>
          {#if item.selected}
            <div>
              <Icon
                color="var(--spectrum-global-color-blue-600);"
                name="Checkmark"
              />
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </Layout>
</div>

<style>
  .container {
    width: 280px;
  }
  .header {
    align-items: center;
    display: grid;
    gap: var(--spacing-m);
    grid-template-columns: 1fr;
  }
  .items {
    max-height: 242px;
    overflow: auto;
    overflow-x: hidden;
    margin: 0 calc(-1 * var(--spacing-m));
    margin-top: -8px;
  }
  .item {
    display: flex;
    justify-content: space-between;
    padding: var(--spacing-s) var(--spacing-l);
    background: var(--spectrum-global-color-gray-50);
    transition: background 130ms ease-out;
    gap: var(--spacing-m);
    align-items: center;
  }
  .item:hover:not(.disabled) {
    background: var(--spectrum-global-color-gray-100);
    cursor: pointer;
  }

  .disabled {
    opacity: 0.5;
  }

  .text {
    flex: 1 1 auto;
    width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
