<template>
  <main class="w-full h-svh p-2 flex justify-center items-center">
    <Card class="max-w-sm">
      <CardHeader>
        <CardTitle class="text-2xl"> Register </CardTitle>
        <CardDescription> Enter your details below to create your account </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit="handleSubmit">
          <div class="grid gap-4">
            <div class="grid gap-2">
              <Label for="fullname">Name</Label>
              <Input id="fullname" name="fullname" type="text" placeholder="Your Name" required />
              <ul v-if="isNameFieldError.length" class="bg-destructive text-destructive-foreground text-xs md:text-sm p-2">
                <li v-for="error in isNameFieldError" :key="error" class="list-disc list-inside">
                  {{ error }}
                </li>
              </ul>
            </div>
            <div class="grid gap-2">
              <Label for="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required />
              <ul v-if="isEmailFieldError.length" class="bg-destructive text-destructive-foreground text-xs md:text-sm p-2">
                <li v-for="error in isEmailFieldError" :key="error" class="list-disc list-inside">
                  {{ error }}
                </li>
              </ul>
            </div>
            <div class="grid gap-2">
              <Label for="password">Password</Label>
              <div class="relative">
                <Input id="password" name="password" :type="isInputPasswordVisible ? 'text' : 'password'" class="pr-10" required />
                <div class="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer" @click="isInputPasswordVisible = !isInputPasswordVisible">
                  <EyeOpenIcon class="size-4" v-if="isInputPasswordVisible" />
                  <EyeClosedIcon class="size-4" v-else />
                </div>
              </div>
              <ul v-if="isPasswordFieldError.length" class="bg-destructive text-destructive-foreground text-xs md:text-sm p-2">
                <li v-for="error in isPasswordFieldError" :key="error" class="list-disc list-inside">
                  {{ error }}
                </li>
              </ul>
            </div>
            <Button type="submit" class="w-full">
              <ReloadIcon class="size-5 mr-2 animate-spin" v-if="isSubmiting" />
              {{ isSubmiting ? 'Please wait' : 'Register' }}
            </Button>
          </div>
          <div class="mt-4 text-center text-sm">
            Already have an account?
            <NuxtLink to="/login" class="underline"> Sign in </NuxtLink>
          </div>
        </form>
      </CardContent>
    </Card>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useToast } from '@/components/ui/toast/use-toast';
import { EyeOpenIcon, EyeClosedIcon, ReloadIcon } from '@radix-icons/vue';

const router = useRouter();
const config = useRuntimeConfig();
const { toast } = useToast();
const isInputPasswordVisible = ref(false);
const isSubmiting = ref(false);
const isNameFieldError = ref<string[]>([]);
const isEmailFieldError = ref<string[]>([]);
const isPasswordFieldError = ref<string[]>([]);

async function handleSubmit(e: Event) {
  e.preventDefault();

  const form = e.target as HTMLFormElement;
  const name = form.fullname.value;
  const email = form.email.value;
  const password = form.password.value;

  if (isSubmiting.value || !name || !email || !password) return;

  isSubmiting.value = true;

  try {
    const url = config.public.registerURL;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      isNameFieldError.value = [];
      isEmailFieldError.value = [];
      isPasswordFieldError.value = [];

      if (Array.isArray(data.error)) {
        data.error.forEach((error: any) => {
          if (error.path[0] === 'name') isNameFieldError.value.push(error.message);
          if (error.path[0] === 'email') isEmailFieldError.value.push(error.message);
          if (error.path[0] === 'password') isPasswordFieldError.value.push(error.message);
        });
        throw new Error('Invalid input fields');
      }

      throw new Error(data.error);
    }

    toast({
      title: 'Registration Success',
      description: `Welcome ${name}`,
    });

    router.replace({ path: '/' });
  } catch (error: any) {
    toast({
      title: 'Uh oh! Something went wrong.',
      description: error.message,
      variant: 'destructive',
    });
  } finally {
    isSubmiting.value = false;
  }
}
</script>
