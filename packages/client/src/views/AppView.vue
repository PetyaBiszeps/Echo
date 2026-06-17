<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
</script>

<template>
  <section class="flex flex-col gap-10 w-xl">
    <header>
      <h1>Welcome template!</h1>
    </header>

    <main class="flex flex-col gap-10 w-xl">
      <div class="grid w-full max-w-sm items-center gap-2.5">
        <Label for="picture">
          ACCEPT
        </Label>

        <Input
          id="picture"
          type="file"
        />
      </div>

      <Button>Testing</Button>
    </main>
  </section>
</template>
